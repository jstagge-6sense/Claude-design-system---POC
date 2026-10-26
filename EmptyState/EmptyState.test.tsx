import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { Button } from '../Button'

describe('EmptyState', () => {
  it('renders the title as a heading with the description', () => {
    render(<EmptyState title="No segments yet" description="Create one." action={<Button>Create segment</Button>} />)
    expect(screen.getByRole('heading', { name: 'No segments yet' })).toBeTruthy()
    expect(screen.getByText('Create one.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create segment' })).toBeTruthy()
  })
  it('renders links as a list of real links', () => {
    render(<EmptyState title="No results" links={[{ label: 'Clear filters', href: '#clear' }, { label: 'Search by domain', href: '#domain' }]} />)
    expect(screen.getAllByRole('listitem').length).toBe(2)
    expect(screen.getByRole('link', { name: 'Clear filters' })).toBeTruthy()
  })
  it('error variant is an alert and onRetry renders a keyboard reachable retry button', () => {
    const onRetry = vi.fn()
    render(<EmptyState variant="error" title="We couldn’t load accounts" onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
  it('hides the default illustration from assistive tech and can remove it', () => {
    const { container, rerender } = render(<EmptyState title="Empty" action={<Button>Add</Button>} />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
    rerender(<EmptyState title="Empty" action={<Button>Add</Button>} illustration={false} />)
    expect(container.querySelector('[data-icon]')).toBeNull()
  })
  it('minimal drops the illustration and may omit a path forward', () => {
    const { container } = render(<EmptyState minimal title="No notes" />)
    expect(container.querySelector('[data-icon]')).toBeNull()
    expect(screen.getByRole('heading', { name: 'No notes' })).toBeTruthy()
  })
  it('warns in development when there is no path forward', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    // @ts-expect-error a non-minimal empty state requires action, links or onRetry
    render(<EmptyState title="Nothing here" />)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
