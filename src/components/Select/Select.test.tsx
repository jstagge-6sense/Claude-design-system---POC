import { render, screen, fireEvent } from '@testing-library/react'
import { Select } from './Select'
import type { MenuEntry } from '../Menu'

const ITEMS: MenuEntry[] = [
  { value: 'a', label: 'Awareness' }, { value: 'b', label: 'Consideration' }, { value: 'c', label: 'Decision' },
]

describe('Select', () => {
  it('trigger is a button with aria-haspopup=listbox, a name from label and value', () => {
    render(<Select label="Stage" items={ITEMS} defaultValue="b" portal={false} />)
    const trigger = screen.getByRole('button', { name: /Stage/ })
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.textContent).toContain('Consideration')
  })
  it('opens, selects an option with a click and closes', () => {
    const onValueChange = vi.fn()
    render(<Select label="Stage" items={ITEMS} onValueChange={onValueChange} portal={false} />)
    const trigger = screen.getByRole('button', { name: /Stage/ })
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'Decision' }))
    expect(onValueChange).toHaveBeenCalledWith('c')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger.textContent).toContain('Decision')
  })
  it('opens with ArrowDown on the trigger', () => {
    render(<Select label="Stage" items={ITEMS} portal={false} />)
    fireEvent.keyDown(screen.getByRole('button', { name: /Stage/ }), { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeTruthy()
  })
  it('wires the error message and aria-invalid', () => {
    render(<Select label="Stage" items={ITEMS} error="Choose a stage." portal={false} />)
    const trigger = screen.getByRole('button', { name: /Stage/ })
    expect(trigger.getAttribute('aria-invalid')).toBe('true')
    const id = trigger.getAttribute('aria-describedby') as string
    expect(document.getElementById(id)?.textContent).toContain('Choose a stage.')
  })
  it('disabled select does not open', () => {
    render(<Select label="Stage" items={ITEMS} disabled portal={false} />)
    const trigger = screen.getByRole('button', { name: /Stage/ }) as HTMLButtonElement
    expect(trigger.disabled).toBe(true)
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
  it('offers a create option when the query has no exact match', () => {
    const onCreate = vi.fn()
    render(<Select label="Stage" items={ITEMS} searchable onCreate={onCreate} defaultOpen portal={false} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search options' }), { target: { value: 'Churn risk' } })
    fireEvent.click(screen.getByRole('option', { name: /Create/ }))
    expect(onCreate).toHaveBeenCalledWith('Churn risk')
  })
})
