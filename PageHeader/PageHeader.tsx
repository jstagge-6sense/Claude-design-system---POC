import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import { Avatar } from '../Avatar'
import { Badge, type BadgeTone } from '../Badge'
import { Breadcrumb, type BreadcrumbItem } from '../Breadcrumb'
import { Button } from '../Button'
import { SkeletonBlock, SkeletonLoader } from '../SkeletonLoader'
import { MiniMenu, type MiniMenuItem } from '../TopBar/MiniMenu'
import styles from './PageHeader.module.css'

export interface PageAction {
  id: string
  /** Verb + noun: "Create segment", not "Create". */
  label: string
  onClick?: () => void
  /** One primary per header. */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'destructive'
  /** Leading icon slot. */
  icon?: ReactNode
  disabled?: boolean
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Page title. Rendered as the page heading. */
  title: string
  /** Heading level of the title. Default 1: there should be one h1 per page. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  /** Hierarchical context above the title. The last item is the current page. */
  breadcrumb?: BreadcrumbItem[]
  description?: ReactNode
  /**
   * Right-aligned actions, most important first. The first `maxVisibleActions` are buttons, the rest go to
   * the "More actions" menu. On narrow containers only the first action stays visible.
   * Governance: 1 primary + 2 others visible, 5 in total at most.
   */
  actions?: PageAction[]
  maxVisibleActions?: number
  overflowLabel?: string
  /** Page-level tabs. Tabs sit inside the header, flush with its bottom edge. Pass the Tabs `TabList`. */
  tabs?: ReactNode
  /** Metadata: status badge, last modified and owner. Only the three documented items belong here. */
  status?: { label: string; tone?: BadgeTone }
  lastModified?: string
  owner?: { name: string; src?: string }
  /** Async title: shows a skeleton for the title and description. */
  loading?: boolean
  /** Stay at the top of the scroll area (position sticky, sticky z-index tier). */
  sticky?: boolean
  /** Adds the elevation shadow to a sticky header that has content scrolled under it. */
  stuck?: boolean
  /** Render the overflow menu open, for docs and previews. */
  defaultOverflowOpen?: boolean
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  {
    title, headingLevel = 1, breadcrumb, description, actions = [], maxVisibleActions = 3, overflowLabel = 'More actions', tabs, status, lastModified, owner,
    loading = false, sticky = false, stuck = false, defaultOverflowOpen = false, className, ...rest
  },
  ref,
) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    if (actions.filter((a) => (a.priority ?? 'secondary') === 'primary').length > 1) console.warn('PageHeader: use one primary action per header.')
    if (actions.length > 5) console.warn('PageHeader: more than 5 actions. Move some into the page content.')
  }
  const visible = actions.slice(0, maxVisibleActions)
  const overflowWide = actions.slice(maxVisibleActions)
  const overflowNarrow = actions.slice(1)
  const toItem = (a: PageAction): MiniMenuItem => ({ id: a.id, label: a.label, icon: a.icon, disabled: a.disabled, onSelect: a.onClick, tone: a.priority === 'destructive' ? 'destructive' : 'default' })
  const hasMeta = !!(status || lastModified || owner)

  const menu = (items: PageAction[], className: string, open = false) => (
    <div className={className}>
      <MiniMenu
        label={overflowLabel}
        items={items.map(toItem)}
        defaultOpen={open}
        trigger={(p) => <Button priority="secondary" iconOnly icon={<Icon name="more" />} aria-label={overflowLabel} {...p} />}
      />
    </div>
  )

  return (
    <header
      ref={ref}
      className={cx(styles.root, className)}
      data-sticky={sticky || undefined}
      data-stuck={(sticky && stuck) || undefined}
      data-has-tabs={tabs ? true : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {breadcrumb?.length ? <Breadcrumb items={breadcrumb} /> : null}
      <div className={styles.row}>
        <div className={styles.titleBlock}>
          {loading ? (
            <SkeletonLoader variant="custom" label="Loading page header">
              <SkeletonBlock width="min(24rem, 70%)" height="1.75rem" />
              <SkeletonBlock width="min(36rem, 90%)" height="1rem" />
            </SkeletonLoader>
          ) : (
            <>
              {createElement(`h${headingLevel}`, { className: styles.title }, title)}
              {description ? <p className={styles.description}>{description}</p> : null}
            </>
          )}
        </div>
        {actions.length && !loading ? (
          <div className={styles.actions}>
            {visible.map((a, i) => (
              <Button
                key={a.id}
                className={i > 0 ? styles.collapsible : undefined}
                priority={a.priority ?? (i === 0 ? 'primary' : 'secondary')}
                icon={a.icon}
                disabled={a.disabled}
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ))}
            {overflowWide.length ? menu(overflowWide, styles.overflowWide, defaultOverflowOpen && overflowNarrow.length === 0) : null}
            {overflowNarrow.length ? menu(overflowNarrow, styles.overflowNarrow, defaultOverflowOpen) : null}
          </div>
        ) : null}
      </div>
      {hasMeta && !loading ? (
        <ul className={styles.meta} role="list">
          {status ? <li><Badge kind="status" tone={status.tone ?? 'neutral'}>{status.label}</Badge></li> : null}
          {lastModified ? <li>{`Last modified ${lastModified}`}</li> : null}
          {owner ? (
            <li className={styles.owner}>
              <span>Owner</span>
              <span aria-hidden="true"><Avatar name={owner.name} src={owner.src} size="small" /></span>
              <span>{owner.name}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
      {tabs ? <div className={styles.tabs}>{tabs}</div> : null}
    </header>
  )
})
