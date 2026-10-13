import { render, screen, fireEvent } from '@testing-library/react'
import { Nav, type NavGroup } from './Nav'
import { useNavCollapsed } from './useNavCollapsed'

const groups: NavGroup[] = [
  {
    id: 'g',
    items: [
      { id: 'home', label: 'Dashboard', href: '#home' },
      { id: 'inbox', label: 'Inbox', href: '#inbox', badge: 3, badgeLabel: '3 unread' },
      { id: 'reports', label: 'Reports', children: [{ id: 'pipeline', label: 'Pipeline', href: '#pipeline' }] },
      { id: 'billing', label: 'Billing', disabled: true },
    ],
  },
]

describe('Nav', () => {
  it('is a navigation landmark named Main navigation', () => {
    render(<Nav groups={groups} />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeTruthy()
  })
  it('marks only the current page with aria-current', () => {
    render(<Nav groups={groups} currentId="home" />)
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: /Inbox/ }).getAttribute('aria-current')).toBeNull()
  })
  it('keeps one item in the tab order and moves with arrow keys', () => {
    render(<Nav groups={groups} currentId="home" />)
    const home = screen.getByRole('link', { name: 'Dashboard' })
    const inbox = screen.getByRole('link', { name: /Inbox/ })
    expect(home.getAttribute('tabindex')).toBe('0')
    expect(inbox.getAttribute('tabindex')).toBe('-1')
    home.focus()
    fireEvent.keyDown(home, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(inbox)
  })
  it('expands a parent with aria-expanded and shows the second level', () => {
    render(<Nav groups={groups} />)
    const parent = screen.getByRole('button', { name: 'Reports' })
    expect(parent.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(parent)
    expect(parent.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Pipeline' })).toBeTruthy()
  })
  it('does not navigate from a disabled item', () => {
    const onNavigate = vi.fn()
    render(<Nav groups={groups} onNavigate={onNavigate} />)
    const b = screen.getByRole('button', { name: 'Billing' })
    fireEvent.click(b)
    expect(onNavigate).not.toHaveBeenCalled()
    expect(b.getAttribute('aria-disabled')).toBe('true')
  })
  it('keeps accessible names in the collapsed rail', () => {
    render(<Nav groups={groups} collapsible collapsed />)
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Expand navigation' }).getAttribute('aria-expanded')).toBe('false')
  })
  it('announces badge counts in the item name', () => {
    render(<Nav groups={groups} />)
    expect(screen.getByRole('link', { name: /Inbox.*3 unread/ })).toBeTruthy()
  })
  it('toggles collapsed through the toggle button', () => {
    const onCollapsedChange = vi.fn()
    render(<Nav groups={groups} collapsible onCollapsedChange={onCollapsedChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Collapse navigation' }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })
})

describe('useNavCollapsed', () => {
  it('exports a hook', () => {
    expect(typeof useNavCollapsed).toBe('function')
  })
})
