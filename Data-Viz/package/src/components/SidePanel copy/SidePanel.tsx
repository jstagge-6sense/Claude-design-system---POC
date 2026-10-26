import { forwardRef, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button, type ButtonProps } from '../Button'
import { Spinner } from '../Spinner'
import { useOverlayLayer } from '../Dialog/overlay'
import styles from './SidePanel.module.css'

export interface SidePanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** Required. Panel name. Also the landmark label ("Filters"). */
  title: string
  /** Fixed: always expanded, no toggle. Collapsible: toggles between the full panel and an icon rail. */
  collapsible?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Edge it sits on. Logical, so `start` is the left edge in LTR and the right edge in RTL. */
  side?: 'start' | 'end'
  /** Search slot under the title row. Pass a contextual Search. */
  search?: ReactNode
  /** Actions slot beside the title. */
  headerActions?: ReactNode
  /** Icon-only controls shown in the rail while collapsed. Use `SidePanelRailItem`. Stays out of the way when expanded. */
  rail?: ReactNode
  /** Optional footer, shown while expanded. */
  footer?: ReactNode
  /** Content area is loading. Children stay mounted. */
  loading?: boolean
  loadingLabel?: string
  /** Rare. Traps focus and closes with Escape (collapses). A side panel never traps focus otherwise and never locks scroll. */
  modal?: boolean
  /** Accessible name of the rail group. */
  railLabel?: string
  /** Forced state for the collapse toggle in docs and previews. */
  toggleProps?: Partial<ButtonProps>
  /** Children stay mounted while collapsed so state is preserved. */
  children?: ReactNode
}

export const SidePanel = forwardRef<HTMLElement, SidePanelProps>(function SidePanel(
  {
    title, collapsible = false, collapsed, defaultCollapsed = false, onCollapsedChange, side = 'start', search, headerActions, rail,
    footer, loading = false, loadingLabel = 'Loading', modal = false, railLabel = 'Quick actions', toggleProps, children, className, ...rest
  },
  ref,
) {
  const [state, setCollapsed] = useControllableState<boolean>(collapsed, defaultCollapsed, onCollapsedChange)
  const isCollapsed = collapsible && state
  const bodyId = useId()
  const titleId = useId()
  const rootRef = useRef<HTMLElement | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const toggle = () => {
    const next = !isCollapsed
    setCollapsed(next)
    setAnnouncement(`${title} panel ${next ? 'collapsed' : 'expanded'}`)
  }

  useOverlayLayer(rootRef, {
    active: modal && !isCollapsed, kind: 'panel', trap: true, lockScroll: false, autoFocus: true,
    onEscape: () => { if (collapsible) toggle() },
  })

  // Chevrons point toward the edge while expanded (collapse) and away from it while collapsed (expand). Icon mirrors in RTL.
  const towardEdge = side === 'start' ? 'chevronsLeft' : 'chevronsRight'
  const awayFromEdge = side === 'start' ? 'chevronsRight' : 'chevronsLeft'

  return (
    <aside
      ref={(node) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as { current: HTMLElement | null }).current = node
      }}
      role={modal ? 'dialog' : 'complementary'}
      aria-modal={modal ? 'true' : undefined}
      aria-label={title}
      aria-busy={loading || undefined}
      className={cx(styles.root, className)}
      data-side={side}
      data-collapsed={isCollapsed || undefined}
      data-collapsible={collapsible || undefined}
      {...rest}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 id={titleId} className={styles.title} hidden={isCollapsed}>{title}</h2>
          {headerActions ? <div className={styles.actions} hidden={isCollapsed}>{headerActions}</div> : null}
          {collapsible ? (
            <Button
              className={styles.toggle}
              priority="tertiary"
              size="small"
              iconOnly
              icon={<Icon name={isCollapsed ? awayFromEdge : towardEdge} />}
              aria-label={isCollapsed ? `Expand ${title} panel` : `Collapse ${title} panel`}
              aria-expanded={!isCollapsed}
              aria-controls={bodyId}
              onClick={toggle}
              {...toggleProps}
            />
          ) : null}
        </div>
        {search ? <div className={styles.search} hidden={isCollapsed}>{search}</div> : null}
      </div>
      <div id={bodyId} className={styles.body} hidden={isCollapsed} data-loading={loading || undefined}>
        <div className={styles.content}>{children}</div>
        {loading ? <Spinner overlay size="medium" label={loadingLabel} /> : null}
      </div>
      {footer ? <div className={styles.footer} hidden={isCollapsed}>{footer}</div> : null}
      {rail ? <div className={styles.rail} role="group" aria-label={railLabel} hidden={!isCollapsed}>{rail}</div> : null}
      <VisuallyHidden role="status" aria-live="polite">{announcement}</VisuallyHidden>
    </aside>
  )
})

export interface SidePanelRailItemProps extends Omit<ButtonProps, 'iconOnly' | 'children' | 'priority' | 'size'> {
  /** Required accessible name for the icon-only control. */
  label: string
  icon: ReactNode
}

/** Icon-only control for the collapsed rail. */
export const SidePanelRailItem = forwardRef<HTMLButtonElement, SidePanelRailItemProps>(function SidePanelRailItem({ label, icon, ...rest }, ref) {
  return <Button ref={ref} priority="tertiary" size="medium" iconOnly icon={icon} aria-label={label} title={label} {...rest} />
})
