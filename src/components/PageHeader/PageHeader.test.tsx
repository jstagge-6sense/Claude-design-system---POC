import { render, screen, fireEvent } from '@testing-library/react'
import { PageHeader } from './PageHeader'

const actions = [
  { id: 'a', label: 'Create segment', priority: 'primary' as const },
  { id: 'b', label: 'Export list' },
  { id: 'c', label: 'Share segment' },
  { id: 'd', label: 'Duplicate segment' },
]

describe('PageHeader', () => {
  it('renders the title as an h1 by default and honours headingLevel', () => {
    const { rerender } = render(<PageHeader title="Segments" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Segments' })).toBeTruthy()
    rerender(<PageHeader title="Segments" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Segments' })).toBeTruthy()
  })
  it('renders a breadcrumb navigation when given items', () => {
    render(<PageHeader title="Segments" breadcrumb={[{ label: 'Home', href: '#' }, { label: 'Segments' }]} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
  })
  it('fires an action', () => {
    const onClick = vi.fn()
    render(<PageHeader title="Segments" actions={[{ id: 'a', label: 'Create segment', onClick }]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Create segment' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it('puts actions beyond the limit into the More actions menu', () => {
    render(<PageHeader title="Segments" actions={actions} maxVisibleActions={3} />)
    const triggers = screen.getAllByRole('button', { name: 'More actions' })
    fireEvent.click(triggers[0])
    expect(screen.getByRole('menuitem', { name: 'Duplicate segment' })).toBeTruthy()
  })
  it('shows metadata', () => {
    render(<PageHeader title="Segments" status={{ label: 'Active', tone: 'success' }} lastModified="Oct 2" owner={{ name: 'Priya Raman' }} />)
    expect(screen.getByText('Active')).toBeTruthy()
    expect(screen.getByText('Last modified Oct 2')).toBeTruthy()
    expect(screen.getByText('Priya Raman')).toBeTruthy()
  })
  it('shows a skeleton and aria-busy while loading', () => {
    const { container } = render(<PageHeader title="Segments" loading />)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByRole('status', { name: 'Loading page header' })).toBeTruthy()
    expect(container.querySelector('header')?.getAttribute('aria-busy')).toBe('true')
  })
})
