import { render, screen, fireEvent } from '@testing-library/react'
import { SplitButton } from './SplitButton'
import type { MenuEntry } from '../Menu'

const ITEMS: MenuEntry[] = [{ value: 'as', label: 'Save as' }, { value: 'close', label: 'Save and close' }]

describe('SplitButton', () => {
  it('primary action and menu trigger are independent controls', () => {
    const onClick = vi.fn()
    render(<SplitButton items={ITEMS} onClick={onClick} portal={false}>Save</SplitButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })
  it('chevron trigger has aria-haspopup, aria-expanded and opens the menu', () => {
    render(<SplitButton items={ITEMS} portal={false}>Save</SplitButton>)
    const trigger = screen.getByRole('button', { name: 'More options' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeTruthy()
  })
  it('choosing a menu item runs onAction and not the primary onClick', () => {
    const onClick = vi.fn()
    const onAction = vi.fn()
    render(<SplitButton items={ITEMS} onClick={onClick} onAction={onAction} portal={false}>Save</SplitButton>)
    fireEvent.click(screen.getByRole('button', { name: 'More options' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Save and close' }))
    expect(onAction).toHaveBeenCalledWith('close', expect.anything())
    expect(onClick).not.toHaveBeenCalled()
  })
  it('arrow keys move focus between the sections', () => {
    render(<SplitButton items={ITEMS} portal={false}>Save</SplitButton>)
    const primary = screen.getByRole('button', { name: 'Save' })
    const trigger = screen.getByRole('button', { name: 'More options' })
    primary.focus()
    fireEvent.keyDown(primary, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(trigger)
    fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(primary)
  })
  it('Escape closes the menu and returns focus to the trigger', () => {
    render(<SplitButton items={ITEMS} portal={false}>Save</SplitButton>)
    const trigger = screen.getByRole('button', { name: 'More options' })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
  it('disabled disables both sections', () => {
    const onClick = vi.fn()
    render(<SplitButton items={ITEMS} onClick={onClick} disabled portal={false}>Save</SplitButton>)
    const primary = screen.getByRole('button', { name: 'Save' })
    const trigger = screen.getByRole('button', { name: 'More options' })
    expect(primary.getAttribute('aria-disabled')).toBe('true')
    expect(trigger.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(primary)
    fireEvent.click(trigger)
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
