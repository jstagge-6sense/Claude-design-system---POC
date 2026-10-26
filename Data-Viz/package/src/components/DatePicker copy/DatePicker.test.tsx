import { render, screen, fireEvent, within } from '@testing-library/react'
import { DatePicker } from './DatePicker'
import { addDays, addMonths, formatDate, getDateFormatHint, getWeekStart, monthGrid, parseDate, parseDateRange, quarterOf } from './dateUtils'

const TODAY = '2026-10-06'

describe('parseDate and formatDate', () => {
  it('parses common formats leniently', () => {
    const o = { locale: 'en-US', today: TODAY }
    expect(parseDate('2026-01-05', o)).toBe('2026-01-05')
    expect(parseDate('1/5/2026', o)).toBe('2026-01-05')
    expect(parseDate('Jan 5, 2026', o)).toBe('2026-01-05')
    expect(parseDate('5 January 2026', o)).toBe('2026-01-05')
    expect(parseDate('25/12/2026', o)).toBe('2026-12-25')
    expect(parseDate('today', o)).toBe(TODAY)
  })
  it('follows the locale order for ambiguous dates', () => {
    expect(parseDate('05/01/2026', { locale: 'en-GB', today: TODAY })).toBe('2026-01-05')
    expect(parseDate('05/01/2026', { locale: 'en-US', today: TODAY })).toBe('2026-05-01')
  })
  it('rejects dates that do not exist', () => {
    expect(parseDate('2/30/2026', { locale: 'en-US' })).toBeNull()
    expect(parseDate('soon', { locale: 'en-US' })).toBeNull()
  })
  it('parses a range', () => {
    expect(parseDateRange('1/5/2026 - 1/12/2026', { locale: 'en-US', today: TODAY })).toEqual({ start: '2026-01-05', end: '2026-01-12' })
  })
  it('formats by locale and handles plain calendar arithmetic', () => {
    expect(formatDate('2026-01-05', { locale: 'en-US' })).toBe('01/05/2026')
    expect(formatDate('2026-01-05', { locale: 'de-DE' })).toBe('05.01.2026')
    expect(getDateFormatHint('en-GB')).toBe('DD/MM/YYYY')
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(quarterOf(TODAY)).toEqual({ start: '2026-10-01', end: '2026-12-31' })
    expect(getWeekStart('de-DE')).toBe(1)
    expect(monthGrid(2026, 10, 0)[0][0]).toBe('2026-09-27')
  })
})

describe('DatePicker', () => {
  it('is a combobox with a visible label, a placeholder format and a dialog popup', () => {
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} />)
    const input = screen.getByRole('combobox', { name: 'Due date' }) as HTMLInputElement
    expect(input.placeholder).toBe('MM/DD/YYYY')
    expect(input.getAttribute('aria-haspopup')).toBe('dialog')
  })
  it('accepts typing and formats on blur', () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} onValueChange={onValueChange} />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Jan 5 2026' } })
    fireEvent.blur(input)
    expect(onValueChange).toHaveBeenCalledWith('2026-01-05')
    expect(input.value).toBe('01/05/2026')
  })
  it('explains an invalid date with aria-describedby', () => {
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'nope' } })
    fireEvent.blur(input)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const id = (input.getAttribute('aria-describedby') ?? '').split(' ')[0]
    expect(document.getElementById(id)?.textContent).toContain('Enter a date like')
  })
  it('renders a labelled grid, marks today and the selected day', () => {
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} defaultOpen defaultValue="2026-10-14" />)
    const grid = screen.getByRole('grid', { name: 'October 2026' })
    expect(grid).toBeTruthy()
    expect(within(grid).getByRole('button', { name: /Tuesday, October 6, 2026/ }).getAttribute('aria-current')).toBe('date')
    expect(within(grid).getByRole('button', { name: /October 14, 2026/ }).closest('td')?.getAttribute('aria-selected')).toBe('true')
  })
  it('single date auto-applies and closes', () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} defaultOpen onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('button', { name: /October 20, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith('2026-10-20')
    expect(screen.queryByRole('grid')).toBeNull()
  })
  it('range needs Apply', () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Period" mode="range" locale="en-US" today={TODAY} defaultOpen onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('button', { name: /October 5, 2026/ }))
    fireEvent.click(screen.getByRole('button', { name: /October 9, 2026/ }))
    expect(onValueChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-10-05', end: '2026-10-09' })
  })
  it('presets set the draft range', () => {
    render(<DatePicker label="Period" mode="range" presets locale="en-US" today={TODAY} defaultOpen />)
    fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }))
    expect(screen.getByRole('button', { name: 'Last 7 days' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /September 30, 2026, start of range/ })).toBeTruthy()
  })
  it('moves with the arrow keys, PageDown and Enter', () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} defaultOpen defaultValue="2026-10-14" onValueChange={onValueChange} />)
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('2026-11-15')
  })
  it('does not select disabled dates and shows constraints upfront', () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} defaultOpen min="2026-10-10" onValueChange={onValueChange} />)
    expect(screen.getAllByText(/Available from/).length).toBeGreaterThan(0)
    const d = screen.getByRole('button', { name: /October 8, 2026/ })
    expect(d.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(d)
    expect(onValueChange).not.toHaveBeenCalled()
  })
  it('closes on Escape', () => {
    render(<DatePicker label="Due date" locale="en-US" today={TODAY} defaultOpen />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('grid')).toBeNull()
  })
  it('with time composes a TimePicker', () => {
    render(<DatePicker label="Send on" withTime locale="en-US" today={TODAY} />)
    expect(screen.getByRole('combobox', { name: 'Time' })).toBeTruthy()
  })
  it('does not open when disabled', () => {
    render(<DatePicker label="Due date" disabled defaultOpen />)
    expect(screen.queryByRole('grid')).toBeNull()
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(true)
  })
})
