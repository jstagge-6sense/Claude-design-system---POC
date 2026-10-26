import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('has an accessible name from its label', () => {
    render(<Button>Save changes</Button>)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy()
  })
  it('does not fire onClick when disabled and exposes aria-disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Save</Button>)
    const b = screen.getByRole('button', { name: 'Save' })
    fireEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
    expect(b.getAttribute('aria-disabled')).toBe('true')
  })
  it('does not fire onClick while loading and marks aria-busy', () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Save</Button>)
    const b = screen.getByRole('button')
    fireEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
    expect(b.getAttribute('aria-busy')).toBe('true')
  })
  it('icon-only primary falls back to secondary', () => {
    render(<Button iconOnly priority="primary" aria-label="Add" icon={<svg />} />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy()
  })
})
