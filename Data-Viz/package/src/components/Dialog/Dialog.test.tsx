import { render, screen, fireEvent } from '@testing-library/react'
import { Dialog } from './Dialog'

const base = { title: 'Delete segment?', description: 'This cannot be undone.', confirmLabel: 'Delete segment' }

describe('Dialog', () => {
  it('renders role=dialog with aria-modal, a label and a description', () => {
    render(<Dialog open complexity="form" {...base} />)
    const d = screen.getByRole('dialog', { name: 'Delete segment?' })
    expect(d.getAttribute('aria-modal')).toBe('true')
    expect(d.getAttribute('aria-describedby')).toBeTruthy()
  })
  it('uses alertdialog for a destructive confirmation', () => {
    render(<Dialog open destructive {...base} />)
    expect(screen.getByRole('alertdialog', { name: 'Delete segment?' })).toBeTruthy()
  })
  it('renders nothing when closed', () => {
    render(<Dialog open={false} {...base} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('dismisses with the close X, Cancel and Escape', () => {
    const onOpenChange = vi.fn()
    const onDismiss = vi.fn()
    render(<Dialog open onOpenChange={onOpenChange} onDismiss={onDismiss} {...base} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onDismiss.mock.calls.map((c) => c[0])).toEqual(['close', 'cancel', 'escape'])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
  it('overlay click dismisses unless it is a form dialog', () => {
    const onDismiss = vi.fn()
    const { container, rerender } = render(<Dialog open portal={false} onDismiss={onDismiss} {...base} />)
    fireEvent.click(container.querySelector('[aria-hidden="true"]') as HTMLElement)
    expect(onDismiss).toHaveBeenCalledWith('overlay')
    onDismiss.mockClear()
    rerender(<Dialog open portal={false} complexity="form" onDismiss={onDismiss} {...base} />)
    fireEvent.click(container.querySelector('[aria-hidden="true"]') as HTMLElement)
    expect(onDismiss).not.toHaveBeenCalled()
  })
  it('confirming blocks dismissal and marks the confirm button busy', () => {
    const onDismiss = vi.fn()
    render(<Dialog open confirming onDismiss={onDismiss} {...base} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onDismiss).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Delete segment/ }).getAttribute('aria-busy')).toBe('true')
  })
  it('calls onConfirm', () => {
    const onConfirm = vi.fn()
    render(<Dialog open onConfirm={onConfirm} {...base} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete segment' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
  it('focuses Cancel first in a destructive confirmation and traps Tab', () => {
    render(<Dialog open destructive {...base} />)
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    expect(document.activeElement).toBe(cancel)
    const confirm = screen.getByRole('button', { name: 'Delete segment' })
    confirm.focus()
    fireEvent.keyDown(confirm, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close dialog' }))
  })
  it('locks body scroll while open and restores it', () => {
    const { rerender } = render(<Dialog open {...base} />)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<Dialog open={false} {...base} />)
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
