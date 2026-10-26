import { forwardRef, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Spinner } from '../Spinner'
import { FieldBox, FieldShell, describedBy, useFieldIds, useFieldValidation, type FieldRequirement, type FieldSize } from './Field'
import fieldStyles from './Field.module.css'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  /** Persistent visible label. Never use the placeholder as the label. */
  label: ReactNode
  hideLabel?: boolean
  /** Mark the minority case with written text: "(required)" or "(optional)". */
  requirement?: FieldRequirement
  helperText?: ReactNode
  /** Error message. When set the field is invalid (aria-invalid) and the message is wired via aria-describedby. */
  error?: string
  /** Validate on blur (and on change after the first error). Return a message or undefined. */
  validate?: (value: string) => string | undefined
  requiredMessage?: string
  size?: FieldSize
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /** Leading icon slot (INSTANCE_SWAP). Decorative. */
  leadingIcon?: ReactNode
  /** Trailing icon slot. Decorative. */
  trailingIcon?: ReactNode
  /** Show a clear button while there is text. */
  clearable?: boolean
  onClear?: () => void
  /** Adds a show/hide toggle. Only applies to `type="password"`. */
  passwordToggle?: boolean
  /** Inline spinner for async validation. Sets aria-busy. */
  loading?: boolean
  /** Show a character counter. Defaults to true when `maxLength` is set. */
  showCounter?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label, hideLabel, requirement, helperText, error: errorProp, validate, requiredMessage, size = 'medium', value, defaultValue = '', onValueChange, onChange, onBlur,
    leadingIcon, trailingIcon, clearable = false, onClear, passwordToggle = false, loading = false, showCounter, maxLength,
    disabled = false, readOnly = false, required, type = 'text', className, id: idProp, 'data-state': forced, 'aria-describedby': describedByProp, ...rest
  },
  ref,
) {
  const ids = useFieldIds(idProp)
  const innerRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useControllableState<string>(value, defaultValue, onValueChange)
  const [revealed, setRevealed] = useState(false)
  const validation = useFieldValidation({ error: errorProp, validate, required: required || requirement === 'required', requiredMessage })
  const error = validation.error
  const hasCounter = (showCounter ?? maxLength != null) && maxLength != null
  const isPassword = type === 'password'
  const inert = disabled || readOnly
  const showClear = clearable && text.length > 0 && !inert
  const showToggle = passwordToggle && isPassword && !disabled

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    setText(e.target.value)
    validation.onChange(e.target.value)
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e)
    validation.onBlur(e.target.value)
  }
  const clear = () => {
    setText('')
    validation.onChange('')
    onClear?.()
    innerRef.current?.focus()
  }

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
      className={cx(styles.root, className)}
      data-state={forced}
    >
      <FieldBox size={size} invalid={!!error} disabled={disabled} readOnly={readOnly} controlRef={innerRef}>
        {leadingIcon ? <span className={fieldStyles.icon} aria-hidden="true">{leadingIcon}</span> : null}
        <input
          ref={mergeRefs(ref, innerRef)}
          id={ids.id}
          className={cx(fieldStyles.control, isPassword && styles.password)}
          type={isPassword && revealed ? 'text' : type}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          aria-required={required || requirement === 'required' || undefined}
          aria-invalid={error ? true : undefined}
          aria-busy={loading || undefined}
          aria-describedby={describedBy(ids, { helper: !!helperText, error: !!error, counter: hasCounter }, describedByProp)}
          {...rest}
        />
        {(loading || showClear || showToggle || trailingIcon || readOnly) ? (
          <span className={fieldStyles.adornment}>
            {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Validating" /></span> : null}
            {showClear ? (
              <button type="button" className={fieldStyles.action} aria-label="Clear" onClick={clear}><Icon name="close" /></button>
            ) : null}
            {showToggle ? (
              <button type="button" className={fieldStyles.action} aria-label={revealed ? 'Hide password' : 'Show password'} aria-pressed={revealed} onClick={() => setRevealed((r) => !r)}>
                <Icon name={revealed ? 'eyeOff' : 'eye'} />
              </button>
            ) : null}
            {trailingIcon ? <span className={fieldStyles.icon} aria-hidden="true">{trailingIcon}</span> : null}
            {readOnly && !disabled ? <span className={fieldStyles.icon} aria-hidden="true"><Icon name="lock" /></span> : null}
          </span>
        ) : null}
      </FieldBox>
    </FieldShell>
  )
})
