import { render, screen, fireEvent } from '@testing-library/react'
import { Radio, RadioGroup } from './Radio'

const Group = (props: Partial<React.ComponentProps<typeof RadioGroup>>) => (
  <RadioGroup legend="Frequency" {...props}>
    <Radio value="daily" label="Daily" />
    <Radio value="weekly" label="Weekly" />
    <Radio value="monthly" label="Monthly" />
  </RadioGroup>
)

describe('RadioGroup', () => {
  it('renders a radiogroup named by its legend', () => {
    render(<Group />)
    expect(screen.getByRole('radiogroup', { name: 'Frequency' })).toBeTruthy()
    expect(screen.getAllByRole('radio').length).toBe(3)
  })
  it('selects an option on click and reports the value', () => {
    const onValueChange = vi.fn()
    render(<Group onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Weekly' }))
    expect(onValueChange).toHaveBeenCalledWith('weekly')
    expect((screen.getByRole('radio', { name: 'Weekly' }) as HTMLInputElement).checked).toBe(true)
  })
  it('keeps only the selected radio in the tab order', () => {
    render(<Group defaultValue="weekly" />)
    expect(screen.getByRole('radio', { name: 'Weekly' }).getAttribute('tabindex')).not.toBe('-1')
    expect(screen.getByRole('radio', { name: 'Daily' }).getAttribute('tabindex')).toBe('-1')
    expect(screen.getByRole('radio', { name: 'Monthly' }).getAttribute('tabindex')).toBe('-1')
  })
  it('moves focus and selection with arrow keys and wraps', () => {
    const onValueChange = vi.fn()
    render(<Group defaultValue="monthly" onValueChange={onValueChange} />)
    const monthly = screen.getByRole('radio', { name: 'Monthly' })
    monthly.focus()
    fireEvent.keyDown(monthly, { key: 'ArrowDown' })
    expect(onValueChange).toHaveBeenLastCalledWith('daily')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Daily' }))
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' })
    expect(onValueChange).toHaveBeenLastCalledWith('monthly')
  })
  it('skips disabled options with the keyboard', () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup legend="Frequency" defaultValue="daily" onValueChange={onValueChange}>
        <Radio value="daily" label="Daily" />
        <Radio value="weekly" label="Weekly" disabled />
        <Radio value="monthly" label="Monthly" />
      </RadioGroup>,
    )
    const daily = screen.getByRole('radio', { name: 'Daily' })
    daily.focus()
    fireEvent.keyDown(daily, { key: 'ArrowDown' })
    expect(onValueChange).toHaveBeenLastCalledWith('monthly')
  })
  it('does not select a disabled option', () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup legend="Frequency" onValueChange={onValueChange}>
        <Radio value="daily" label="Daily" disabled />
      </RadioGroup>,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Daily' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })
  it('links the group error message', () => {
    render(<Group error="Choose a frequency." />)
    const group = screen.getByRole('radiogroup', { name: 'Frequency' })
    expect(group.getAttribute('aria-describedby')).toBeTruthy()
    expect(screen.getByText('Choose a frequency.')).toBeTruthy()
  })
  it('links per-option descriptions', () => {
    render(
      <RadioGroup legend="Plan" variant="card">
        <Radio value="team" label="Team" description="Up to 20 seats." />
      </RadioGroup>,
    )
    expect(screen.getByRole('radio', { name: 'Team' }).getAttribute('aria-describedby')).toBeTruthy()
  })
})
