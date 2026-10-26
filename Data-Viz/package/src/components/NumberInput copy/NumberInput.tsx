import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { FieldBox, FieldShell, describedBy, useFieldIds, useFieldValidation, type FieldRequirement, type FieldSize } from '../Input/Field'
import fieldStyles from '../Input/Field.module.css'
import styles from './NumberInput.module.css'

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'> {
  label: ReactNode
  hideLabel?: boolean
  requirement?: FieldRequirement
  helperText?: ReactNode
  error?: string
  /** Runs on blur. Receives the committed number (or null when empty). */
  validate?: (value: number | null) => string | undefined
  requiredMessage?: string
  size?: FieldSize
  /** Committed value. `null` is an empty field. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Increment for arrow keys and steppers. Default 1. Shift multiplies by 10. */
  step?: number
  /** Decimal places allowed. Defaults to the decimals of `step`. */
  precision?: number
  /** Show the stepper buttons. Without them the field is type-only. */
  steppers?: boolean
  /** Unit suffix label (%, px, days). */
  unit?: string
  leadingIcon?: ReactNode
  /** Accessible names for the stepper buttons. */
  stepperLabels?: { decrease: string; increase: string }
  /** Override the boundary messages. */
  boundaryMessages?: { min?: string; max?: string }
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

