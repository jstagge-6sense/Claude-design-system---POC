import { forwardRef, useId, type ButtonHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { Spinner } from '../Spinner'
import styles from './Toggle.module.css'

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange' | 'className' | 'style' | 'role' | 'value'> {
  /** Visible label. Always present. Describe the ON state and never change it when the switch flips. */
  label: ReactNode
  /** Helper text under the label. */
  description?: ReactNode
  /** Controlled value. */
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Small is for dense settings lists. */
  size?: 'small' | 'medium'
  /** Optional spinner on the thumb while the change is saved. The switch ignores input while loading. */
  loading?: boolean
  className?: string
  style?: CSSProperties
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

/** Immediate on/off switch. Native button props go to the switch. `className`, `style` and `data-state` go to the root. */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    label, description, checked, defaultChecked = false, onCheckedChange, size = 'medium', loading = false,
    disabled = false, className, style, id, onClick, 'data-state': dataState, 'aria-describedby': describedBy, ...rest
  },
  ref,
) {
  const [on, setOn] = useControllableState<boolean>(checked, defaultChecked, onCheckedChange)
  const autoId = useId()
  const buttonId = id ?? `${autoId}-switch`
  const descId = description ? `${autoId}-desc` : undefined
  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) { e.preventDefault(); return }
    onClick?.(e)
    if (!e.defaultPrevented) setOn(!on)
  }
  return (
    <div
      className={cx(styles.root, className)}
      style={style}
      data-size={size}
      data-on={on || undefined}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
      data-state={dataState}
    >
      <span className={styles.cell}>
        <button
          ref={ref}
          id={buttonId}
          type="button"
          role="switch"
          className={styles.track}
          aria-checked={on}
          aria-busy={loading || undefined}
          aria-describedby={[describedBy, descId].filter(Boolean).join(' ') || undefined}
          disabled={disabled}
          onClick={handle}
          {...rest}
        >
          <span className={styles.thumb}>
            {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Saving" aria-hidden="true" /></span> : null}
          </span>
        </button>
      </span>
      <span className={styles.text}>
        <label htmlFor={buttonId} className={styles.label}>{label}</label>
        {description ? <span id={descId} className={styles.description}>{description}</span> : null}
      </span>
    </div>
  )
})
