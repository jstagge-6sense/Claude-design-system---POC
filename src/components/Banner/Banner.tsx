import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import { Button, type ButtonProps } from '../Button'
import { Link } from '../Link'
import { focusableIn, isDev } from '../Dialog/overlay'
import styles from './Banner.module.css'

export type BannerSeverity = 'info' | 'success' | 'warning' | 'error'
export type BannerPlacement = 'global' | 'page' | 'section' | 'inline'
/** P1 system outage, P2 blocked workflow, P3 recommended action, P4 FYI. Success has no priority. */
export type BannerPriority = 'P1' | 'P2' | 'P3' | 'P4'

/** Resolve the priority a banner renders with. Info is P4, warning is P3, error is P1 (default) or P2. Success has none. */
export function resolveBannerPriority(severity: BannerSeverity, priority?: BannerPriority): BannerPriority | undefined {
  if (severity === 'error') return priority === 'P2' ? 'P2' : 'P1'
  if (severity === 'warning') return 'P3'
  if (severity === 'info') return 'P4'
  return undefined
}

const ICON = { info: 'info', success: 'success', warning: 'warning', error: 'error' } as const

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** info (P4), success, warning (P3), error (P1 or P2). */
  severity?: BannerSeverity
  /** global: top of the app, system-wide. page: top of page content. section: inside a content section. inline: next to a specific element. */
  placement?: BannerPlacement
  /** Errors only: P1 is a system outage (not dismissible, receives focus), P2 is a blocked workflow. */
  priority?: 'P1' | 'P2'
  /** Short heading. Title-only, body-only and both are all valid. Never split one sentence across title and body. */
  title?: ReactNode
  /** Body text. */
  children?: ReactNode
  /** Replaces the default severity icon. The icon is always present: color is never the only signal. */
  icon?: ReactNode
  /** Prominent CTA. Verb + noun: "Reconnect Salesforce", "Review settings". */
  actionLabel?: string
  onAction?: () => void
  /** Renders the action as a link instead of a button. */
  actionHref?: string
  /** Replaces the default action entirely. */
  action?: ReactNode
  /** Shows a close button. Ignored for P1. */
  dismissible?: boolean
  onDismiss?: () => void
  dismissLabel?: string
  /** Move focus to the banner on mount. Default: only for P1, and only when focus is not already in a control. */
  focusOnMount?: boolean
  /** Forced states for docs and previews. Do not use in product code. */
  actionButtonProps?: Partial<ButtonProps>
  closeButtonProps?: Partial<ButtonProps>
}

/** Move focus to the nearest remaining focusable element so it never disappears with a removed banner. */
function focusNeighbor(from: HTMLElement) {
  const all = focusableIn(document.body)
  const after = all.find((el) => !from.contains(el) && (from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
  const before = [...all].reverse().find((el) => !from.contains(el) && (from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0)
  ;(after ?? before)?.focus()
}

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    severity = 'info', placement = 'page', priority, title, children, icon, actionLabel, onAction, actionHref, action,
    dismissible = false, onDismiss, dismissLabel = 'Dismiss', focusOnMount, actionButtonProps, closeButtonProps, className, ...rest
  },
  ref,
) {
  const resolved = resolveBannerPriority(severity, priority)
  const critical = resolved === 'P1'
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const titleId = useId()
  const canDismiss = dismissible && !critical
  const shouldFocus = focusOnMount ?? critical

  if (isDev()) {
    if (dismissible && critical) console.warn('Banner: P1 (critical) banners are not dismissible. `dismissible` is ignored.')
    if (title == null && children == null) console.warn('Banner: provide a title, a body, or both.')
  }

  useEffect(() => {
    const node = rootRef.current
    if (!shouldFocus || !node) return
    const active = document.activeElement
    // Never pull focus out of a control the user is working in. The alert role still announces it.
    if (!active || active === document.body) node.focus()
  }, [shouldFocus])

  if (dismissed) return null

  const dismiss = () => {
    if (rootRef.current) focusNeighbor(rootRef.current)
    setDismissed(true)
    onDismiss?.()
  }

  const hasAction = Boolean(action || actionLabel)
  const compact = placement === 'inline'

  return (
    <div
      ref={(node) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as { current: HTMLDivElement | null }).current = node
      }}
      role={severity === 'error' || severity === 'warning' ? 'alert' : 'status'}
      aria-labelledby={title != null ? titleId : undefined}
      tabIndex={shouldFocus ? -1 : undefined}
      className={cx(styles.root, styles[severity], className)}
      data-severity={severity}
      data-placement={placement}
      data-priority={resolved}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">{icon ?? <Icon name={ICON[severity]} />}</span>
      <div className={styles.content}>
        {title != null ? <p id={titleId} className={styles.title}>{title}</p> : null}
        {children != null ? <div className={styles.body}>{children}</div> : null}
      </div>
      {hasAction ? (
        <div className={styles.action}>
          {action ?? (actionHref ? (
            <Link variant="standalone" href={actionHref} onClick={onAction} trailingIcon={<Icon name="arrowRight" />}>{actionLabel}</Link>
          ) : (
            <Button priority={severity === 'error' ? 'primary' : 'secondary'} size={compact ? 'small' : 'medium'} onClick={onAction} {...actionButtonProps}>{actionLabel}</Button>
          ))}
        </div>
      ) : null}
      {canDismiss ? (
        <Button className={styles.close} priority="tertiary" size="small" iconOnly icon={<Icon name="close" />} aria-label={dismissLabel} onClick={dismiss} {...closeButtonProps} />
      ) : null}
    </div>
  )
})
