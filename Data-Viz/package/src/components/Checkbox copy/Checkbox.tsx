import {
  createContext, forwardRef, useContext, useEffect, useId, useRef,
  type FieldsetHTMLAttributes, type InputHTMLAttributes, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import styles from './Checkbox.module.css'

interface GroupContextValue {
  name?: string
  value: string[]
  setChecked: (value: string, checked: boolean) => void
  disabled: boolean
  error: boolean
}
const GroupContext = createContext<GroupContextValue | null>(null)

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'children' | 'className' | 'style' | 'value'> {
  /** Visible label. Always present. */
  label: ReactNode
  /** Per-option helper text. */
  description?: ReactNode
  /** Partial selection (parent of a partly selected set). Sets aria-checked="mixed". */
  indeterminate?: boolean
  /** Value used inside a CheckboxGroup, or the submitted form value. */
  value?: string
  /** Marks a standalone checkbox as invalid. Inside a group, set `error` on the group. */
  error?: boolean
  /** Message for a standalone checkbox in error. */
  errorMessage?: ReactNode
  className?: string
  style?: React.CSSProperties
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

/** Native input props go to the input. `className`, `style` and `data-state` go to the root. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label, description, indeterminate = false, error = false, errorMessage, className, style, id,
    disabled, checked, defaultChecked, onChange, name, value, 'data-state': dataState, 'aria-describedby': describedBy, ...rest
  },
  ref,
) {
  const group = useContext(GroupContext)
  const autoId = useId()
  const inputId = id ?? `${autoId}-input`
  const descId = description ? `${autoId}-desc` : undefined
  const errId = error && errorMessage ? `${autoId}-err` : undefined
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate, checked])

  const isDisabled = disabled || group?.disabled || false
  const isError = error || group?.error || false
  const groupProps = group && value !== undefined
    ? {
        checked: group.value.includes(value),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => { group.setChecked(value, e.target.checked); onChange?.(e) },
        name: name ?? group.name,
      }
    : { checked, defaultChecked, onChange, name }

  return (
    <div
      className={cx(styles.root, className)}
      style={style}
      data-state={dataState}
      data-disabled={isDisabled || undefined}
      data-error={isError || undefined}
    >
      <span className={styles.row}>
        <span className={styles.control}>
          <input
            ref={mergeRefs(ref, inputRef)}
            id={inputId}
            type="checkbox"
            className={styles.input}
            value={value}
            disabled={isDisabled}
            aria-checked={indeterminate ? 'mixed' : undefined}
            aria-invalid={isError || undefined}
            aria-describedby={[describedBy, descId, errId].filter(Boolean).join(' ') || undefined}
            {...groupProps}
            {...rest}
          />
          <span className={styles.box} aria-hidden="true">
            <Icon name="check" size="100%" className={styles.check} />
            <Icon name="minus" size="100%" className={styles.minus} />
          </span>
        </span>
        <span className={styles.text}>
          <label htmlFor={inputId} className={styles.label}>{label}</label>
          {description ? <span id={descId} className={styles.description}>{description}</span> : null}
        </span>
      </span>
      {error && errorMessage ? (
        <span id={errId} className={styles.error}><Icon name="error" aria-hidden />{errorMessage}</span>
      ) : null}
    </div>
  )
})

export interface CheckboxGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue' | 'value'> {
  /** Group label rendered as the fieldset legend. */
  legend: ReactNode
  /** Helper text under the legend. */
  description?: ReactNode
  /** Group-level error message. Presence puts every option in the error state. */
  error?: ReactNode
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  name?: string
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  children?: ReactNode
}

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(function CheckboxGroup(
  { legend, description, error, value, defaultValue, onValueChange, name, orientation = 'vertical', disabled = false, className, children, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string[]>(value, defaultValue ?? [], onValueChange)
  const autoId = useId()
  const descId = description ? `${autoId}-desc` : undefined
  const errId = error ? `${autoId}-err` : undefined
  const ctx: GroupContextValue = {
    name,
    value: current,
    disabled,
    error: Boolean(error),
    setChecked: (v, checked) => setCurrent(checked ? [...current.filter((x) => x !== v), v] : current.filter((x) => x !== v)),
  }
  return (
    <fieldset
      ref={ref}
      className={cx(styles.group, className)}
      disabled={disabled}
      aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
      data-orientation={orientation}
      data-error={error ? true : undefined}
      {...rest}
    >
      <legend className={styles.legend}>{legend}</legend>
      {description ? <p id={descId} className={styles.groupDescription}>{description}</p> : null}
      <GroupContext.Provider value={ctx}>
        <div className={styles.items}>{children}</div>
      </GroupContext.Provider>
      {error ? <p id={errId} className={styles.error}><Icon name="error" aria-hidden />{error}</p> : null}
    </fieldset>
  )
})
