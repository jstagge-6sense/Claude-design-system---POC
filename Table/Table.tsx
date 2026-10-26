import {
  Fragment, forwardRef, useCallback, useEffect, useId, useRef, useState,
  type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactElement, type ReactNode, type Ref,
} from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { EmptyState } from '../EmptyState'
import { SkeletonLoader } from '../SkeletonLoader'
import { Truncate } from '../Truncate'
import { useStuck } from '../Sticky'
import styles from './Table.module.css'

export type SortDirection = 'ascending' | 'descending'
export interface TableSort { columnId: string; direction: SortDirection }

export interface TableColumn<T> {
  /** Stable id. Also the default row field to read when no `accessor` or `cell` is given. */
  id: string
  /** Column header text. Always required: it is the accessible name. */
  header: string
  /** Row field name or function that returns the cell content. */
  accessor?: keyof T | ((row: T) => ReactNode)
  /** Full control of the cell content. Wins over `accessor`. */
  cell?: (row: T) => ReactNode
  /** Shows a sort button with a direction icon and sets aria-sort. */
  sortable?: boolean
  /** fixed: exactly `width`. fluid: grows to fill, never below `minWidth`. minmax: between `minWidth` and `maxWidth`. */
  sizing?: 'fixed' | 'fluid' | 'minmax'
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  align?: 'start' | 'center' | 'end'
  /** Secondary text style: smaller and de-emphasized by color, for supporting information. */
  secondary?: boolean
  /** Truncate string cells with an ellipsis. `true` is one line, a number is that many lines. Full text stays accessible. */
  truncate?: boolean | number
  /** Enter on the cell starts inline editing. Needs `onCellEdit` on the table. */
  editable?: boolean
  /** Renders the cells of this column as row headers (th scope="row"). Use it for the column that names the row. */
  rowHeader?: boolean
}

export interface TableErrorState {
  title?: ReactNode
  description?: ReactNode
  onRetry?: () => void
}

export interface TableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** Accessible name of the table. Rendered as a visually hidden caption. */
  caption: string
  columns: TableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  /** Column order and visibility are state held by the caller (see useTableColumns). The table renders what it is given. */
  columnOrder?: string[]
  hiddenColumnIds?: string[]
  /** Current sort. The caller sorts `rows`. */
  sort?: TableSort | null
  onSortChange?: (sort: TableSort | null) => void
  /** none: no checkboxes. single: one row at a time. multiple: select-all plus bulk selection. */
  selectionMode?: 'none' | 'single' | 'multiple'
  selectedIds?: string[]
  defaultSelectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  /** Accessible name for a row, used in checkbox, expand and edit labels. Defaults to the first column value. */
  getRowLabel?: (row: T) => string
  /** default is about 48px per row, dense about 32px. */
  density?: 'default' | 'dense'
  loading?: boolean
  loadingRows?: number
  /** Table-level error. Replaces the body with an error empty state and a retry. */
  error?: boolean | TableErrorState
  /** Row-level errors by row id. The message shows under the row. */
  rowErrors?: Record<string, ReactNode>
  onRowRetry?: (rowId: string) => void
  /** Replaces the default empty state. Use an EmptyState with a path forward. */
  emptyState?: ReactNode
  /** Row drill-down. Return the detail content to make rows expandable. */
  renderExpanded?: (row: T) => ReactNode
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Called when an inline edit is committed with Enter or by leaving the field. Escape cancels. */
  onCellEdit?: (rowId: string, columnId: string, value: string) => void
  stickyHeader?: boolean
  /** Pins the selection, expand and first data columns during horizontal scroll. */
  stickyFirstColumn?: boolean
  /** Height of the scroll frame, for example 360 or "50vh". Enables vertical scroll and a working sticky header. */
  maxHeight?: number | string
  /** Slot under the table for pagination or a summary. The table is linked to it with aria-describedby. */
  footer?: ReactNode
  /** Slot above the table for a DataTableToolbar. */
  toolbar?: ReactNode
  /** Force row hover for docs and previews. Do not use in product code. */
  rowDataState?: Record<string, 'hover'>
}

const px = (v?: number | string) => (typeof v === 'number' ? `${v}px` : v)

function colStyle<T>(c: TableColumn<T>): CSSProperties {
  const sizing = c.sizing ?? 'fluid'
  if (sizing === 'fixed') { const w = px(c.width ?? 160); return { inlineSize: w, minInlineSize: w, maxInlineSize: w } }
  if (sizing === 'minmax') return { minInlineSize: px(c.minWidth ?? 120), maxInlineSize: px(c.maxWidth ?? 320), inlineSize: px(c.width) }
  return { minInlineSize: px(c.minWidth ?? 120), inlineSize: px(c.width) }
}

