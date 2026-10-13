import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'

const nav = [
  { id: 'a', label: 'Accounts', href: '#a', current: true },
  { id: 'b', label: 'Segments', href: '#b' },
]
const apps = [{ id: 'x', label: 'Intent', href: '#x' }, { id: 'y', label: 'Data', href: '#y' }]

describe('TopBar', () => {
  it('is a banner landmark with a labelled primary navigation', () => {
    render(<TopBar logo={<span>Logo</span>} navItems={nav} />)
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Accounts' }).getAttribute('aria-current')).toBe('page')
  })
  it('puts the skip link first in the tab order', () => {
    render(<TopBar logo={<a href="#home">Home</a>} navItems={nav} />)
    const first = screen.getByRole('banner').querySelector('a, button')
    expect(first?.textContent).toBe('Skip to main content')
  })
  it('names the notification button with the unread count and announces it', () => {
    render(<TopBar logo={<span>Logo</span>} notifications={{ count: 3 }} />)
    expect(screen.getByRole('button', { name: 'Notifications, 3 unread' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('3 unread notifications')
  })
  it('opens the profile menu, moves focus into it and closes on Escape with focus returned', () => {
    render(<TopBar logo={<span>Logo</span>} user={{ name: 'Priya Raman' }} />)
    const trigger = screen.getByRole('button', { name: 'Priya Raman' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const items = screen.getAllByRole('menuitem')
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(items[1], { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
  it('opens the app switcher with ArrowDown on the trigger', () => {
    render(<TopBar logo={<span>Logo</span>} apps={apps} />)
    const trigger = screen.getByRole('button', { name: 'Switch app' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('menu', { name: 'Switch app' })).toBeTruthy()
  })
  it('toggles the hamburger with aria-expanded', () => {
    render(<TopBar logo={<span>Logo</span>} navItems={nav} />)
    const b = screen.getByRole('button', { name: 'Menu' })
    expect(b.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(b)
    expect(b.getAttribute('aria-expanded')).toBe('true')
  })
  it('marks the scrolled state', () => {
    render(<TopBar logo={<span>Logo</span>} scrolled />)
    expect(screen.getByRole('banner').hasAttribute('data-scrolled')).toBe(true)
  })
})
