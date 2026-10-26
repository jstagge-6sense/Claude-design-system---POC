import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Spinner } from '../Spinner'
import styles from './Button.module.css'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Priority. Only one primary per task area. */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'destructive'
  size?: 'small' | 'medium' | 'large'
  /** Leading icon slot (INSTANCE_SWAP). */
  icon?: ReactNode
  /** Trailing icon slot. */
  trailingIcon?: ReactNode
  /** Icon-only content mode. Requires `aria-label`. Not available for primary. */
  iconOnly?: boolean
  /** Replaces the label with a spinner. Width is preserved. */
  loading?: boolean
  /** Why the button is unavailable. Announced to assistive tech when disabled. */
  unavailableReason?: string
  /** Disabled buttons stay focusable and use aria-disabled. */
  disabled?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    priority = 'primary', size = 'medium', icon, trailingIcon, iconOnly = false, loading = false,
    disabled = false, unavailableReason, onClick, className, children, type = 'button', id, ...rest
  },
  ref,
) {
  // Icon-only is not available for primary. Fall back to secondary and warn in development.
  const effective = iconOnly && priority === 'primary' ? 'secondary' : priority
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    if (iconOnly && priority === 'primary') console.warn('Button: icon-only is not available for primary. Rendering as secondary.')
    if (iconOnly && !rest['aria-label']) console.warn('Button: icon-only buttons need an aria-label.')
  }
  const inert = disabled || loading
  const reasonId = unavailableReason && id ? `${id}-reason` : undefined
  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    if (inert) { e.preventDefault(); return }
    onClick?.(e)
  }
  return (
    <button
      ref={ref}
      id={id}
      type={type}
      className={cx(styles.root, styles[effective], className)}
      data-size={size}
      data-icon-only={iconOnly || undefined}
      data-loading={loading || undefined}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      aria-describedby={disabled && reasonId ? reasonId : undefined}
      onClick={handle}
      {...rest}
    >
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      {!iconOnly && children != null ? <span className={styles.label}>{children}</span> : null}
      {iconOnly && !icon && children != null ? <span className={styles.icon} aria-hidden="true">{children}</span> : null}
      {trailingIcon && !iconOnly ? <span className={styles.icon} aria-hidden="true">{trailingIcon}</span> : null}
      {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Loading" /></span> : null}
      {disabled && unavailableReason && reasonId ? <VisuallyHidden id={reasonId}>{unavailableReason}</VisuallyHidden> : null}
    </button>
  )
})
