import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon, type IconName } from '../../icons'
import { Button } from '../Button'
import { Link } from '../Link'
import styles from './EmptyState.module.css'

export type EmptyStateVariant = 'firstUse' | 'noResults' | 'error' | 'noData' | 'noPermission'

export interface EmptyStateLink {
  label: string
  href?: string
  onClick?: () => void
}

interface EmptyStateBase extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** firstUse: welcome and onboarding. noResults: search or filters matched nothing. error: data failed to load. noData: nothing created yet. noPermission: access restricted. */
  variant?: EmptyStateVariant
  /** Why it is empty. Be specific, never just "No data found". */
  title: ReactNode
  /** What to do about it. Explain the reason and the next step. */
  description?: ReactNode
  /**
   * Illustration slot (INSTANCE_SWAP). Pass the Revvy mascot or any artwork where space allows.
   * The default is a neutral abstract icon disc chosen by `variant`. Pass `false` to remove it.
   * Illustrations are decorative: always keep the text.
   */
  illustration?: ReactNode | false
  /** Heading level of the title. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Compact padding for cards, popovers and table bodies. */
  size?: 'default' | 'compact'
  /** Text only, for compact areas. The only form that may omit a path forward. */
  minimal?: boolean
}

/** Every empty state must give the user a way forward: an action, links, or (for errors) a retry. */
export type EmptyStateProps = EmptyStateBase & (
  | { minimal: true; action?: ReactNode; links?: EmptyStateLink[]; onRetry?: () => void }
  | { minimal?: false; action: ReactNode; links?: EmptyStateLink[]; onRetry?: () => void }
  | { minimal?: false; action?: ReactNode; links: EmptyStateLink[]; onRetry?: () => void }
  | { minimal?: false; action?: ReactNode; links?: EmptyStateLink[]; onRetry: () => void }
)

const DEFAULT_ICON: Record<EmptyStateVariant, IconName> = {
  firstUse: 'sparkle',
  noResults: 'search',
  error: 'warning',
  noData: 'inbox',
  noPermission: 'lock',
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(props, ref) {
  const {
    variant = 'noData', title, description, illustration, headingLevel = 3, size = 'default', minimal = false,
    action, links, onRetry, className, ...rest
  } = props as EmptyStateBase & { action?: ReactNode; links?: EmptyStateLink[]; onRetry?: () => void }

  const hasLinks = Boolean(links && links.length > 0)
  const hasPath = Boolean(action) || hasLinks || Boolean(onRetry)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production' && !minimal && !hasPath) {
    console.warn('EmptyState: every empty state needs a path forward. Pass `action`, `links` or `onRetry`, or set `minimal`.')
  }

  const Heading = `h${headingLevel}` as 'h3'
  const art = minimal || illustration === false
    ? null
    : illustration ?? <span className={styles.disc} aria-hidden="true"><Icon name={DEFAULT_ICON[variant]} size="var(--component-emptyState-all-illustration-iconSize)" /></span>
  const role = variant === 'error' ? 'alert' : variant === 'noResults' ? 'status' : undefined

  return (
    <div
      ref={ref}
      role={role}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-size={minimal ? 'compact' : size}
      data-minimal={minimal || undefined}
      {...rest}
    >
      {art ? <div className={styles.art} aria-hidden="true">{art}</div> : null}
      <div className={styles.text}>
        <Heading className={styles.title}>{title}</Heading>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action || onRetry ? (
        <div className={styles.actions}>
          {action}
          {onRetry && !action ? <Button priority="secondary" icon={<Icon name="refresh" />} onClick={onRetry}>Try again</Button> : null}
        </div>
      ) : null}
      {hasLinks ? (
        <ul className={styles.links}>
          {links!.map((l) => (
            <li key={l.label}>
              <Link href={l.href} onClick={l.onClick ? (e) => { if (!l.href) e.preventDefault(); l.onClick?.() } : undefined}>{l.label}</Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
})
