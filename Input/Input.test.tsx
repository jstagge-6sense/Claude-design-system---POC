import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('associates a persistent label with the input', () => {
    render(<Input label="Segment name" />)
    expect(screen.getByLabelText('Segment name')).toBeTruthy()
  })
  it('marks required fields in text and with aria-required', () => {
    render(<Input label="Email" requirement="required" />)
    expect(screen.getByText('(required)')).toBeTruthy()
    expect(screen.getByLabelText(/Email/).getAttribute('aria-required')).toBe('true')
  })
  it('wires the error with aria-describedby and aria-invalid', () => {
    render(<Input label="Email" error="Enter an email address." />)
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const id = input.getAttribute('aria-describedby') ?? ''
    expect(document.getElementById(id.split(' ')[0])?.textContent).toContain('Enter an email address.')
  })
  it('validates on blur and not while typing', () => {
    render(<Input label="Email" validate={(v) => (v.includes('@') ? undefined : 'Enter an email address.')} />)
    const input = screen.getByLabelText('Email')
    fireEvent.change(input, { target: { value: 'priya' } })
    expect(screen.queryByText('Enter an email address.')).toBeNull()
    fireEvent.blur(input)
    expect(screen.getByText('Enter an email address.')).toBeTruthy()
    fireEvent.change(input, { target: { value: 'priya@acme.com' } })
    expect(screen.queryByText('Enter an email address.')).toBeNull()
  })
  it('does not validate an untouched field', () => {
    render(<Input label="Email" requirement="required" />)
    expect(screen.queryByText('Enter a value to continue.')).toBeNull()
  })
  it('shows a character counter', () => {
    render(<Input label="Name" maxLength={10} defaultValue="abc" />)
    expect(screen.getByText('3/10')).toBeTruthy()
  })
  it('clears the value with the clear button', () => {
    const onClear = vi.fn()
    render(<Input label="Name" clearable defaultValue="abc" onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('')
    expect(onClear).toHaveBeenCalled()
  })
  it('toggles password visibility', () => {
    render(<Input label="Password" type="password" passwordToggle defaultValue="secret" />)
    const toggle = screen.getByRole('button', { name: 'Show password' })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('aria-pressed')).toBe('true')
    expect((screen.getByLabelText('Password') as HTMLInputElement).type).toBe('text')
  })
  it('disabled is natively disabled and read-only is not', () => {
    const { rerender } = render(<Input label="Name" disabled />)
    expect((screen.getByLabelText('Name') as HTMLInputElement).disabled).toBe(true)
    rerender(<Input label="Name" readOnly defaultValue="x" />)
    const input = screen.getByLabelText('Name') as HTMLInputElement
    expect(input.disabled).toBe(false)
    expect(input.readOnly).toBe(true)
  })
  it('marks aria-busy while loading', () => {
    render(<Input label="URL" loading />)
    expect(screen.getByLabelText('URL').getAttribute('aria-busy')).toBe('true')
  })
})
