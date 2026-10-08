import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import styles from './Link.module.css'

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  /** inline: inside running text. standalone: outside text. destructive: navigates to a destructive flow (rare). */
  variant?: 'inline' | 'standalone' | 'destructive'
  /** Leading icon slot (INSTANCE_SWAP). */
  icon?: ReactNode
  /** Trailing icon slot. External links get the external icon automatically when this is empty. */
  trailingIcon?: ReactNode
  /** Opens in a new tab. Adds the external icon and "opens in new tab" to the accessible name. */
  external?: boolean
  /** Rare. Prefer removing links that cannot be followed. Uses aria-disabled and drops the href. */
  disabled?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus' | 'visited'
  children?: ReactNode
}

export const OPENS_IN_NEW_TAB = 'opens in new tab'

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = 'standalone', icon, trailingIcon, external = false, disabled = false, href, onClick, className, children, target, rel, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) { e.preventDefault(); return }
    onClick?.(e)
  }
  const trailing = trailingIcon ?? (external ? <Icon name="externalLink" /> : null)
  // A string label gets an aria-label that includes the new-tab hint. Rich children get a hidden hint instead.
  const textChild = typeof children === 'string' ? children : undefined
  const name = ariaLabel ?? (external && !disabled && textChild ? `${textChild} (${OPENS_IN_NEW_TAB})` : undefined)
  const needsHiddenHint = external && !disabled && !name
  return (
    <a
      ref={ref}
      className={cx(styles.root, styles[variant], className)}
      data-variant={variant}
      href={disabled ? undefined : href}
      role={disabled ? 'link' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? 0 : undefined}
      target={external ? '_blank' : target}
      rel={external ? 'noopener noreferrer' : rel}
      aria-label={name}
      onClick={handle}
      {...rest}
    >
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      {children}
      {trailing ? <span className={styles.icon} aria-hidden="true">{trailing}</span> : null}
      {needsHiddenHint ? <VisuallyHidden> ({OPENS_IN_NEW_TAB})</VisuallyHidden> : null}
    </a>
  )
})
