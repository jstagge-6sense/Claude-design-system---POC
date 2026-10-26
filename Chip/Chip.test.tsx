import { render, screen, fireEvent } from '@testing-library/react'
import { Chip, ChipGroup } from './Chip'

describe('Chip', () => {
  it('dismissible chip has a Remove [text] button that calls onDismiss', () => {
    const onDismiss = vi.fn()
    render(<Chip variant="dismissible" onDismiss={onDismiss}>Healthcare</Chip>)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Healthcare' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
  it('uses dismissLabel when children are not plain text', () => {
    render(<Chip variant="dismissible" dismissLabel="Remove Acme Corp"><strong>Acme Corp</strong></Chip>)
    expect(screen.getByRole('button', { name: 'Remove Acme Corp' })).toBeTruthy()
  })
  it('choice chip is a toggle button with aria-pressed', () => {
    const onSelectedChange = vi.fn()
    render(<Chip variant="choice" onSelectedChange={onSelectedChange}>High intent</Chip>)
    const b = screen.getByRole('button', { name: 'High intent' })
    expect(b.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(b)
    expect(b.getAttribute('aria-pressed')).toBe('true')
    expect(onSelectedChange).toHaveBeenCalledWith(true)
  })
  it('view-only chip is not interactive', () => {
    render(<Chip variant="viewOnly">Series B</Chip>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Series B')).toBeTruthy()
  })
  it('disabled choice chip ignores clicks', () => {
    const onSelectedChange = vi.fn()
    render(<Chip variant="choice" disabled onSelectedChange={onSelectedChange}>Unavailable</Chip>)
    const b = screen.getByRole('button', { name: 'Unavailable' }) as HTMLButtonElement
    fireEvent.click(b)
    expect(onSelectedChange).not.toHaveBeenCalled()
    expect(b.disabled).toBe(true)
  })
  it('disabled dismissible chip cannot be removed', () => {
    const onDismiss = vi.fn()
    render(<Chip variant="dismissible" disabled onDismiss={onDismiss}>Locked</Chip>)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Locked' }))
    expect(onDismiss).not.toHaveBeenCalled()
  })
})

describe('ChipGroup', () => {
  it('is a labelled group', () => {
    render(<ChipGroup aria-label="Selected industries"><Chip variant="viewOnly">Healthcare</Chip></ChipGroup>)
    expect(screen.getByRole('group', { name: 'Selected industries' })).toBeTruthy()
  })
  it('shows Clear all and calls the handler', () => {
    const onClearAll = vi.fn()
    render(<ChipGroup aria-label="Filters" onClearAll={onClearAll}><Chip variant="dismissible">Healthcare</Chip></ChipGroup>)
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })
  it('hides Clear all when not requested', () => {
    render(<ChipGroup aria-label="Filters"><Chip variant="dismissible">Healthcare</Chip></ChipGroup>)
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
  })
})
