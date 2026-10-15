import { forwardRef, type HTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import styles from './Spinner.module.css'

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** small: inline and button. medium: section. large: page. */
  size?: 'small' | 'medium' | 'large'
  /** onColor: white arc for filled or dark surfaces (primary and destructive buttons). */
  tone?: 'default' | 'onColor'
  /** Visible loading text. Recommended for waits over 5 seconds. */
  label?: string
  /** Accessible name when there is no visible label. */
  accessibleLabel?: string
  /** Cover the nearest positioned ancestor with a scrim and block interaction. */
  overlay?: boolean
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'medium', tone = 'default', label, accessibleLabel = 'Loading', overlay = false, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label ? undefined : accessibleLabel}
      className={cx(styles.root, overlay && styles.overlay, className)}
      data-size={size}
      data-tone={tone}
      {...rest}
    >
      <span className={styles.ring} aria-hidden="true" />
      {label ? <span className={styles.label}>{label}</span> : null}
    </span>
  )
})
