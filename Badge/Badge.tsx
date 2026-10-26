import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon, type IconName } from '../../icons'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'critical' | 'accent'
export type BadgeKind = 'status' | 'category' | 'count' | 'new'

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** status: state of an object. category: type or feature. count: numeric indicator. new: New or Beta moniker. */
  kind?: BadgeKind
  /** Fill. Defaults: new is accent, everything else neutral. Pair every tone with text. */
  tone?: BadgeTone
  /** Leading icon slot. Status badges with a non-neutral tone get a default icon so color is never the only signal. Pass `false` to remove it. */
  icon?: ReactNode | false
  /** Numeric value for kind="count". */
  count?: number
  /** Counts above this show as "max+". */
  max?: number
  /** Announce changes to assistive tech. Defaults to true for counts. */
  live?: boolean
  /** Visible text for status, category and new. Keep to 1 or 2 words. */
  children?: ReactNode
}

const STATUS_ICON: Partial<Record<BadgeTone, IconName>> = { critical: 'error', warning: 'warning', success: 'success', info: 'info' }

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { kind = 'status', tone, icon, count, max = 99, live, className, children, title, ...rest },
  ref,
) {
  const resolved: BadgeTone = tone ?? (kind === 'new' ? 'accent' : 'neutral')
  const isCount = kind === 'count'
  const shown = isCount ? (count != null && count > max ? `${max}+` : String(count ?? 0)) : children
  const leading = icon === false
    ? null
    : icon ?? (kind === 'status' && STATUS_ICON[resolved] ? <Icon name={STATUS_ICON[resolved] as IconName} /> : null)
  const isLive = live ?? isCount
  return (
    <span
      ref={ref}
      className={cx(styles.root, className)}
      data-kind={kind}
      data-tone={resolved}
      role={isLive ? 'status' : undefined}
      aria-live={isLive ? 'polite' : undefined}
      aria-atomic={isLive ? true : undefined}
      title={title ?? (isCount && count != null && count > max ? String(count) : undefined)}
      {...rest}
    >
      {leading ? <span className={styles.icon} aria-hidden="true">{leading}</span> : null}
      <span className={styles.label}>{shown}</span>
    </span>
  )
})