function rawValue<T>(c: TableColumn<T>, row: T): unknown {
  if (typeof c.accessor === 'function') return c.accessor(row)
  return (row as Record<string, unknown>)[(c.accessor as string | undefined) ?? c.id]
}
function renderValue<T>(c: TableColumn<T>, row: T): ReactNode {
  if (c.cell) return c.cell(row)
  const v = rawValue(c, row) as ReactNode
  if (c.truncate && (typeof v === 'string' || typeof v === 'number')) {
    return <Truncate lines={c.truncate === true ? 1 : c.truncate}>{String(v)}</Truncate>
  }
  return v
}

/* ---- Inline editing cell ---- */
interface EditCellProps { display: ReactNode; text: string; header: string; rowLabel: string; onCommit: (v: string) => void }
function EditCell({ display, text, header, rowLabel, onCommit }: EditCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const btn = useRef<HTMLButtonElement>(null)
  const inp = useRef<HTMLInputElement>(null)
  const done = useRef(false)
  const refocus = useRef(false)

  useEffect(() => {
    if (editing) { inp.current?.focus(); inp.current?.select() }
    else if (refocus.current) { refocus.current = false; btn.current?.focus() }
  }, [editing])

  const start = () => { done.current = false; setDraft(text); setEditing(true) }
  const finish = (commit: boolean, viaKey: boolean) => {
    if (done.current) return
    done.current = true
    refocus.current = viaKey
    if (commit && draft !== text) onCommit(draft)
    setEditing(false)
  }
  if (editing) {
    return (
      <input
        ref={inp}
        className={styles.editor}
        value={draft}
        aria-label={`Edit ${header} for ${rowLabel}`}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); finish(true, true) }
          else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false, true) }
        }}
        onBlur={() => finish(true, false)}
      />
    )
  }
  return (
    <button ref={btn} type="button" className={styles.editBtn} onClick={start}>
      <span className={styles.editValue}>{display}</span>
      <Icon name="edit" className={styles.editIcon} />
      <VisuallyHidden>{`${header} for ${rowLabel}. Press Enter to edit, Escape to cancel.`}</VisuallyHidden>
    </button>
  )
}

