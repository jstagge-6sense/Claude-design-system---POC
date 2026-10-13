import { forwardRef, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Search, type SearchProps } from '../Search'
import { MiniMenu, type MiniMenuItem } from './MiniMenu'
import styles from './TopBar.module.css'

export interface TopBarNavItem {
  id: string
  label: string
  href: string
  /** The section the person is in. Gets aria-current="page". */
  current?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  state?: 'hover' | 'pressed' | 'focus'
}

export interface TopBarApp {
  id: string
  label: string
  href?: string
  /** Icon slot (INSTANCE_SWAP). */
  icon?: ReactNode
  onSelect?: () => void
}

export interface TopBarUser {
  name: string
  email?: string
  /** Photo URL. Falls back to initials. */
  src?: string
}

export interface TopBarNotifications {
  /** Unread count. 0 hides the badge. */
  count: number
  onClick?: () => void
  /** Reflects an open notification center. */
  expanded?: boolean
  /** Accessible name of the button, without the count. */
  label?: string
}

export interface TopBarActionProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible name. Icon-only buttons always need one. */
  label: string
  /** Icon slot (INSTANCE_SWAP). */
  icon: ReactNode
  /** Overlay slot, for example a count badge. */
  children?: ReactNode
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
}

/** Icon action button in the Top Bar styling. Use it in the `actions` slot so custom actions match. */
export const TopBarAction = forwardRef<HTMLButtonElement, TopBarActionProps>(function TopBarAction({ label, icon, className, children, type = 'button', ...rest }, ref) {
  return (
    <button ref={ref} type={type} className={cx(styles.action, className)} aria-label={label} {...rest}>
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      {children}
    </button>
  )
})

export interface TopBarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Logo slot. Usually a link to the home page: give it an accessible name. */
  logo: ReactNode
  /** Primary navigation. Never changes between pages. */
  navItems?: TopBarNavItem[]
  navLabel?: string
  /** Global search slot (any search control). Takes precedence over `searchProps`. */
  search?: ReactNode
  /** Integrated global search: renders the Search component (global variant) with these props. */
  searchProps?: Partial<SearchProps>
  /** Notification button with an unread count badge. Updates are announced politely. */
  notifications?: TopBarNotifications
  /** App switcher: switch between product areas. */
  apps?: TopBarApp[]
  appSwitcherLabel?: string
  /** Signed-in person. Renders the avatar profile menu. */
  user?: TopBarUser
  /** Profile menu items. Defaults to Profile, Account settings, Help and Sign out. */
  userMenuItems?: MiniMenuItem[]
  /** Extra actions slot, rendered before the notification button. */
  actions?: ReactNode
  /** Where the skip link goes. The target gets focus. */
  skipTo?: string
  skipLabel?: string
  /** Hamburger panel open state (primary nav on small containers). */
  menuOpen?: boolean
  defaultMenuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
  menuLabel?: string
  /** Distinct scrolled state (elevation). Leave undefined to follow the window scroll position. */
  scrolled?: boolean
  /** Stay at the top of the viewport. Default true. */
  sticky?: boolean
  /** "/" focuses the search when no field is focused. Default true. */
  searchShortcut?: boolean
  /** Render the profile menu or app switcher open, for docs and previews. */
  defaultProfileMenuOpen?: boolean
  defaultAppSwitcherOpen?: boolean
}

const DEFAULT_MENU: MiniMenuItem[] = [
  { id: 'profile', label: 'Your profile', icon: <Icon name="user" /> },
  { id: 'settings', label: 'Account settings', icon: <Icon name="settings" /> },
  { id: 'help', label: 'Help and support', icon: <Icon name="info" /> },
  { id: 'signout', label: 'Sign out', icon: <Icon name="arrowRight" />, separatorBefore: true },
]

