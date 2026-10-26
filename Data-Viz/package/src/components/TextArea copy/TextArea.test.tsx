import { render, screen, fireEvent } from '@testing-library/react'
import { TextArea } from './TextArea'

describe('TextArea', () => {
  it('associates a persistent label', () => {
    render(<TextArea label="Description" />)
    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA')
  })
  it('wires the error through aria-describedby', () => {
    render(<TextArea label="Description" error="Enter at least 20 characters." />)
    const el = screen.getByLabelText('Description')
    expect(el.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById((el.getAttribute('aria-describedby') ?? '').split(' ')[0])?.textContent).toContain('Enter at least 20 characters.')
  })
  it('validates on blur, not while typing', () => {
    render(<TextArea label="Notes" validate={(v) => (v.length < 5 ? 'Too short.' : undefined)} />)
    const el = screen.getByLabelText('Notes')
    fireEvent.change(el, { target: { value: 'ab' } })
    expect(screen.queryByText('Too short.')).toBeNull()
    fireEvent.blur(el)
    expect(screen.getByText('Too short.')).toBeTruthy()
  })
  it('shows a counter', () => {
    render(<TextArea label="Notes" maxLength={20} defaultValue="hello" />)
    expect(screen.getByText('5/20')).toBeTruthy()
  })
  it('disabled disables the field and every child action', () => {
    render(<TextArea label="Notes" disabled actions={<button type="button">Generate</button>} tags={<button type="button">Account</button>} />)
    expect((screen.getByLabelText('Notes') as HTMLTextAreaElement).disabled).toBe(true)
    expect((screen.getByRole('group', { name: 'Text actions', hidden: true }) as HTMLFieldSetElement).disabled).toBe(true)
    expect((screen.getByRole('group', { name: 'Tags', hidden: true }) as HTMLFieldSetElement).disabled).toBe(true)
  })
  it('read-only is not disabled', () => {
    render(<TextArea label="Notes" readOnly defaultValue="x" />)
    const el = screen.getByLabelText('Notes') as HTMLTextAreaElement
    expect(el.readOnly).toBe(true)
    expect(el.disabled).toBe(false)
  })
})
