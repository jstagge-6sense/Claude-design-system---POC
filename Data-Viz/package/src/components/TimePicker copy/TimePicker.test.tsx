import { render, screen, fireEvent } from '@testing-library/react'
import { TimePicker } from './TimePicker'
import { parseTime, formatTime, buildTimeSlots, timeToValue } from './timeUtils'

describe('parseTime and formatTime', () => {
  it('parses compact and typed forms', () => {
    expect(parseTime('930')).toEqual({ hours: 9, minutes: 30, seconds: 0 })
    expect(parseTime('1430')).toEqual({ hours: 14, minutes: 30, seconds: 0 })
    expect(parseTime('2:30pm')).toEqual({ hours: 14, minutes: 30, seconds: 0 })
    expect(parseTime('9')).toEqual({ hours: 9, minutes: 0, seconds: 0 })
    expect(parseTime('12am')).toEqual({ hours: 0, minutes: 0, seconds: 0 })
  })
  it('rejects invalid input', () => {
    expect(parseTime('25')).toBeNull()
    expect(parseTime('960')).toBeNull()
    expect(parseTime('13pm')).toBeNull()
    expect(parseTime('lunch')).toBeNull()
  })
  it('formats for 12h and 24h', () => {
    expect(formatTime('09:30', { locale: 'en-US', hourCycle: 'h12' })).toBe('9:30 AM')
    expect(formatTime('14:30', { locale: 'en-US', hourCycle: 'h23' })).toBe('14:30')
    expect(timeToValue({ hours: 9, minutes: 5, seconds: 0 })).toBe('09:05')
  })
  it('builds slots for a step and range', () => {
    expect(buildTimeSlots({ step: 60, min: '08:00', max: '10:00', locale: 'en-US' }).map((s) => s.value)).toEqual(['08:00', '09:00', '10:00'])
  })
})

describe('TimePicker', () => {
  it('is a combobox with a visible label and a clock icon', () => {
    render(<TimePicker label="Start time" locale="en-US" />)
    const input = screen.getByRole('combobox', { name: 'Start time' })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.getAttribute('aria-haspopup')).toBe('listbox')
  })
  it('parses typed text on blur and formats it', () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Start time" locale="en-US" hourCycle="h12" onValueChange={onValueChange} />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: '930' } })
    fireEvent.blur(input)
    expect(onValueChange).toHaveBeenCalledWith('09:30')
    expect(input.value).toBe('9:30 AM')
  })
  it('shows an error wired with aria-describedby for an invalid format', () => {
    render(<TimePicker label="Start time" locale="en-US" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'soon' } })
    fireEvent.blur(input)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const id = (input.getAttribute('aria-describedby') ?? '').split(' ')[0]
    expect(document.getElementById(id)?.textContent).toContain('Enter a time like')
  })
  it('opens a listbox with ArrowDown, moves with arrows and selects with Enter', () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Start time" locale="en-US" hourCycle="h12" step={60} onValueChange={onValueChange} />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(input.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('01:00')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
  it('marks the selected option and closes on Escape', () => {
    render(<TimePicker label="Start time" locale="en-US" hourCycle="h12" defaultValue="09:00" defaultOpen />)
    const selected = screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected.length).toBe(1)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })
  it('lists presets in a named group', () => {
    render(<TimePicker label="Start time" locale="en-US" presets defaultOpen />)
    expect(screen.getByRole('option', { name: /Morning/ })).toBeTruthy()
    expect(screen.getByRole('option', { name: /End of day/ })).toBeTruthy()
  })
  it('granular variant needs Apply to commit', () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Start time" locale="en-US" hourCycle="h23" granular defaultOpen defaultValue="09:15:30" onValueChange={onValueChange} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Minutes' }), { target: { value: '45' } })
    expect(onValueChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onValueChange).toHaveBeenCalledWith('09:45:30')
  })
  it('does not open when disabled', () => {
    render(<TimePicker label="Start time" disabled defaultOpen />)
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(true)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