const decimalsOf = (n: number) => {
  const s = String(n)
  return s.includes('.') ? s.split('.')[1].length : 0
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    label, hideLabel, requirement, helperText, error: errorProp, validate, requiredMessage, size = 'medium', value, defaultValue = null, onValueChange,
    min, max, step = 1, precision, steppers = true, unit, leadingIcon, stepperLabels = { decrease: 'Decrease value', increase: 'Increase value' }, boundaryMessages,
    disabled = false, readOnly = false, required, className, id: idProp, onBlur, onFocus, onKeyDown, 'data-state': forced, 'aria-describedby': describedByProp, ...rest
  },
  ref,
) {
  const ids = useFieldIds(idProp)
  const unitId = `${ids.id}-unit`
  const innerRef = useRef<HTMLInputElement>(null)
  const dp = precision ?? decimalsOf(step)
  const allowNegative = min === undefined || min < 0
  const fmt = (n: number | null) => (n === null ? '' : n.toFixed(dp))
  const [num, setNum] = useControllableState<number | null>(value, defaultValue, onValueChange)
  const [text, setText] = useState(fmt(num))
  const [note, setNote] = useState<string | undefined>(undefined)
  const editing = useRef(false)
  useEffect(() => { if (!editing.current) setText(fmt(num)) }, [num, dp]) // eslint-disable-line react-hooks/exhaustive-deps

  const validation = useFieldValidation({
    error: errorProp,
    validate: validate ? (s) => validate(s === '' ? null : Number(s)) : undefined,
    required: required || requirement === 'required',
    requiredMessage,
  })
  const error = validation.error
  const inert = disabled || readOnly
  const withUnit = unit ? ` ${unit}` : ''
  const maxMsg = boundaryMessages?.max ?? (max !== undefined ? `Maximum is ${max}${withUnit}.` : '')
  const minMsg = boundaryMessages?.min ?? (min !== undefined ? `Minimum is ${min}${withUnit}.` : '')
  const atMax = num !== null && max !== undefined && num >= max
  const atMin = num !== null && min !== undefined && num <= min

  const round = (n: number) => Number(n.toFixed(dp))
  const clamp = (n: number) => {
    const lo = min !== undefined && n < min
    const hi = max !== undefined && n > max
    return { n: lo ? (min as number) : hi ? (max as number) : n, lo, hi }
  }
  const parse = (s: string): number | null => {
    if (s === '' || s === '-' || s === '.' || s === '-.') return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  const sanitize = (s: string) => {
    let out = ''
    for (const ch of s) {
      if (ch >= '0' && ch <= '9') out += ch
      else if (ch === '.' && dp > 0 && !out.includes('.')) out += ch
      else if (ch === '-' && allowNegative && out === '') out += ch
    }
    return out
  }
  const commitNumber = (n: number | null): number | null => {
    if (n === null) { setNum(null); setText(''); setNote(undefined); return null }
    const c = clamp(round(n))
    setNum(c.n)
    setText(fmt(c.n))
    setNote(c.hi ? `Value adjusted to the maximum of ${max}${withUnit}.` : c.lo ? `Value adjusted to the minimum of ${min}${withUnit}.` : undefined)
    return c.n
  }
  const stepBy = (dir: 1 | -1, mult = 1) => {
    if (inert) return
    const current = parse(text) ?? num
    const next = current === null ? (dir > 0 ? (min ?? step) : (max ?? -step)) : current + dir * step * mult
    const n = commitNumber(next)
    validation.onChange(n === null ? '' : String(n))
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const s = sanitize(e.target.value)
    setText(s)
    setNote(undefined)
    validation.onChange(s)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); stepBy(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey ? 10 : 1); return }
    if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); stepBy(e.key === 'PageUp' ? 1 : -1, 10); return }
    if (e.key === 'Home' && min !== undefined && !inert) { e.preventDefault(); commitNumber(min); return }
    if (e.key === 'End' && max !== undefined && !inert) { e.preventDefault(); commitNumber(max); return }
    if (e.key === 'Enter') { commitNumber(parse(text)); return }
    // Reject anything that is not part of a number immediately: letters, e, +, and - unless negatives are allowed here.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const el = e.currentTarget
      const hasSelection = (el.selectionStart ?? 0) !== (el.selectionEnd ?? 0)
      const base = hasSelection ? '' : text
      const ok =
        (e.key >= '0' && e.key <= '9') ||
        (e.key === '.' && dp > 0 && !base.includes('.')) ||
        (e.key === '-' && allowNegative && (hasSelection || (el.selectionStart === 0 && !text.includes('-'))))
      if (!ok) e.preventDefault()
    }
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    editing.current = false
    onBlur?.(e)
    const n = commitNumber(parse(text))
    validation.onBlur(n === null ? '' : String(n))
  }
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => { editing.current = true; onFocus?.(e) }

  const boundary = note ?? (atMax ? maxMsg : atMin ? minMsg : undefined)
  const helper = boundary ?? helperText
  const valueText = num === null ? undefined : `${fmt(num)}${withUnit}`
  const stepButton = (dir: 1 | -1, disabledAtBoundary: boolean) => (
    <button
      type="button"
      tabIndex={-1}
      className={styles.stepper}
      aria-label={dir > 0 ? stepperLabels.increase : stepperLabels.decrease}
      aria-controls={ids.id}
      aria-disabled={disabledAtBoundary || undefined}
      disabled={inert}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => { if (!disabledAtBoundary) { stepBy(dir); innerRef.current?.focus() } }}
    >
      <Icon name={dir > 0 ? 'plus' : 'minus'} />
    </button>
  )

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      requirement={requirement ?? (required ? 'required' : 'none')}
      helperText={helper}
      error={error}
      disabled={disabled}
      className={className}
      data-state={forced}
    >
      <FieldBox size={size} invalid={!!error} disabled={disabled} readOnly={readOnly} controlRef={innerRef} data-withsteppers={steppers || undefined} className={styles.box}>
        {leadingIcon ? <span className={fieldStyles.icon} aria-hidden="true">{leadingIcon}</span> : null}
        <input
          ref={mergeRefs(ref, innerRef)}
          id={ids.id}
          className={cx(fieldStyles.control, styles.control)}
          type="text"
          inputMode={dp > 0 ? 'decimal' : 'numeric'}
          autoComplete="off"
          role="spinbutton"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          readOnly={readOnly}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={num ?? undefined}
          aria-valuetext={valueText}
          aria-required={required || requirement === 'required' || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, { helper: !!helper, error: !!error }, cx(unit && unitId, describedByProp) || undefined)}
          {...rest}
        />
        {unit ? <span id={unitId} className={styles.unit}>{unit}</span> : null}
        {readOnly && !disabled ? <span className={fieldStyles.icon} aria-hidden="true"><Icon name="lock" /></span> : null}
        {steppers ? (
          <span className={styles.steppers} role="group" aria-label="Stepper">
            {stepButton(-1, atMin)}
            {stepButton(1, atMax)}
          </span>
        ) : null}
      </FieldBox>
    </FieldShell>
  )
})
