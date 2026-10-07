import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox, CheckboxGroup } from './Checkbox'

describe('Checkbox', () => {
  it('has an accessible name from its label and toggles on click', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Send updates" onChange={onChange} />)
    const box = screen.getByRole('checkbox', { name: 'Send updates' }) as HTMLInputElement
    fireEvent.click(box)
    expect(box.checked).toBe(true)
    expect(onChange).toHaveBeenCalledTimes(1)
  })
  it('exposes aria-checked mixed when indeterminate', () => {
    render(<Checkbox label="Select all" indeterminate />)
    const box = screen.getByRole('checkbox', { name: 'Select all' }) as HTMLInputElement
    expect(box.getAttribute('aria-checked')).toBe('mixed')
    expect(box.indeterminate).toBe(true)
  })
  it('links the description with aria-describedby', () => {
    render(<Checkbox label="Share" description="Teammates can edit." />)
    expect(screen.getByRole('checkbox', { name: 'Share' }).getAttribute('aria-describedby')).toBeTruthy()
  })
  it('does not toggle when disabled', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Locked" disabled onChange={onChange} />)
    const box = screen.getByRole('checkbox', { name: 'Locked' }) as HTMLInputElement
    fireEvent.click(box)
    expect(onChange).not.toHaveBeenCalled()
    expect(box.disabled).toBe(true)
  })
  it('marks a standalone error and shows its message', () => {
    render(<Checkbox label="Agree" error errorMessage="Accept the terms to continue." />)
    expect(screen.getByRole('checkbox', { name: 'Agree' }).getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('Accept the terms to continue.')).toBeTruthy()
  })
})

describe('CheckboxGroup', () => {
  it('renders a fieldset with a legend and tracks selected values', () => {
    const onValueChange = vi.fn()
    render(
      <CheckboxGroup legend="Channels" defaultValue={['email']} onValueChange={onValueChange}>
        <Checkbox value="email" label="Email" />
        <Checkbox value="slack" label="Slack" />
      </CheckboxGroup>,
    )
    expect(screen.getByRole('group', { name: 'Channels' })).toBeTruthy()
    expect((screen.getByRole('checkbox', { name: 'Email' }) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Slack' }))
    expect(onValueChange).toHaveBeenCalledWith(['email', 'slack'])
  })
  it('puts every option in error and links the message', () => {
    render(
      <CheckboxGroup legend="Channels" error="Select at least one channel.">
        <Checkbox value="email" label="Email" />
      </CheckboxGroup>,
    )
    expect(screen.getByRole('checkbox', { name: 'Email' }).getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('group', { name: 'Channels' }).getAttribute('aria-describedby')).toBeTruthy()
  })
})
