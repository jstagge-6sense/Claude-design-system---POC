import { render, screen, fireEvent } from '@testing-library/react'
import { ButtonGroup } from './ButtonGroup'

const ITEMS = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]

describe('ButtonGroup', () => {
  it('is a labelled group', () => {
    render(<ButtonGroup aria-label="Report period" items={ITEMS} />)
    expect(screen.getByRole('group', { name: 'Report period' })).toBeTruthy()
  })
  it('action mode runs onAction and has no pressed state', () => {
    const onAction = vi.fn()
    render(<ButtonGroup aria-label="Actions" items={ITEMS} onAction={onAction} />)
    const b = screen.getByRole('button', { name: 'Week' })
    fireEvent.click(b)
    expect(onAction).toHaveBeenCalledWith('week')
    expect(b.getAttribute('aria-pressed')).toBeNull()
  })
  it('single selection exposes aria-pressed and replaces the selection', () => {
    const onValueChange = vi.fn()
    render(<ButtonGroup aria-label="Period" items={ITEMS} mode="selection" defaultValue={['day']} onValueChange={onValueChange} />)
    expect(screen.getByRole('button', { name: 'Day' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Month' }))
    expect(onValueChange).toHaveBeenCalledWith(['month'])
    expect(screen.getByRole('button', { name: 'Day' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Month' }).getAttribute('aria-pressed')).toBe('true')
  })
  it('single selection cannot be emptied', () => {
    render(<ButtonGroup aria-label="Period" items={ITEMS} mode="selection" defaultValue={['day']} />)
    fireEvent.click(screen.getByRole('button', { name: 'Day' }))
    expect(screen.getByRole('button', { name: 'Day' }).getAttribute('aria-pressed')).toBe('true')
  })
  it('multi selection toggles', () => {
    render(<ButtonGroup aria-label="Channels" items={ITEMS} mode="selection" selectionMode="multi" />)
    fireEvent.click(screen.getByRole('button', { name: 'Day' }))
    fireEvent.click(screen.getByRole('button', { name: 'Week' }))
    fireEvent.click(screen.getByRole('button', { name: 'Day' }))
    expect(screen.getByRole('button', { name: 'Day' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Week' }).getAttribute('aria-pressed')).toBe('true')
  })
  it('arrow keys move focus between segments with one tab stop', () => {
    render(<ButtonGroup aria-label="Period" items={ITEMS} mode="selection" defaultValue={['day']} />)
    const [day, week, month] = ['Day', 'Week', 'Month'].map((n) => screen.getByRole('button', { name: n }))
    expect(day.tabIndex).toBe(0)
    expect(week.tabIndex).toBe(-1)
    day.focus()
    fireEvent.keyDown(day, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(week)
    fireEvent.keyDown(week, { key: 'End' })
    expect(document.activeElement).toBe(month)
    fireEvent.keyDown(month, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(day)
  })
  it('a disabled segment is skipped and does not change state', () => {
    const onValueChange = vi.fn()
    render(<ButtonGroup aria-label="Period" mode="selection" onValueChange={onValueChange} items={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week', disabled: true }, { value: 'month', label: 'Month' }]} />)
    const day = screen.getByRole('button', { name: 'Day' })
    const week = screen.getByRole('button', { name: 'Week' })
    expect(week.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(week)
    expect(onValueChange).not.toHaveBeenCalled()
    day.focus()
    fireEvent.keyDown(day, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Month' }))
  })
  it('stacked groups use the up and down arrows', () => {
    render(<ButtonGroup aria-label="Period" items={ITEMS} stack />)
    const day = screen.getByRole('button', { name: 'Day' })
    day.focus()
    fireEvent.keyDown(day, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Week' }))
  })
})
