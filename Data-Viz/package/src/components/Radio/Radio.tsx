import {
  createContext, forwardRef, useContext, useId, useRef,
  type ChangeEvent, type FieldsetHTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import styles from './Radio.module.css'

interface RadioGroupContextValue {
  name: string
  value: string | undefined
  select: (value: string) => void
  disabled: boolean
  error: boolean
  variant: 'default' | 'card'
}
const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'children' | 'className' | 'style' | 'value'> {
  /** Option value. Required. */
  value: string
  /** Visible label. Always present. */
  label: ReactNode
  /** Per-option helper text. */
  description?: ReactNode
  className?: string
  style?: React.CSSProperties
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

/** Use inside a RadioGroup. Native input props go to the input. `className`, `style` and `data-state` go to the root. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, className, style, id, disabled, value, name, checked, defaultChecked, onChange, 'data-state': dataState, 'aria-describedby': describedBy, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext)
  const autoId = useId()
  const inputId = id ?? `${autoId}-input`
  const descId = description ? `${autoId}-desc` : undefined
  const isDisabled = disabled || group?.disabled || false
  const isChecked = group ? group.value === value : undefined
  const groupProps = group
    ? {
        name: group.name,
        checked: isChecked,
        tabIndex: group.value !== undefined && !isChecked ? -1 : undefined,
        onChange: (e: ChangeEvent<HTMLInputElement>) => { group.select(value); onChange?.(e) },
      }
    : { name, checked, defaultChecked, onChange }
  const card = group?.variant === 'card'
  return (
    <div
      className={cx(styles.root, card && styles.card, className)}
      style={style}
      data-state={dataState}
      data-checked={isChecked || undefined}
      data-disabled={isDisabled || undefined}
      data-error={group?.error || undefined}
    >
      <span className={styles.control}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={styles.input}
          value={value}
          disabled={isDisabled}
          aria-describedby={[describedBy, descId].filter(Boolean).join(' ') || undefined}
          {...groupProps}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true"><span className={styles.dot} /></span>
      </span>
      <span className={styles.text}>
        <label htmlFor={inputId} className={styles.label}>{label}</label>
        {description ? <span id={descId} className={styles.description}>{description}</span> : null}
      </span>
    </div>
  )
})

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue' | 'value'> {
  /** Group label rendered as the fieldset legend. */
  legend: ReactNode
  /** Helper text under the legend. */
  description?: ReactNode
  /** Group-level error message. Presence puts every option in the error state. */
  error?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  /** Vertical by default. Horizontal suits 2 to 3 short labels. */
  orientation?: 'vertical' | 'horizontal'
  /** Card gives each option a larger target with room for a description. */
  variant?: 'default' | 'card'
  disabled?: boolean
  children?: ReactNode
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  { legend, description, error, value, defaultValue, onValueChange, name, orientation = 'vertical', variant = 'default', disabled = false, className, children, onKeyDown, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined)
  const autoId = useId()
  const rootRef = useRef<HTMLFieldSetElement>(null)
  const descId = description ? `${autoId}-desc` : undefined
  const errId = error ? `${autoId}-err` : undefined
  const ctx: RadioGroupContextValue = {
    name: name ?? `${autoId}-name`,
    value: current,
    select: (v) => setCurrent(v),
    disabled,
    error: Boolean(error),
    variant,
  }

  // Arrow keys move focus and selection. Home and End jump to the ends. Disabled options are skipped.
  const handleKeyDown = (e: KeyboardEvent<HTMLFieldSetElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const target = e.target as HTMLElement
    if (target.tagName !== 'INPUT' || (target as HTMLInputElement).type !== 'radio') return
    const root = rootRef.current
    if (!root) return
    const rtl = typeof getComputedStyle === 'function' && getComputedStyle(root).direction === 'rtl'
    const items = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)'))
    const i = items.indexOf(target as HTMLInputElement)
    if (i < 0 || items.length === 0) return
    let next = -1
    switch (e.key) {
      case 'ArrowDown': next = (i + 1) % items.length; break
      case 'ArrowUp': next = (i - 1 + items.length) % items.length; break
      case 'ArrowRight': next = (i + (rtl ? -1 : 1) + items.length) % items.length; break
      case 'ArrowLeft': next = (i + (rtl ? 1 : -1) + items.length) % items.length; break
      case 'Home': next = 0; break
      case 'End': next = items.length - 1; break
      default: return
    }
    e.preventDefault()
    items[next].focus()
    setCurrent(items[next].value)
  }

  return (
    <fieldset
      ref={mergeRefs(ref, rootRef)}
      role="radiogroup"
      className={cx(styles.group, className)}
      disabled={disabled}
      aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
      data-orientation={orientation}
      data-variant={variant}
      data-error={error ? true : undefined}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <legend className={styles.legend}>{legend}</legend>
      {description ? <p id={descId} className={styles.groupDescription}>{description}</p> : null}
      <RadioGroupContext.Provider value={ctx}>
        <div className={styles.items}>{children}</div>
      </RadioGroupContext.Provider>
      {error ? <p id={errId} className={styles.error}><Icon name="error" aria-hidden />{error}</p> : null}
    </fieldset>
  )
})
