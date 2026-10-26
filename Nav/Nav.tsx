import { forwardRef, useEffect, useId, useRef, useState, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { useEscapeKey } from '../../primitives/hooks'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Badge } from '../Badge'
import { Button } from '../Button'
import styles from './Nav.module.css'

type ForcedState = 'hover' | 'pressed' | 'focus'

export interface NavSubItem {
  id: string
  /** Visible text. In the collapsed rail it stays as the accessible name and the tooltip. */
  label: string
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  /** Count indicator (notifications, tasks). 0 or undefined hides it. */
  badge?: number
  /** Spoken after the label, for example "3 unread". Defaults to "N new". */
  badgeLabel?: string
  /** Disabled items stay focusable (aria-disabled) so people can find them. */
  disabled?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  state?: ForcedState
}

export interface NavItem extends NavSubItem {
  /** Icon slot (INSTANCE_SWAP). Required for the collapsed rail. */
  icon?: ReactNode
  /** Second level. Two levels is the maximum: sub-items cannot have their own children. */
  children?: NavSubItem[]
}

export interface NavGroup {
  id: string
  /** Section header. Without it the group is separated by a divider. */
  label?: string
  items: NavItem[]
}

export interface NavProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  groups: NavGroup[]
  /** `id` of the item that is the current page. Gets aria-current="page". */
  currentId?: string
  /** Fixed (always expanded) when false. Collapsible adds the toggle between labels and the icon rail. */
  collapsible?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Called when an enabled item is activated. Call `preventDefault()` for client-side routing. */
  onNavigate?: (item: NavSubItem, e: MouseEvent<HTMLElement>) => void
  /** Top slot, for example a product logo. */
  header?: ReactNode
  /** Bottom slot above the collapse toggle. */
  footer?: ReactNode
  /** Tablet shows the icon rail, mobile hides the nav until `mobileOpen` (the Top Bar hamburger). Default true. */
  responsive?: boolean
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  /** Accessible names for the toggle. */
  collapseLabel?: string
  expandLabel?: string
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop'
/** Mobile < 768, tablet 768 to 1023, desktop 1024 and up (cross-cutting spec). */
function useBreakpoint(enabled: boolean): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('desktop')
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) { setBp('desktop'); return }
    const mobile = window.matchMedia('(max-width: 767.98px)')
    const tablet = window.matchMedia('(max-width: 1023.98px)')
    const on = () => setBp(mobile.matches ? 'mobile' : tablet.matches ? 'tablet' : 'desktop')
    on()
    mobile.addEventListener?.('change', on)
    tablet.addEventListener?.('change', on)
    return () => { mobile.removeEventListener?.('change', on); tablet.removeEventListener?.('change', on) }
  }, [enabled])
  return bp
}

const VISIBLE = '[data-nav-item]'
const isShown = (el: HTMLElement) => !el.closest('[hidden]')