export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar(
  {
    logo, navItems, navLabel = 'Primary', search, searchProps, notifications, apps, appSwitcherLabel = 'Switch app', user, userMenuItems = DEFAULT_MENU,
    actions, skipTo = '#main-content', skipLabel = 'Skip to main content', menuOpen: menuOpenProp, defaultMenuOpen = false, onMenuOpenChange, menuLabel = 'Menu',
    scrolled: scrolledProp, sticky = true, searchShortcut = true, defaultProfileMenuOpen = false, defaultAppSwitcherOpen = false, className, ...rest
  },
  ref,
) {
  const baseId = useId()
  const navId = `${baseId}-nav`
  const searchId = `${baseId}-search`
  const searchRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useControllableState<boolean>(menuOpenProp, defaultMenuOpen, onMenuOpenChange)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrollY, setScrollY] = useState(false)
  const scrolled = scrolledProp ?? scrollY

  useEffect(() => {
    if (scrolledProp !== undefined || typeof window === 'undefined') return
    const on = () => setScrollY(window.scrollY > 0)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [scrolledProp])

  // "/" focuses the search when nothing editable is focused (cross-cutting keyboard shortcuts).
  const hasSearch = !!(search || searchProps)
  useEffect(() => {
    if (!searchShortcut || !hasSearch) return
    const on = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const field = searchRef.current?.querySelector<HTMLElement>('input, [role="searchbox"], [role="combobox"]')
      if (!field) return
      e.preventDefault()
      setSearchOpen(true)
      // Wait a frame so a collapsed search is visible before it takes focus.
      requestAnimationFrame(() => field.focus())
    }
    document.addEventListener('keydown', on)
    return () => document.removeEventListener('keydown', on)
  }, [searchShortcut, hasSearch])

  const goToContent = (e: MouseEvent<HTMLAnchorElement>) => {
    const id = skipTo.startsWith('#') ? skipTo.slice(1) : undefined
    const target = id ? document.getElementById(id) : null
    if (!target) return
    e.preventDefault()
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus()
    target.scrollIntoView?.({ block: 'start' })
  }

  const count = notifications?.count ?? 0
  const searchNode = search ?? (searchProps ? <Search variant="global" label="Search" {...searchProps} /> : null)

  return (
    <header
      ref={ref}
      role="banner"
      className={cx(styles.root, className)}
      data-scrolled={scrolled || undefined}
      data-sticky={sticky || undefined}
      data-menu-open={menuOpen || undefined}
      data-search-open={searchOpen || undefined}
      {...rest}
    >
      <a className={styles.skip} href={skipTo} onClick={goToContent}>{skipLabel}</a>
      <div className={styles.inner}>
        {navItems?.length ? (
          <TopBarAction
            className={styles.hamburger}
            label={menuLabel}
            icon={<Icon name={menuOpen ? 'close' : 'menu'} />}
            aria-expanded={menuOpen}
            aria-controls={navId}
            onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }}
          />
        ) : null}
        <div className={styles.logo}>{logo}</div>
        {navItems?.length ? (
          <nav id={navId} className={styles.nav} aria-label={navLabel}>
            <ul className={styles.links} role="list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a className={styles.link} href={item.href} aria-current={item.current ? 'page' : undefined} data-state={item.state}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <div className={styles.spacer} />
        {searchNode ? (
          <div id={searchId} ref={searchRef} className={styles.search}>{searchNode}</div>
        ) : null}
        <div className={styles.region}>
          {searchNode ? (
            <TopBarAction
              className={styles.searchToggle}
              label="Search"
              icon={<Icon name="search" />}
              aria-expanded={searchOpen}
              aria-controls={searchId}
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }}
            />
          ) : null}
          {actions}
          {notifications ? (
            <>
              <TopBarAction
                label={`${notifications.label ?? 'Notifications'}${count > 0 ? `, ${count} unread` : ''}`}
                icon={<Icon name="bell" />}
                aria-expanded={notifications.expanded}
                aria-haspopup={notifications.expanded !== undefined ? 'dialog' : undefined}
                onClick={notifications.onClick}
              >
                {count > 0 ? <span className={styles.badge} aria-hidden="true"><Badge kind="count" count={count} tone="critical" live={false} /></span> : null}
              </TopBarAction>
              <VisuallyHidden role="status" aria-live="polite">{count > 0 ? `${count} unread notifications` : 'No unread notifications'}</VisuallyHidden>
            </>
          ) : null}
          {apps?.length ? (
            <MiniMenu
              label={appSwitcherLabel}
              layout="grid"
              defaultOpen={defaultAppSwitcherOpen}
              items={apps.map((a) => ({ id: a.id, label: a.label, href: a.href, icon: a.icon, onSelect: a.onSelect }))}
              trigger={(p, s) => (
                <TopBarAction label={appSwitcherLabel} icon={<Icon name="appSwitcher" />} data-open={s.open || undefined} {...p} />
              )}
            />
          ) : null}
          {user ? (
            <MiniMenu
              label="Account"
              defaultOpen={defaultProfileMenuOpen}
              items={userMenuItems}
              header={<><strong>{user.name}</strong>{user.email ? <div>{user.email}</div> : null}</>}
              trigger={(p) => <Avatar name={user.name} src={user.src} size="medium" {...p} />}
            />
          ) : null}
        </div>
      </div>
    </header>
  )
})
