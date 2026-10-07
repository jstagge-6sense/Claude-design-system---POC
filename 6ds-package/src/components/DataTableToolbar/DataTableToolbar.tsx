import {
  forwardRef, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useClickOutside, useEscapeKey } from '../../primitives/hooks'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Search } from '../Search'
import { useStuck } from '../Sticky'
import styles from './DataTableToolbar.module.css'

export interface ToolbarColumn {
  id: string
  label: string
  visible: boolean
  /** Locked columns (for example the row name) cannot be hidden. */
  locked?: boolean
}

export interface DataTableToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Accessible name of the toolbar. */
  label?: string
  /** Search within the table. Pass `false` to remove it. */
  search?: boolean
  searchValue?: string
  defaultSearchValue?: string
  onSearchChange?: (value: string) => void
  searchLabel?: string
  searchPlaceholder?: string
  /** Number of active filters. Shown on the filter button and announced. */
  activeFilterCount?: number
  /** Called when the filter button is used. The caller owns the filter UI. Omit to hide the filter button. */
  onFilterClick?: () => void
  filterExpanded?: boolean
  /** Shown next to the filter button when filters are active. */
  onClearFilters?: () => void
  /** Column configuration, in the order shown. Omit to hide the Columns control. State is held by the caller. */
  columns?: ToolbarColumn[]
  onToggleColumn?: (id: string, visible: boolean) => void
  onMoveColumn?: (id: string, direction: 'up' | 'down') => void
  onResetColumns?: () => void
  /** Open the column panel on first render, for docs. */
  defaultColumnsOpen?: boolean
  density?: 'default' | 'dense'
  /** Called when the density toggle changes. Omit to hide the toggle. */
  onDensityChange?: (density: 'default' | 'dense') => void
  /** Called when Export is used. Omit to hide it. */
  onExport?: () => void
  exportLabel?: string
  exportLoading?: boolean
  /** Number of selected rows. The bulk action bar shows only when this is above 0. */
  selectedCount?: number
  /** Bulk actions (Buttons). Only rendered while rows are selected. */
  bulkActions?: ReactNode
  onClearSelection?: () => void
  /** Extra controls at the end of the toolbar. */
  trailing?: ReactNode
  /** Pin the toolbar to the top of its scroll container while the table is partly scrolled. */
  sticky?: boolean
}

const FOCUSABLE = 'button:not([aria-disabled="true"]):not([disabled]), input:not([disabled])'

export const DataTableToolbar = forwardRef<HTMLDivElement, DataTableToolbarProps>(function DataTableToolbar(
  {
    label = 'Table toolbar', search = true, searchValue, defaultSearchValue = '', onSearchChange, searchLabel = 'Search table', searchPlaceholder = 'Search',
    activeFilterCount = 0, onFilterClick, filterExpanded, onClearFilters,
    columns, onToggleColumn, onMoveColumn, onResetColumns, defaultColumnsOpen = false,
    density = 'default', onDensityChange, onExport, exportLabel = 'Export', exportLoading = false,
    selectedCount = 0, bulkActions, onClearSelection, trailing, sticky = false, className, ...rest
  },
  ref,
) {
  const uid = useId()
  const panelId = `${uid}-columns`
  const [query, setQuery] = useControllableState<string>(searchValue, defaultSearchValue, onSearchChange)
  const [colsOpen, setColsOpen] = useState(defaultColumnsOpen)
  const [moved, setMoved] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const colBtn = useRef<HTMLButtonElement>(null)
  const { ref: stuckRef, stuck } = useStuck<HTMLDivElement>({ edge: 'top', enabled: sticky })

  const merged = useMemo(() => mergeRefs(ref, stuckRef), [ref, stuckRef])

  useClickOutside([wrapRef], () => setColsOpen(false), colsOpen)
  useEscapeKey(() => { setColsOpen(false); colBtn.current?.focus() }, colsOpen)

  const filterText = activeFilterCount > 0 ? `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} applied` : 'No filters applied'
  const hasSelection = selectedCount > 0
  const selectionText = `${selectedCount} ${selectedCount === 1 ? 'row' : 'rows'} selected`

  // Arrow keys move between toolbar buttons. Text fields keep their own arrow keys.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    if (t.tagName === 'INPUT' || t.closest('[data-panel]')) return
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest('[data-panel]') && el.tagName === 'BUTTON')
    const i = items.indexOf(t.closest('button') as HTMLElement)
    if (i < 0) return
    const rtl = getComputedStyle(t).direction === 'rtl'
    const step = (e.key === 'ArrowRight') !== rtl ? 1 : -1
    const next = items[i + step]
    if (next) { e.preventDefault(); next.focus() }
  }

  const move = (c: ToolbarColumn, i: number, dir: 'up' | 'down') => {
    onMoveColumn?.(c.id, dir)
    setMoved(`${c.label} moved to position ${dir === 'up' ? i : i + 2} of ${columns?.length ?? 0}`)
  }

  return (
    <div
      ref={merged}
      className={cx(styles.root, className)}
      data-sticky={sticky || undefined}
      data-stuck={stuck || undefined}
      {...rest}
    >
      <div role="toolbar" aria-label={label} aria-orientation="horizontal" className={styles.bar} onKeyDown={onKeyDown}>
        {search ? (
          <div className={styles.search}>
            <Search label={searchLabel} placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          </div>
        ) : null}

        <div className={styles.group}>
          {onFilterClick ? (
            <Button
              priority="secondary"
              icon={<Icon name="filter" />}
              aria-expanded={filterExpanded}
              onClick={onFilterClick}
            >
              Filter
              {activeFilterCount > 0 ? <Badge kind="count" count={activeFilterCount} live={false} aria-hidden="true" className={styles.count} /> : null}
              <VisuallyHidden>{activeFilterCount > 0 ? `, ${filterText}` : ''}</VisuallyHidden>
            </Button>
          ) : null}
          {onClearFilters && activeFilterCount > 0 ? <Button priority="tertiary" onClick={onClearFilters}>Clear filters</Button> : null}

          {columns ? (
            <div ref={wrapRef} className={styles.panelWrap}>
              <Button
                ref={colBtn}
                priority="secondary"
                icon={<Icon name="columns" />}
                aria-expanded={colsOpen}
                aria-controls={colsOpen ? panelId : undefined}
                aria-haspopup="true"
                onClick={() => setColsOpen((o) => !o)}
              >
                Columns
              </Button>
              {colsOpen ? (
                <div id={panelId} role="group" aria-label="Configure columns" className={styles.panel} data-panel>
                  <p className={styles.panelTitle}>Show and order columns</p>
                  <ul className={styles.columnList}>
                    {columns.map((c, i) => (
                      <li key={c.id} className={styles.columnItem}>
                        <Checkbox
                          label={c.label}
                          checked={c.visible}
                          disabled={c.locked}
                          onChange={(e) => onToggleColumn?.(c.id, e.target.checked)}
                        />
                        <span className={styles.move}>
                          <Button priority="tertiary" size="small" iconOnly icon={<Icon name="arrowUp" />} aria-label={`Move ${c.label} up`} disabled={i === 0} onClick={() => move(c, i, 'up')} />
                          <Button priority="tertiary" size="small" iconOnly icon={<Icon name="arrowDown" />} aria-label={`Move ${c.label} down`} disabled={i === columns.length - 1} onClick={() => move(c, i, 'down')} />
                        </span>
                      </li>
                    ))}
                  </ul>
                  {onResetColumns ? <Button priority="tertiary" size="small" onClick={onResetColumns}>Reset to default</Button> : null}
                  <VisuallyHidden role="status" aria-live="polite">{moved}</VisuallyHidden>
                </div>
              ) : null}
            </div>
          ) : null}

          {onDensityChange ? (
            <div role="group" aria-label="Row density" className={styles.density}>
              <Button priority={density === 'default' ? 'secondary' : 'tertiary'} iconOnly icon={<Icon name="list" />} aria-label="Default density" aria-pressed={density === 'default'} onClick={() => onDensityChange('default')} />
              <Button priority={density === 'dense' ? 'secondary' : 'tertiary'} iconOnly icon={<Icon name="menu" />} aria-label="Compact density" aria-pressed={density === 'dense'} onClick={() => onDensityChange('dense')} />
            </div>
          ) : null}

          {onExport ? <Button priority="secondary" icon={<Icon name="download" />} loading={exportLoading} onClick={onExport}>{exportLabel}</Button> : null}
          {trailing}
        </div>
      </div>

      {hasSelection ? (
        <div className={styles.bulk} role="region" aria-label="Bulk actions">
          <span className={styles.bulkCount} aria-hidden="true">{selectionText}</span>
          <div className={styles.bulkActions}>{bulkActions}</div>
          {onClearSelection ? <Button priority="tertiary" size="small" onClick={onClearSelection}>Clear selection</Button> : null}
        </div>
      ) : null}

      {/* Always mounted so changes are announced politely. Filter count and selection count share it. */}
      <VisuallyHidden role="status" aria-live="polite">{[hasSelection ? selectionText : '', onFilterClick ? filterText : ''].filter(Boolean).join('. ')}</VisuallyHidden>
    </div>
  )
})
