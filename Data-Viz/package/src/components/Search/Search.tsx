import { forwardRef, useEffect, useRef, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Spinner } from '../Spinner'
import { FieldBox, FieldShell, describedBy, useFieldIds, type FieldSize } from '../Input/Field'
import fieldStyles from '../Input/Field.module.css'
import styles from './Search.module.css'

export interface SearchResult {
  id: string
  label: string
  description?: string
  /** Leading icon slot for the option. */
  icon?: ReactNode
}

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /** Accessible name. Hidden visually by default because the search icon and placeholder carry the affordance. */
  label?: string
  /** Show the label visibly. */
  showLabel?: boolean
  /** Global search is a pill that sits above the page. Contextual search filters the content next to it. */
  variant?: 'global' | 'contextual'
  size?: FieldSize
  helperText?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called with the trimmed query after `debounceMs` of no typing, immediately on Enter, and with '' on clear. */
  onSearch?: (query: string) => void
  debounceMs?: number
  /** Inline spinner while the search runs. */
  loading?: boolean
  /** Results. `undefined` renders a plain searchbox. An array turns it into a combobox with a listbox. */
  results?: SearchResult[]
  onSelect?: (result: SearchResult) => void
  /** No-results message slot. Defaults to a message with the query and a suggestion. */
  noResultsMessage?: ReactNode
  /** Scope or filter slot rendered before the query (for example a menu button). Disabled with the field. */
  scope?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  {
    label = 'Search', showLabel = false, variant = 'contextual', size = 'medium', helperText, value, defaultValue = '', onValueChange, onSearch, debounceMs = 300,
    loading = false, results, onSelect, noResultsMessage, scope, open: openProp, defaultOpen = false, onOpenChange, disabled = false, className, id: idProp,
    onKeyDown, onFocus, onBlur, 'data-state': forced, 'aria-describedby': describedByProp, placeholder = 'Search', ...rest
  },
  ref,
) {
  const ids = useFieldIds(idProp)
  const listId = `${ids.id}-listbox`
  const innerRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [text, setText] = useControllableState<string>(value, defaultValue, onValueChange)
  const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange)
  const [active, setActive] = useControllableState<number>(undefined, -1)
  const isCombo = results !== undefined
  const query = text.trim()
  const hasResults = isCombo && results.length > 0
  const showList = open && hasResults && !disabled
  const showEmpty = open && isCombo && !hasResults && query !== '' && !loading && !disabled
  const activeId = showList && active >= 0 ? `${listId}-opt-${active}` : undefined

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => { if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' }) }, [activeId])

  const schedule = (v: string) => {
    clearTimeout(timer.current)
    const q = v.trim()
    if (q === '') { onSearch?.(''); return }
    timer.current = setTimeout(() => onSearch?.(q), debounceMs)
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    setOpen(true)
    setActive(-1)
    schedule(e.target.value)
  }
  const clear = () => {
    clearTimeout(timer.current)
    setText('')
    setActive(-1)
    onSearch?.('')
    innerRef.current?.focus()
  }
  const select = (r: SearchResult) => {
    onSelect?.(r)
    setText(r.label)
    setOpen(false)
    setActive(-1)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!hasResults) return
      e.preventDefault()
      if (!open) { setOpen(true); return }
      const n = results.length
      setActive(e.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1)
    } else if (e.key === 'Enter') {
      if (showList && active >= 0) { e.preventDefault(); select(results[active]) }
      else { clearTimeout(timer.current); onSearch?.(query) }
    } else if (e.key === 'Escape') {
      if (showList || showEmpty) { e.preventDefault(); setOpen(false); setActive(-1) }
      else if (text) { e.preventDefault(); clear() }
    }
  }
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => { onFocus?.(e); if (query) setOpen(true) }
  const handleRootBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { setOpen(false); setActive(-1) }
  }
  const status = loading ? 'Searching.' : showList ? `${results.length} ${results.length === 1 ? 'result' : 'results'} available.` : showEmpty ? 'No results.' : ''

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={!showLabel}
      helperText={helperText}
      disabled={disabled}
      className={className}
      data-state={forced}
      role="search"
      onBlur={handleRootBlur}
    >
      <div className={styles.anchor}>
        <FieldBox size={size} disabled={disabled} controlRef={innerRef} className={cx(variant === 'global' ? styles.global : styles.contextual)} data-variant={variant}>
          {scope ? <fieldset className={styles.scope} disabled={disabled} aria-label="Search scope">{scope}</fieldset> : null}
          <span className={fieldStyles.icon} aria-hidden="true"><Icon name="search" /></span>
          <input
            ref={mergeRefs(ref, innerRef)}
            id={ids.id}
            className={fieldStyles.control}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder={placeholder}
            value={text}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={onBlur}
            role={isCombo ? 'combobox' : undefined}
            aria-expanded={isCombo ? showList : undefined}
            aria-controls={isCombo && showList ? listId : undefined}
            aria-autocomplete={isCombo ? 'list' : undefined}
            aria-activedescendant={activeId}
            aria-busy={loading || undefined}
            aria-describedby={describedBy(ids, { helper: !!helperText }, describedByProp)}
            {...rest}
          />
          {(loading || (text.length > 0 && !disabled)) ? (
            <span className={fieldStyles.adornment}>
              {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Searching" /></span> : null}
              {text.length > 0 && !disabled ? (
                <button type="button" className={fieldStyles.action} aria-label="Clear search" onMouseDown={(e) => e.preventDefault()} onClick={clear}><Icon name="close" /></button>
              ) : null}
            </span>
          ) : null}
        </FieldBox>
        {showList ? (
          <ul id={listId} role="listbox" aria-label={`${label} results`} className={styles.results}>
            {results.map((r, i) => (
              <li
                key={r.id}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                data-active={i === active || undefined}
                className={styles.option}
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => { if (i !== active) setActive(i) }}
                onClick={() => select(r)}
              >
                {r.icon ? <span className={styles.optionIcon} aria-hidden="true">{r.icon}</span> : null}
                <span className={styles.optionText}>
                  <span className={styles.optionLabel}>{r.label}</span>
                  {r.description ? <span className={styles.optionDesc}>{r.description}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {showEmpty ? (
          <div className={cx(styles.results, styles.empty)}>
            {noResultsMessage ?? (
              <>
                <p className={styles.emptyTitle}>{`No results for “${query}”.`}</p>
                <p className={styles.emptyTitle}>Check the spelling or try a different keyword.</p>
              </>
            )}
          </div>
        ) : null}
        <VisuallyHidden role="status" aria-live="polite">{status}</VisuallyHidden>
      </div>
    </FieldShell>
  )
})
