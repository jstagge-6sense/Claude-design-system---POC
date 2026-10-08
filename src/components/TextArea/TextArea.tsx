import { forwardRef, useEffect, useRef, type ChangeEvent, type CSSProperties, type FocusEvent, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { FieldBox, FieldShell, describedBy, useFieldIds, useFieldValidation, type FieldRequirement } from '../Input/Field'
import fieldStyles from '../Input/Field.module.css'
import styles from './TextArea.module.css'

/** Local resize grip (diagonal lines). Not in the shared icon set. */
function ResizeGrip() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M14 6 6 14M14 10l-4 4" />
    </svg>
  )
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange'> {
  label: ReactNode
  hideLabel?: boolean
  requirement?: FieldRequirement
  helperText?: ReactNode
  error?: string
  validate?: (value: string) => string | undefined
  requiredMessage?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
  /** Standard: fixed height that scrolls. Auto-resize: grows with content to `maxRows`, then scrolls. */
  autoResize?: boolean
  /** Visible rows. Default 3. */
  rows?: number
  /** Max rows when `autoResize` is on. Default 8. */
  maxRows?: number
  /** Which directions the user may resize. Ignored for auto-resize. Default vertical. */
  resize?: 'none' | 'vertical' | 'both'
  /** Show a character counter. Defaults to true when `maxLength` is set. */
  showCounter?: boolean
  /** Inline actions slot (e.g. AI generate, formatting buttons). Disabled with the field. */
  actions?: ReactNode
  /** Rich textarea tags slot (mentions, variables). Disabled with the field. */
  tags?: ReactNode
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label, hideLabel, requirement, helperText, error: errorProp, validate, requiredMessage, value, defaultValue = '', onValueChange, onChange, onBlur,
    autoResize = false, rows = 3, maxRows = 8, resize = 'vertical', showCounter, maxLength, actions, tags,
    disabled = false, readOnly = false, required, className, id: idProp, 'data-state': forced, 'aria-describedby': describedByProp, style, ...rest
  },
  ref,
) {
  const ids = useFieldIds(idProp)
  const innerRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useControllableState<string>(value, defaultValue, onValueChange)
  const validation = useFieldValidation({ error: errorProp, validate, required: required || requirement === 'required', requiredMessage })
  const error = validation.error
  const hasCounter = (showCounter ?? maxLength != null) && maxLength != null
  const inert = disabled || readOnly
  const withHandle = !autoResize && !disabled && resize !== 'none'

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e)
    setText(e.target.value)
    validation.onChange(e.target.value)
  }
  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    onBlur?.(e)
    validation.onBlur(e.target.value)
  }
  // Auto-resize: grow with content up to maxRows, then scroll.
  useEffect(() => {
    const el = innerRef.current
    if (!autoResize || !el) return
    el.style.height = 'auto'
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20
    el.style.height = `${Math.min(el.scrollHeight, lh * maxRows)}px`
  }, [autoResize, text, maxRows])
  // Keyboard resize: Alt+ArrowDown / Alt+ArrowUp grow or shrink by one line.
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    rest.onKeyDown?.(e)
    if (e.defaultPrevented || !withHandle || !e.altKey || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
    const el = e.currentTarget
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20
    e.preventDefault()
    el.style.height = `${Math.max(rows * lh, el.offsetHeight + (e.key === 'ArrowDown' ? lh : -lh))}px`
  }
  const vars = { '--_rows': rows, '--_max-rows': maxRows, ...style } as CSSProperties

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      requirement={requirement ?? (required ? 'required' : 'none')}
      helperText={helperText}
      error={error}
      counter={hasCounter ? { count: text.length, max: maxLength as number } : undefined}
      disabled={disabled}
      className={className}
      data-state={forced}
    >
      <FieldBox className={styles.box} invalid={!!error} disabled={disabled} readOnly={readOnly} controlRef={innerRef}>
        {tags ? <fieldset className={cx(styles.slot, styles.tags)} disabled={inert} aria-label="Tags">{tags}</fieldset> : null}
        <span className={styles.areaWrap}>
        <textarea
          ref={mergeRefs(ref, innerRef)}
          id={ids.id}
          className={cx(fieldStyles.control, styles.area)}
          style={vars}
          value={text}
          rows={rows}
          data-autoresize={autoResize || undefined}
          data-resize={resize}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          aria-required={required || requirement === 'required' || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helper: !!helperText, error: !!error, counter: hasCounter }, describedByProp)}
          {...rest}
          onKeyDown={handleKeyDown}
          aria-keyshortcuts={withHandle ? 'Alt+ArrowDown Alt+ArrowUp' : undefined}
        />
        {withHandle ? <span className={styles.handle} aria-hidden="true"><ResizeGrip /></span> : null}
        </span>
        {actions ? <fieldset className={cx(styles.slot, styles.actions)} disabled={inert} aria-label="Text actions">{actions}</fieldset> : null}
      </FieldBox>
    </FieldShell>
  )
})
