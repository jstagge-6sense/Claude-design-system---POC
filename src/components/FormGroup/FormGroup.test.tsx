import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FormGroup, FormRow, FormSection } from './FormGroup'
import { useFormGroup } from './useFormGroup'
import { Input } from '../Input'

function Demo({ onSubmit = vi.fn(), fields = 2, onUnsavedChanges }: { onSubmit?: () => void; fields?: number; onUnsavedChanges?: (r: { proceed: () => void; stay: () => void }) => void }) {
  const initial: Record<string, string> = { a: '', b: '', c: '', d: '', e: '' }
  const names = Object.keys(initial).slice(0, fields)
  const form = useFormGroup({
    initialValues: Object.fromEntries(names.map((n) => [n, ''])),
    required: names,
    labels: { a: 'Alpha', b: 'Beta' },
    validators: { b: (v) => (v && v.length < 3 ? 'Beta needs at least 3 characters.' : undefined) },
    onSubmit,
    onUnsavedChanges,
  })
  return (
    <>
      <FormGroup form={form} aria-label="Demo form" submitLabel="Save">
        <FormSection legend="Details">
          <FormRow>
            <Input label="Alpha" {...form.getFieldProps('a')} />
            <Input label="Beta" {...form.getFieldProps('b')} />
          </FormRow>
          {names.slice(2).map((n) => <Input key={n} label={n} {...form.getFieldProps(n)} />)}
        </FormSection>
      </FormGroup>
      <button type="button" onClick={() => form.requestLeave(() => undefined)}>Leave</button>
    </>
  )
}

describe('FormGroup', () => {
  it('renders a form named by aria-label with a fieldset legend', () => {
    render(<Demo />)
    expect(screen.getByRole('form', { name: 'Demo form' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Details' })).toBeTruthy()
  })
  it('does not validate an untouched field, then validates on blur', async () => {
    render(<Demo />)
    expect(screen.queryByText(/is required/)).toBeNull()
    const alpha = screen.getByRole('textbox', { name: /Alpha/ })
    fireEvent.focus(alpha)
    fireEvent.blur(alpha)
    await waitFor(() => expect(screen.getByText('Alpha is required. Enter a value to continue.')).toBeTruthy())
    expect(alpha.getAttribute('aria-invalid')).toBe('true')
  })
  it('switches to on-change validation after the first error and clears it when fixed', async () => {
    render(<Demo />)
    const alpha = screen.getByRole('textbox', { name: /Alpha/ })
    fireEvent.blur(alpha)
    await waitFor(() => expect(alpha.getAttribute('aria-invalid')).toBe('true'))
    fireEvent.change(alpha, { target: { value: 'x' } })
    await waitFor(() => expect(alpha.getAttribute('aria-invalid')).toBeNull())
  })
  it('shows a role=alert summary with links after a failed submit and focuses the first invalid field', async () => {
    const onSubmit = vi.fn()
    render(<Demo fields={5} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Fix 5 fields to continue')
    expect(alert.querySelectorAll('a')).toHaveLength(5)
    expect(onSubmit).not.toHaveBeenCalled()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('textbox', { name: /Alpha/ })))
  })
  it('submits valid values once and shows success', async () => {
    const onSubmit = vi.fn()
    render(<Demo onSubmit={onSubmit} />)
    fireEvent.change(screen.getByRole('textbox', { name: /Alpha/ }), { target: { value: 'one' } })
    fireEvent.change(screen.getByRole('textbox', { name: /Beta/ }), { target: { value: 'two2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByText('Changes saved.')).toBeTruthy())
  })
  it('marks only the minority case with a written marker', () => {
    render(<Demo />)
    // Every field is required, so no "(required)" markers are written.
    expect(screen.queryByText('(required)')).toBeNull()
  })
  it('asks through the accessible callback instead of confirm() when dirty', () => {
    const onUnsavedChanges = vi.fn()
    render(<Demo onUnsavedChanges={onUnsavedChanges} />)
    fireEvent.change(screen.getByRole('textbox', { name: /Alpha/ }), { target: { value: 'edit' } })
    fireEvent.click(screen.getByRole('button', { name: 'Leave' }))
    expect(onUnsavedChanges).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Unsaved changes')).toBeTruthy()
  })
})
