import { render, screen, fireEvent } from '@testing-library/react'
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb'

const ITEMS: BreadcrumbItem[] = [
  { label: 'Workspace', href: '#w' },
  { label: 'Segments', href: '#s' },
  { label: 'Enterprise', href: '#e' },
  { label: 'North America', href: '#n' },
  { label: 'Q4 targets' },
]

describe('Breadcrumb', () => {
  it('is a nav labelled Breadcrumb containing an ordered list', () => {
    render(<Breadcrumb items={ITEMS} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav.querySelector('ol')).toBeTruthy()
    expect(screen.getAllByRole('listitem').length).toBe(5)
  })
  it('marks the current item with aria-current and does not link it', () => {
    render(<Breadcrumb items={ITEMS} />)
    const current = screen.getByText('Q4 targets')
    expect(current.closest('[aria-current="page"]')).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Q4 targets' })).toBeNull()
    expect(screen.getAllByRole('link').length).toBe(4)
  })
  it('hides separators from assistive tech', () => {
    const { container } = render(<Breadcrumb items={ITEMS} />)
    const seps = container.querySelectorAll('[aria-hidden="true"]')
    expect(seps.length).toBeGreaterThanOrEqual(4)
  })
  it('collapses middle items behind an ellipsis button that expands', () => {
    render(<Breadcrumb items={ITEMS} truncate />)
    expect(screen.queryByRole('link', { name: 'Segments' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Enterprise' })).toBeNull()
    const more = screen.getByRole('button', { name: 'Show hidden levels' })
    expect(more.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(more)
    expect(screen.getByRole('link', { name: 'Segments' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Show hidden levels' })).toBeNull()
  })
  it('does not collapse a path that would hide only one level', () => {
    render(<Breadcrumb items={ITEMS.slice(0, 4)} truncate />)
    expect(screen.queryByRole('button', { name: 'Show hidden levels' })).toBeNull()
  })
  it('renders a home icon root with an accessible name', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '#h' }, { label: 'Accounts', href: '#a' }, { label: 'Acme' }]} homeIcon />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy()
  })
  it('keeps the current page last when the path has one item', () => {
    render(<Breadcrumb items={[{ label: 'Accounts' }]} />)
    expect(screen.getByText('Accounts').closest('[aria-current="page"]')).toBeTruthy()
  })
})
