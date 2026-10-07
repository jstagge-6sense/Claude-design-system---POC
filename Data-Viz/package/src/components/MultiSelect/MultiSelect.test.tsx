import { render, screen, fireEvent } from '@testing-library/react'
import { MultiSelect } from './MultiSelect'
import type { MenuEntry } from '../Menu'

const ITEMS: MenuEntry[] = [
  { value: 'a', label: 'Alpha' }, { value: 'b', label: 'Bravo' }, { value: 'c', label: 'Charlie' }, { value: 'd', label: 'Delta' }, { value: 'e', label: 'Echo' },
]

describe('MultiSelect', () => {
  it('stays open after each selection and updates the count', () => {
    const onValueChange = vi.fn()
    render(<MultiSelect label="Teams" items={ITEMS} onValueChange={onValueChange} defaultOpen portal={false} />)
    fireEvent.click(screen.getByRole('option', { name: 'Alpha' }))
    fireEvent.click(screen.getByRole('option', { name: 'Charlie' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'c'])
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Teams/ }).textContent).toContain('2 selected')
  })
  it('Select all and Clear all', () => {
    render(<MultiSelect label="Teams" items={ITEMS} defaultOpen portal={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Select all' }))
    expect(screen.getAllByRole('option').every((o) => o.getAttribute('aria-selected') === 'true')).toBe(true)
    expect(screen.getByRole('button', { name: /Teams/ }).textContent).toContain('All selected')
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getAllByRole('option').every((o) => o.getAttribute('aria-selected') === 'false')).toBe(true)
  })
  it('shows dismissible chips with a Remove label and removes the value', () => {
    const onValueChange = vi.fn()
    render(<MultiSelect label="Teams" items={ITEMS} defaultValue={['a', 'b']} onValueChange={onValueChange} portal={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Alpha' }))
    expect(onValueChange).toHaveBeenCalledWith(['b'])
  })
  it('collapses extra chips into a +N more summary', () => {
    render(<MultiSelect label="Teams" items={ITEMS} defaultValue={['a', 'b', 'c', 'd']} maxVisibleChips={2} portal={false} />)
    expect(screen.getAllByRole('button', { name: /^Remove/ }).length).toBe(2)
    expect(screen.getByText('+2 more')).toBeTruthy()
  })
  it('exposes aria-haspopup=listbox and a multiselectable listbox', () => {
    render(<MultiSelect label="Teams" items={ITEMS} defaultOpen portal={false} />)
    expect(screen.getByRole('button', { name: /Teams/ }).getAttribute('aria-haspopup')).toBe('listbox')
    expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true')
  })
  it('error and disabled', () => {
    const { rerender } = render(<MultiSelect label="Teams" items={ITEMS} error="Choose a team." portal={false} />)
    expect(screen.getByRole('button', { name: /Teams/ }).getAttribute('aria-invalid')).toBe('true')
    rerender(<MultiSelect label="Teams" items={ITEMS} disabled portal={false} />)
    expect((screen.getByRole('button', { name: /Teams/ }) as HTMLButtonElement).disabled).toBe(true)
  })
})
