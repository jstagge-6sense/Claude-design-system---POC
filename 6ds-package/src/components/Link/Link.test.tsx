import { render, screen, fireEvent } from '@testing-library/react'
import { Link } from './Link'

describe('Link', () => {
  it('renders a native anchor with its href and accessible name', () => {
    render(<Link href="/segments">View segments</Link>)
    const a = screen.getByRole('link', { name: 'View segments' })
    expect(a.tagName).toBe('A')
    expect(a.getAttribute('href')).toBe('/segments')
  })
  it('external links open in a new tab and say so in the accessible name', () => {
    render(<Link href="https://example.com" external>Read the docs</Link>)
    const a = screen.getByRole('link', { name: 'Read the docs (opens in new tab)' })
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
  })
  it('adds a hidden new-tab hint when children are not plain text', () => {
    render(<Link href="https://example.com" external><strong>Docs</strong></Link>)
    expect(screen.getByRole('link').textContent).toContain('opens in new tab')
  })
  it('disabled links drop the href, set aria-disabled and ignore clicks', () => {
    const onClick = vi.fn()
    render(<Link href="/x" disabled onClick={onClick}>Export</Link>)
    const a = screen.getByRole('link', { name: 'Export' })
    fireEvent.click(a)
    expect(onClick).not.toHaveBeenCalled()
    expect(a.getAttribute('aria-disabled')).toBe('true')
    expect(a.getAttribute('href')).toBeNull()
  })
  it('fires onClick for enabled links', () => {
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault())
    render(<Link href="/x" onClick={onClick}>Open</Link>)
    fireEvent.click(screen.getByRole('link', { name: 'Open' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
