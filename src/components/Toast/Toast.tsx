import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import { Button, type ButtonProps } from '../Button'
import styles from './Toast.module.css'

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error'

export interface ToastAction {
  /** Verb: "Undo", "Retry", "View details". */
  label: string
  onClick: () => void
}

const ICON = { info: 'info', success: 'success', warning: 'warning', error: 'error' } as const

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** info: neutral confirmation. success: positive outcome. warning: caution without blocking. error: failed action. */
  severity?: ToastSeverity
  /** Brief and active: "Segment saved", "3 workflows published". */
  title: ReactNode
  description?: ReactNode
  /** Undo, Retry or View. Keyboard focusable. */
  action?: ToastAction
  /** Show the close button. Recommended only for error and persistent toasts. */
  closable?: boolean
  onClose?: () => void
  closeLabel?: string
  /** Plays the exit transition. Instant under reduced motion. */
  leaving?: boolean
  /** Forced states for docs and previews. Do not use in product code. */
  actionButtonProps?: Partial<ButtonProps>
  closeButtonProps?: Partial<ButtonProps>
}

/**
 * One toast. Normally rendered by `ToastProvider`. Never takes focus. Errors are announced assertively,
 * everything else politely.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { severity = 'info', title, description, action, closable = false, onClose, closeLabel = 'Dismiss notification', leaving = false, actionButtonProps, closeButtonProps, className, ...rest },
  ref,
) {
  const urgent = severity === 'error'
  return (
    <div
      ref={ref}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cx(styles.root, styles[severity], className)}
      data-severity={severity}
      data-leaving={leaving || undefined}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true"><Icon name={ICON[severity]} /></span>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action ? (
        <Button className={styles.action} priority="tertiary" size="small" onClick={action.onClick} {...actionButtonProps}>{action.label}</Button>
      ) : null}
      {closable ? (
        <Button className={styles.close} priority="tertiary" size="small" iconOnly icon={<Icon name="close" />} aria-label={closeLabel} onClick={onClose} {...closeButtonProps} />
      ) : null}
    </div>
  )
})
