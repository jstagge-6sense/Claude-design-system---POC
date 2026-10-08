import { forwardRef, useRef, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Spinner } from '../Spinner'
import { FieldBox, FieldShell, describedBy, useFieldIds, type FieldRequirement, type FieldSize } from '../Input'
import { Menu, flattenItems, type MenuEntry } from '../Menu'
import styles from './Select.module.css'

export interface SelectProps {
  /** Persistent visible label. Never use the placeholder as the label. */
  label: string
  hideLabel?: boolean
  requirement?: FieldRequirement
  helperText?: ReactNode
  /** Error message. Sets aria-invalid and is wired through aria-describedby. */
  error?: string
  /** Options, groups and dividers. Use at least 3 options. Fewer: use radio buttons. */
  items: MenuEntry[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  /** Adds a filter field with highlighted matches. */
  searchable?: boolean
  /** Adds a "Create ..." option while the filter has no exact match. */
  onCreate?: (query: string) => void
  createLabel?: (query: string) => string
  /** Spinner in the list while options load. */
  loading?: boolean
  emptyMessage?: ReactNode
  size?: FieldSize
  disabled?: boolean
  required?: boolean
  /** Submitted with a form. */
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

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label, hideLabel, requirement, helperText, error, items, value, defaultValue = '', onValueChange, placeholder = 'Select an option', searchable = false,
    onCreate, createLabel, loading = false, emptyMessage, size = 'medium', disabled = false, required, name, id, className, open, defaultOpen, onOpenChange, portal = true, 'data-state': forced,
  },
  ref,
) {
  const ids = useFieldIds(id)
  const valueId = `${ids.id}-value`
  const [current, setCurrent] = useControllableState<string>(value, defaultValue, onValueChange)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selected = flattenItems(items).find((i) => i.value === current)

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
        mode="single"
        label={label}
        id={ids.id}
        items={items}
        value={current ? [current] : []}
        onValueChange={(v) => setCurrent(v[0] ?? '')}
        searchable={searchable}
        onCreate={onCreate}
        createLabel={createLabel}
        loading={loading}
        emptyMessage={emptyMessage}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        matchTriggerWidth
        portal={portal}
        trigger={(p) => (
          <FieldBox size={size} invalid={!!error} disabled={disabled} controlRef={triggerRef} className={cx(styles.box, p.open && styles.boxOpen)}>
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
              <span id={valueId} className={styles.value} data-placeholder={selected ? undefined : ''}>{selected ? selected.label : placeholder}</span>
              {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Loading options" /></span> : null}
              <span className={styles.chevron} aria-hidden="true"><Icon name={p.open ? 'chevronUp' : 'chevronDown'} /></span>
            </button>
          </FieldBox>
        )}
      />
      {name ? <input type="hidden" name={name} value={current} /> : null}
    </FieldShell>
  )
})