function TableInner<T>(
  {
    caption, columns, rows, getRowId, columnOrder, hiddenColumnIds, sort, onSortChange,
    selectionMode = 'none', selectedIds, defaultSelectedIds, onSelectionChange, getRowLabel,
    density = 'default', loading = false, loadingRows = 5, error, rowErrors, onRowRetry, emptyState,
    renderExpanded, expandedIds, defaultExpandedIds, onExpandedChange, onCellEdit,
    stickyHeader = false, stickyFirstColumn = false, maxHeight, footer, toolbar, rowDataState,
    className, style, ...rest
  }: TableProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const uid = useId()
  const footerId = `${uid}-footer`
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useControllableState<string[]>(selectedIds, defaultSelectedIds ?? [], onSelectionChange)
  const [expanded, setExpanded] = useControllableState<string[]>(expandedIds, defaultExpandedIds ?? [], onExpandedChange)
  const [announce, setAnnounce] = useState('')
  const [scrolledX, setScrolledX] = useState(false)
  const [scrollable, setScrollable] = useState(false)
  const { ref: headStuckRef, stuck } = useStuck<HTMLTableCellElement>({ edge: 'top', root: scrollRef, enabled: stickyHeader })

  // Resolve column order and visibility.
  const ordered = columnOrder
    ? [...columnOrder.flatMap((id) => columns.filter((c) => c.id === id)), ...columns.filter((c) => !columnOrder.includes(c.id))]
    : columns
  const visible = ordered.filter((c) => !(hiddenColumnIds ?? []).includes(c.id))

  const selectable = selectionMode !== 'none'
  const expandable = Boolean(renderExpanded)
  const ctrlCount = (selectable ? 1 : 0) + (expandable ? 1 : 0)
  const colSpan = visible.length + ctrlCount
  const rowIds = rows.map(getRowId)
  const selectedCount = rowIds.filter((id) => selected.includes(id)).length
  const allSelected = rows.length > 0 && selectedCount === rows.length

  const labelOf = (row: T) => {
    if (getRowLabel) return getRowLabel(row)
    const first = visible[0]
    const v = first ? rawValue(first, row) : undefined
    return typeof v === 'string' || typeof v === 'number' ? String(v) : getRowId(row)
  }

  const say = (ids: string[]) => setAnnounce(ids.length === 0 ? 'Selection cleared' : `${ids.length} ${ids.length === 1 ? 'row' : 'rows'} selected`)
  const toggleRow = (id: string, on: boolean) => {
    const next = selectionMode === 'single' ? (on ? [id] : []) : on ? [...selected.filter((x) => x !== id), id] : selected.filter((x) => x !== id)
    setSelected(next); say(next)
  }
  const toggleAll = (on: boolean) => { const next = on ? rowIds : []; setSelected(next); say(next) }
  const toggleExpand = (id: string) => setExpanded(expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id])

  const cycleSort = (c: TableColumn<T>) => {
    const dir = sort?.columnId === c.id ? sort.direction : undefined
    const next: TableSort | null = dir === undefined ? { columnId: c.id, direction: 'ascending' } : dir === 'ascending' ? { columnId: c.id, direction: 'descending' } : null
    onSortChange?.(next)
    setAnnounce(next ? `Sorted by ${c.header}, ${next.direction}` : `Sort removed from ${c.header}`)
  }

  // Arrow keys move between header sort buttons. Home and End jump to the first and last.
  const onHeadKeyDown = (e: KeyboardEvent<HTMLTableSectionElement>) => {
    const t = e.target as HTMLElement
    if (!t.hasAttribute('data-sort-btn')) return
    const btns = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-sort-btn]'))
    const i = btns.indexOf(t)
    const rtl = getComputedStyle(t).direction === 'rtl'
    let to = -1
    if (e.key === 'ArrowRight') to = i + (rtl ? -1 : 1)
    else if (e.key === 'ArrowLeft') to = i + (rtl ? 1 : -1)
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = btns.length - 1
    if (to < 0 || to >= btns.length) return
    e.preventDefault()
    btns[to].focus()
  }

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setScrollable(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
    setScrolledX(Math.abs(el.scrollLeft) > 0)
  }, [])
  useEffect(() => {
    measure()
    const el = scrollRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [measure, rows.length, visible.length, density, loading])

  const bodyState: 'loading' | 'error' | 'empty' | 'rows' = loading ? 'loading' : error ? 'error' : rows.length === 0 ? 'empty' : 'rows'
  const err: TableErrorState = typeof error === 'object' ? error : {}

  const rootVars = {
    '--_ctrl-n': ctrlCount,
    '--_exp-n': selectable ? 1 : 0,
    ...(maxHeight != null ? { '--_max-h': px(maxHeight) } : null),
    ...style,
  } as CSSProperties

  const firstHeaderRef = headStuckRef
  const pin = (kind: 'sel' | 'exp' | 'first' | undefined) => (stickyFirstColumn && kind ? kind : undefined)

  return (
    <div
      ref={ref}
      className={cx(styles.root, className)}
      data-density={density}
      data-sticky-header={stickyHeader || undefined}
      data-sticky-col={stickyFirstColumn || undefined}
      data-stuck={stuck || undefined}
      data-scrolled-x={scrolledX || undefined}
      style={rootVars}
      {...rest}
    >
      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}
      <div
        ref={scrollRef}
        className={styles.scroll}
        data-max-height={maxHeight != null || undefined}
        onScroll={measure}
        tabIndex={scrollable ? 0 : undefined}
        role={scrollable ? 'region' : undefined}
        aria-label={scrollable ? `${caption}, scrollable` : undefined}
      >
        <table
          className={styles.table}
          aria-busy={loading || undefined}
          aria-describedby={footer ? footerId : undefined}
        >
          <caption className="ds-visually-hidden">{caption}</caption>
          <thead className={styles.head} onKeyDown={onHeadKeyDown}>
            <tr>
              {selectable ? (
                <th scope="col" className={cx(styles.th, styles.ctrl)} data-pin={pin('sel')}>
                  {selectionMode === 'multiple' ? (
                    <Checkbox
                      label={<VisuallyHidden>Select all rows</VisuallyHidden>}
                      aria-label="Select all rows"
                      checked={allSelected}
                      indeterminate={selectedCount > 0 && !allSelected}
                      disabled={rows.length === 0 || loading}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  ) : <VisuallyHidden>Select row</VisuallyHidden>}
                </th>
              ) : null}
              {expandable ? (
                <th scope="col" className={cx(styles.th, styles.ctrl)} data-pin={pin('exp')}><VisuallyHidden>Expand row</VisuallyHidden></th>
              ) : null}
              {visible.map((c, i) => {
                const active = sort?.columnId === c.id
                const pinned = i === 0 ? pin('first') : undefined
                return (
                  <th
                    key={c.id}
                    scope="col"
                    ref={i === 0 ? firstHeaderRef : undefined}
                    className={styles.th}
                    style={colStyle(c)}
                    data-align={c.align}
                    data-pin={pinned}
                    data-pin-last={pinned ? true : undefined}
                    aria-sort={c.sortable ? (active ? sort!.direction : 'none') : undefined}
                  >
                    {c.sortable ? (
                      <button type="button" className={styles.sortBtn} data-sort-btn data-active={active || undefined} onClick={() => cycleSort(c)}>
                        <span>{c.header}</span>
                        <Icon name={active ? (sort!.direction === 'ascending' ? 'arrowUp' : 'arrowDown') : 'sort'} className={styles.sortIcon} />
                      </button>
                    ) : c.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {bodyState === 'loading' ? (
              <tr><td colSpan={colSpan} className={styles.fullCell}>
                <SkeletonLoader variant="table" rows={loadingRows} columns={Math.max(1, visible.length)} label="Loading table rows" />
              </td></tr>
            ) : null}
            {bodyState === 'error' ? (
              <tr><td colSpan={colSpan} className={styles.fullCell}>
                <EmptyState
                  variant="error"
                  size="compact"
                  title={err.title ?? 'We couldn’t load this table'}
                  description={err.description ?? 'The data didn’t come back. Try again, and contact support if it keeps happening.'}
                  onRetry={err.onRetry ?? (() => undefined)}
                />
              </td></tr>
            ) : null}
            {bodyState === 'empty' ? (
              <tr><td colSpan={colSpan} className={styles.fullCell}>
                {emptyState ?? <EmptyState minimal title="Nothing to show" description="There are no rows yet." />}
              </td></tr>
            ) : null}
            {bodyState === 'rows' ? rows.map((row, ri) => {
              const id = rowIds[ri]
              const isSel = selected.includes(id)
              const isOpen = expandable && expanded.includes(id)
              const label = labelOf(row)
              const errMsg = rowErrors?.[id]
              const detailId = `${uid}-d${ri}`
              const errId = `${uid}-e${ri}`
              return (
                <Fragment key={id}>
                  <tr
                    className={styles.row}
                    data-selected={isSel || undefined}
                    data-error={errMsg ? true : undefined}
                    data-state={rowDataState?.[id]}
                    aria-selected={selectable ? isSel : undefined}
                    aria-describedby={errMsg ? errId : undefined}
                  >
                    {selectable ? (
                      <td className={cx(styles.ctrl, styles.td)} data-pin={pin('sel')}>
                        <Checkbox
                          label={<VisuallyHidden>{`Select ${label}`}</VisuallyHidden>}
                          aria-label={`Select ${label}`}
                          checked={isSel}
                          onChange={(e) => toggleRow(id, e.target.checked)}
                        />
                      </td>
                    ) : null}
                    {expandable ? (
                      <td className={cx(styles.ctrl, styles.td)} data-pin={pin('exp')}>
                        <button
                          type="button"
                          className={styles.expandBtn}
                          aria-expanded={isOpen}
                          aria-controls={detailId}
                          aria-label={`${isOpen ? 'Collapse' : 'Expand'} details for ${label}`}
                          onClick={() => toggleExpand(id)}
                        >
                          <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} />
                        </button>
                      </td>
                    ) : null}
                    {visible.map((c, ci) => {
                      const Cell = (c.rowHeader ? 'th' : 'td') as 'td'
                      const pinned = ci === 0 ? pin('first') : undefined
                      const content = renderValue(c, row)
                      const edit = c.editable && onCellEdit
                      const raw = rawValue(c, row)
                      return (
                        <Cell
                          key={c.id}
                          scope={c.rowHeader ? 'row' : undefined}
                          className={cx(styles.td, c.secondary ? styles.secondary : styles.primary)}
                          style={colStyle(c)}
                          data-align={c.align}
                          data-pin={pinned}
                          data-pin-last={pinned ? true : undefined}
                          data-editable={edit || undefined}
                        >
                          {edit ? (
                            <EditCell
                              display={content}
                              text={raw == null ? '' : String(raw)}
                              header={c.header}
                              rowLabel={label}
                              onCommit={(v) => onCellEdit!(id, c.id, v)}
                            />
                          ) : content}
                        </Cell>
                      )
                    })}
                  </tr>
                  {errMsg ? (
                    <tr className={styles.errorRow} data-error="true">
                      <td colSpan={colSpan} className={styles.errorCell}>
                        <span id={errId} className={styles.errorText}>
                          <Icon name="error" />
                          <span>{errMsg}</span>
                        </span>
                        {onRowRetry ? <Button size="small" priority="tertiary" onClick={() => onRowRetry(id)}>{`Retry ${label}`}</Button> : null}
                      </td>
                    </tr>
                  ) : null}
                  {isOpen ? (
                    <tr id={detailId} className={styles.detailRow}>
                      <td colSpan={colSpan} className={styles.detail}>{renderExpanded!(row)}</td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            }) : null}
          </tbody>
        </table>
      </div>
      {footer ? <div id={footerId} className={styles.footer}>{footer}</div> : null}
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
    </div>
  )
}

/** Generic, typed table. `columns`, `rows` and `getRowId` are the whole data contract. */
export const Table = forwardRef(TableInner) as <T>(props: TableProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement
