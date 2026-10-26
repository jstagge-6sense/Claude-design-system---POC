import { forwardRef, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { Chip, ChipGroup } from '../Chip'
import { Spinner } from '../Spinner'
import { FieldBox, FieldShell, describedBy, useFieldIds, type FieldRequirement, type FieldSize } from '../Input'
import { Menu, filterEntries, flattenItems, isGroup, isItem, type MenuEntry } from '../Menu'
import styles from './MultiSelect.module.css'

export interface MultiSelectProps {
  /** Persistent visible label. Never use the placeholder as the label. */
  label: string
  hideLabel?: boolean
  requirement?: FieldRequirement
  helperText?: ReactNode
  error?: string
  items: MenuEntry[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  /** Adds a filter field with highlighted matches. Defaults to true when there are more than 8 options. */
  searchable?: boolean
  /** Select all and Clear all in the list header. Defaults to true. */
  selectAll?: boolean
  /** Show selected items as dismissible chips in the field. Defaults to true. */
  showChips?: boolean
  /** Chips shown before the rest collapse into "+N more". Keeps 30+ selections usable. */
  maxVisibleChips?: number
  loading?: boolean
  emptyMessage?: ReactNode
  size?: FieldSize
  disabled?: boolean
  required?: boolean
  /** Submitted with a form, one hidden input per value. */
  name?: string
  id?: string
  className?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Render the list in place instead of document.body (docs frames). */
  portal?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

/** Keep selected items only, dropping groups that end up empty. */
function onlySelected(entries: MenuEntry[], selected: string[]): MenuEntry[] {
  const out: MenuEntry[] = []
  for (const e of entries) {
    if (isGroup(e)) { const items = e.items.filter((i) => selected.includes(i.value)); if (items.length) out.push({ ...e, items }) }
    else if (isItem(e) && selected.includes(e.value)) out.push(e)
  }
  return out
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(function MultiSelect(
  {
    label, hideLabel, requirement, helperText, error, items, value, defaultValue = [], onValueChange, placeholder = 'Select options', searchable, selectAll = true, showChips = true,
    maxVisibleChips = 3, loading = false, emptyMessage, size = 'medium', disabled = false, required, name, id, className, open, defaultOpen, onOpenChange, portal = true, 'data-state': forced,
  },
  ref,
) {
  const ids = useFieldIds(id)
  const valueId = `${ids.id}-value`
  const [selected, setSelected] = useControllableState<string[]>(value, defaultValue, onValueChange)
  const [query, setQuery] = useState('')
  const [selectedOnly, setSelectedOnly] = useState(false)
  const [announce, setAnnounce] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const all = useMemo(() => flattenItems(items), [items])
  const enabled = all.filter((i) => !i.disabled)
  const total = all.length
  const canSearch = searchable ?? total > 8
  const count = selected.length
  const everything = total > 0 && all.every((i) => selected.includes(i.value))
  // Chips follow the order of the options, not the order of clicking, so the summary is stable.
  const chosen = all.filter((i) => selected.includes(i.value))
  const chips = showChips && !everything ? chosen.slice(0, maxVisibleChips) : []
  const overflow = showChips && !everything ? Math.max(0, chosen.length - maxVisibleChips) : 0
  const shownItems = useMemo(() => (selectedOnly ? onlySelected(items, selected) : items), [selectedOnly, items, selected])

  const change = (next: string[], message?: string) => {
    setSelected(next)
    if (message) { setAnnounce(message); return }
    const added = next.find((v) => !selected.includes(v))
    const removed = selected.find((v) => !next.includes(v))
    const name = (v?: string) => all.find((i) => i.value === v)?.label ?? ''
    setAnnounce(added ? `${name(added)} selected. ${next.length} selected.` : `${name(removed)} removed. ${next.length} selected.`)
  }
  const visibleEnabled = filterEntries(shownItems, query).flatMap((e) => (isGroup(e) ? e.items : isItem(e) ? [e] : [])).filter((i) => !i.disabled)
  const toAdd = visibleEnabled.filter((i) => !selected.includes(i.value))
  const addAll = () => {
    const next = [...selected, ...toAdd.map((i) => i.value)]
    change(next, `${toAdd.length} ${toAdd.length === 1 ? 'option' : 'options'} added. ${next.length} of ${total} selected.`)
  }
  const clearAll = () => { setSelectedOnly(false); change([], 'Selection cleared. 0 selected.') }

  const summary = count === 0 ? placeholder : everything ? `All selected (${total})` : `${count} selected`

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      labelAs="span"
      requirement={requirement ?? (required ? 'required' : 'none')}
      helperText={helperText}
      error={error}
      disabled={disabled}
      className={cx(styles.field, className)}
      data-state={forced}
    >
      <Menu
        className={styles.menu}
        mode="multi"
        label={label}
        id={ids.id}
        items={shownItems}
        value={selected}
        onValueChange={(v) => change(v)}
        searchable={canSearch}
        query={query}
        onQueryChange={setQuery}
        loading={loading}
        emptyMessage={emptyMessage ?? (selectedOnly && !query ? 'Nothing selected yet.' : undefined)}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        matchTriggerWidth
        portal={portal}
        header={selectAll || count > 0 ? (
          <div className={styles.toolbar}>
            <span className={styles.toolbarCount}>{count} of {total} selected</span>
            <span className={styles.toolbarActions}>
              {selectAll ? (
                <Button priority="tertiary" size="small" disabled={toAdd.length === 0} onClick={addAll} unavailableReason={toAdd.length === 0 ? 'Everything shown is already selected.' : undefined}>
                  {query ? 'Select results' : 'Select all'}
                </Button>
              ) : null}
              <Button priority="tertiary" size="small" disabled={count === 0} onClick={clearAll}>Clear all</Button>
              <Button priority="tertiary" size="small" aria-pressed={selectedOnly} disabled={count === 0 && !selectedOnly} onClick={() => setSelectedOnly((v) => !v)}>Selected only</Button>
            </span>
          </div>
        ) : undefined}
        trigger={(p) => (
          <FieldBox size={size} invalid={!!error} disabled={disabled} controlRef={triggerRef} className={cx(styles.box, p.open && styles.boxOpen)}>
            {chips.length || overflow ? (
              <ChipGroup aria-label={`Selected ${label}`} className={styles.chips}>
                {chips.map((i) => (
                  <Chip key={i.value} variant="dismissible" disabled={disabled} onDismiss={() => { change(selected.filter((v) => v !== i.value)); triggerRef.current?.focus() }}>{i.label}</Chip>
                ))}
                {overflow ? <Chip variant="viewOnly">{`+${overflow} more`}</Chip> : null}
              </ChipGroup>
            ) : null}
            <button
              ref={mergeRefs(ref, triggerRef)}
              type="button"
              id={p.id}
              className={styles.trigger}
              disabled={disabled}
              aria-haspopup={p['aria-haspopup']}
              aria-expanded={p['aria-expanded']}
              aria-controls={p['aria-controls']}
              aria-labelledby={`${ids.labelId} ${valueId}`}
              aria-describedby={describedBy(ids, { helper: !!helperText, error: !!error })}
              aria-invalid={error ? true : undefined}
              aria-required={required || requirement === 'required' || undefined}
              aria-busy={loading || undefined}
              onClick={p.onClick}
              onKeyDown={p.onKeyDown}
            >
              <span id={valueId} className={styles.value} data-placeholder={count === 0 ? '' : undefined} data-chips={chips.length > 0 ? '' : undefined}>{summary}</span>
              {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Loading options" /></span> : null}
              <span className={styles.chevron} aria-hidden="true"><Icon name={p.open ? 'chevronUp' : 'chevronDown'} /></span>
            </button>
          </FieldBox>
        )}
      />
      {name ? selected.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
    </FieldShell>
  )
})