export const Nav = forwardRef<HTMLElement, NavProps>(function Nav(
  {
    groups, currentId, collapsible = false, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, onNavigate,
    header, footer, responsive = true, mobileOpen = false, onMobileOpenChange, collapseLabel = 'Collapse navigation', expandLabel = 'Expand navigation',
    className, onKeyDown, onFocus, 'aria-label': ariaLabel = 'Main navigation', ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLElement>(null)
  const baseId = useId()
  const bp = useBreakpoint(responsive)
  const [collapsedState, setCollapsedState] = useControllableState<boolean>(collapsedProp, defaultCollapsed, onCollapsedChange)
  const [peek, setPeek] = useState(false)
  const rail = bp === 'tablet' ? !peek : collapsible && collapsedState
  const mobile = bp === 'mobile'

  const parentOf = (subId: string) => groups.flatMap((g) => g.items).find((i) => i.children?.some((c) => c.id === subId))
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const p = currentId ? parentOf(currentId) : undefined
    return p ? { [p.id]: true } : {}
  })
  // Keep the parent of the current page open when the current page changes.
  useEffect(() => {
    const p = currentId ? parentOf(currentId) : undefined
    if (p) setOpen((o) => (o[p.id] ? o : { ...o, [p.id]: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId])

  const firstId = groups.flatMap((g) => g.items)[0]?.id
  const [stop, setStop] = useState<string | undefined>(undefined)
  // Only one item is in the tab order. Fall back when the remembered item is no longer shown.
  const currentShown = currentId && (!parentOf(currentId) || open[parentOf(currentId)?.id ?? ''] ) ? currentId : undefined
  const tabStop = stop ?? currentShown ?? firstId

  useEscapeKey(() => onMobileOpenChange?.(false), mobile && mobileOpen)

  const toggleCollapsed = () => {
    if (bp === 'tablet') setPeek((p) => !p)
    else setCollapsedState(!collapsedState)
  }
  const expandRail = () => {
    if (bp === 'tablet') setPeek(true)
    else if (collapsible) setCollapsedState(false)
  }

  const items = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>(VISIBLE) ?? []).filter(isShown)
  const focusItem = (el: HTMLElement | undefined) => { if (el) { setStop(el.dataset.navItem); el.focus() } }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const target = (e.target as HTMLElement).closest<HTMLElement>(VISIBLE)
    if (!target) return
    const list = items()
    const i = list.indexOf(target)
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    const parentId = target.dataset.parent
    const hasChildren = target.dataset.hasChildren === 'true'
    const isOpen = hasChildren && open[target.dataset.navItem ?? '']
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); focusItem(list[Math.min(list.length - 1, i + 1)]); break
      case 'ArrowUp': e.preventDefault(); focusItem(list[Math.max(0, i - 1)]); break
      case 'Home': e.preventDefault(); focusItem(list[0]); break
      case 'End': e.preventDefault(); focusItem(list[list.length - 1]); break
      case forward:
        if (hasChildren) {
          e.preventDefault()
          if (rail) expandRail()
          if (!isOpen) setOpen((o) => ({ ...o, [target.dataset.navItem as string]: true }))
          else focusItem(list[i + 1])
        }
        break
      case back:
        if (parentId) { e.preventDefault(); focusItem(list.find((el) => el.dataset.navItem === parentId)) }
        else if (isOpen) { e.preventDefault(); setOpen((o) => ({ ...o, [target.dataset.navItem as string]: false })) }
        break
      default:
    }
  }
  const handleFocus = (e: FocusEvent<HTMLElement>) => {
    onFocus?.(e)
    const id = (e.target as HTMLElement).closest<HTMLElement>(VISIBLE)?.dataset.navItem
    if (id) setStop(id)
  }

  const activate = (item: NavSubItem) => (e: MouseEvent<HTMLElement>) => {
    if (item.disabled) { e.preventDefault(); return }
    item.onClick?.(e)
    onNavigate?.(item, e)
    if (mobile && !e.defaultPrevented) onMobileOpenChange?.(false)
  }

  const renderBadge = (item: NavSubItem) => (item.badge ? (
    <>
      <span className={styles.badge} aria-hidden="true"><Badge kind="count" count={item.badge} live={false} /></span>
      <VisuallyHidden>{`, ${item.badgeLabel ?? `${item.badge} new`}`}</VisuallyHidden>
    </>
  ) : null)

  const renderLabel = (item: NavSubItem) => (rail ? <VisuallyHidden>{item.label}</VisuallyHidden> : <span className={styles.label}>{item.label}</span>)
  const renderTooltip = (item: NavSubItem) => (rail ? <span className={styles.tooltip} aria-hidden="true">{item.label}</span> : null)

  const itemProps = (item: NavSubItem, extra?: { parent?: string; hasChildren?: boolean }) => ({
    'data-nav-item': item.id,
    'data-parent': extra?.parent,
    'data-has-children': extra?.hasChildren ? 'true' : undefined,
    'data-state': item.state,
    tabIndex: tabStop === item.id ? 0 : -1,
    'aria-disabled': item.disabled || undefined,
  })

  const renderSub = (sub: NavSubItem, parent: NavItem) => {
    const current = currentId === sub.id
    const common = { className: styles.item, 'data-level': '2', 'aria-current': current ? ('page' as const) : undefined, onClick: activate(sub), ...itemProps(sub, { parent: parent.id }) }
    return (
      <li key={sub.id} className={styles.li}>
        {sub.href && !sub.disabled
          ? <a href={sub.href} {...common}>{renderLabel(sub)}{renderBadge(sub)}</a>
          : <button type="button" {...common}>{renderLabel(sub)}{renderBadge(sub)}</button>}
      </li>
    )
  }

  const renderItem = (item: NavItem) => {
    const current = currentId === item.id
    const hasChildren = !!item.children?.length
    const expanded = hasChildren && !!open[item.id] && !rail
    const descendantCurrent = hasChildren && item.children?.some((c) => c.id === currentId)
    const icon = (
      <span className={styles.icon} aria-hidden="true">
        {item.icon ?? <span className={styles.initial}>{item.label.slice(0, 1)}</span>}
      </span>
    )
    const subId = `${baseId}-sub-${item.id}`
    if (hasChildren) {
      return (
        <li key={item.id} className={styles.li}>
          <button
            type="button"
            className={styles.item}
            data-level="1"
            data-descendant-current={descendantCurrent || undefined}
            aria-expanded={expanded}
            aria-controls={subId}
            onClick={(e) => {
              if (item.disabled) { e.preventDefault(); return }
              if (rail) { expandRail(); setOpen((o) => ({ ...o, [item.id]: true })); return }
              setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))
            }}
            {...itemProps(item, { hasChildren: true })}
          >
            {icon}{renderLabel(item)}{renderBadge(item)}
            {!rail ? <span className={styles.chevron} data-open={expanded || undefined} aria-hidden="true"><Icon name="chevronDown" /></span> : null}
            {renderTooltip(item)}
          </button>
          <ul id={subId} className={styles.sub} role="list" hidden={!expanded}>
            {item.children?.map((c) => renderSub(c, item))}
          </ul>
        </li>
      )
    }
    const common = { className: styles.item, 'data-level': '1', 'aria-current': current ? ('page' as const) : undefined, onClick: activate(item), ...itemProps(item) }
    const inner = <>{icon}{renderLabel(item)}{renderBadge(item)}{renderTooltip(item)}</>
    return (
      <li key={item.id} className={styles.li}>
        {item.href && !item.disabled ? <a href={item.href} {...common}>{inner}</a> : (
          item.href ? <a role="link" {...common}>{inner}</a> : <button type="button" {...common}>{inner}</button>
        )}
      </li>
    )
  }

  return (
    <nav
      ref={mergeRefs(ref, rootRef)}
      className={cx(styles.root, className)}
      aria-label={ariaLabel}
      data-collapsed={rail || undefined}
      data-breakpoint={bp}
      data-collapsible={collapsible || undefined}
      hidden={mobile && !mobileOpen ? true : undefined}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    >
      {header ? <div className={styles.header}>{header}</div> : null}
      <div className={styles.scroll}>
        {groups.map((g, gi) => {
          const labelId = `${baseId}-group-${g.id}`
          return (
            <div key={g.id} className={styles.group} data-divider={gi > 0 && !g.label ? true : undefined} data-labelled={g.label ? true : undefined}>
              {g.label ? (rail
                ? <VisuallyHidden id={labelId}>{g.label}</VisuallyHidden>
                : <p id={labelId} className={styles.groupLabel}>{g.label}</p>) : null}
              <ul className={styles.list} role="list" aria-labelledby={g.label ? labelId : undefined}>
                {g.items.map(renderItem)}
              </ul>
            </div>
          )
        })}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
      {(collapsible || bp === 'tablet') && !mobile ? (
        <div className={styles.toggle}>
          <Button
            priority="tertiary"
            iconOnly
            icon={<Icon name={rail ? 'chevronsRight' : 'chevronsLeft'} />}
            aria-label={rail ? expandLabel : collapseLabel}
            aria-expanded={!rail}
            onClick={toggleCollapsed}
          />
        </div>
      ) : null}
    </nav>
  )
})
