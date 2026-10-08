import { render, screen, fireEvent } from '@testing-library/react'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('exposes spinbutton semantics with min, max and now', () => {
    render(<NumberInput label="Seats" min={0} max={10} defaultValue={4} />)
    const el = screen.getByRole('spinbutton', { name: 'Seats' })
    expect(el.getAttribute('aria-valuemin')).toBe('0')
    expect(el.getAttribute('aria-valuemax')).toBe('10')
    expect(el.getAttribute('aria-valuenow')).toBe('4')
  })
  it('has accessible stepper buttons that change the value', () => {
    const onValueChange = vi.fn()
    render(<NumberInput label="Seats" defaultValue={4} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(onValueChange).toHaveBeenLastCalledWith(4)
  })
  it('steps with ArrowUp and ArrowDown and jumps with Home and End', () => {
    render(<NumberInput label="Seats" min={0} max={10} defaultValue={4} />)
    const el = screen.getByRole('spinbutton')
    fireEvent.keyDown(el, { key: 'ArrowUp' })
    expect(el.getAttribute('aria-valuenow')).toBe('5')
    fireEvent.keyDown(el, { key: 'ArrowDown' })
    fireEvent.keyDown(el, { key: 'ArrowDown' })
    expect(el.getAttribute('aria-valuenow')).toBe('3')
    fireEvent.keyDown(el, { key: 'End' })
    expect(el.getAttribute('aria-valuenow')).toBe('10')
    fireEvent.keyDown(el, { key: 'Home' })
    expect(el.getAttribute('aria-valuenow')).toBe('0')
  })
  it('rejects e, +, - and letters on keydown', () => {
    render(<NumberInput label="Seats" min={0} defaultValue={1} />)
    const el = screen.getByRole('spinbutton')
    for (const key of ['e', 'E', '+', '-', 'a', '.']) {
      expect(fireEvent.keyDown(el, { key })).toBe(false)
    }
    expect(fireEvent.keyDown(el, { key: '5' })).toBe(true)
  })
  it('strips non-numeric characters from pasted text', () => {
    render(<NumberInput label="Seats" min={0} defaultValue={null} />)
    const el = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(el, { target: { value: '1e+5abc' } })
    expect(el.value).toBe('15')
  })
  it('clamps to max on blur and communicates the boundary', () => {
    render(<NumberInput label="Seats" min={0} max={10} defaultValue={4} />)
    const el = screen.getByRole('spinbutton') as HTMLInputElement
    fireEvent.change(el, { target: { value: '99' } })
    fireEvent.blur(el)
    expect(el.value).toBe('10')
    expect(screen.getByText(/maximum of 10/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Increase value' }).getAttribute('aria-disabled')).toBe('true')
  })
  it('shows the unit and includes it in aria-valuetext', () => {
    render(<NumberInput label="Window" unit="days" defaultValue={30} />)
    expect(screen.getByText('days')).toBeTruthy()
    expect(screen.getByRole('spinbutton').getAttribute('aria-valuetext')).toBe('30 days')
  })
  it('disabled disables the field and steppers', () => {
    render(<NumberInput label="Seats" disabled defaultValue={1} />)
    expect((screen.getByRole('spinbutton') as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Increase value', hidden: true }) as HTMLButtonElement).disabled).toBe(true)
  })
  it('wires errors via aria-describedby', () => {
    render(<NumberInput label="Seats" error="Enter at least 1." />)
    const el = screen.getByRole('spinbutton')
    expect(el.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById((el.getAttribute('aria-describedby') ?? '').split(' ')[0])?.textContent).toContain('Enter at least 1.')
  })
})
