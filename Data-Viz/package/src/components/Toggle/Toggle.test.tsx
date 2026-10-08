import { render, screen, fireEvent } from '@testing-library/react'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('is a switch named by its label with aria-checked', () => {
    render(<Toggle label="Email alerts" />)
    const s = screen.getByRole('switch', { name: 'Email alerts' })
    expect(s.getAttribute('aria-checked')).toBe('false')
  })
  it('flips aria-checked on click and keeps the label text', () => {
    const onCheckedChange = vi.fn()
    render(<Toggle label="Email alerts" onCheckedChange={onCheckedChange} />)
    const s = screen.getByRole('switch', { name: 'Email alerts' })
    fireEvent.click(s)
    expect(s.getAttribute('aria-checked')).toBe('true')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch', { name: 'Email alerts' })).toBeTruthy()
  })
  it('toggles when the label is clicked', () => {
    render(<Toggle label="Email alerts" />)
    fireEvent.click(screen.getByText('Email alerts'))
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })
  it('supports controlled use', () => {
    const onCheckedChange = vi.fn()
    render(<Toggle label="Email alerts" checked={false} onCheckedChange={onCheckedChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  })
  it('does nothing when disabled', () => {
    const onCheckedChange = vi.fn()
    render(<Toggle label="Locked" disabled defaultChecked onCheckedChange={onCheckedChange} />)
    const s = screen.getByRole('switch') as HTMLButtonElement
    fireEvent.click(s)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(s.disabled).toBe(true)
    expect(s.getAttribute('aria-checked')).toBe('true')
  })
  it('ignores input and sets aria-busy while loading', () => {
    const onCheckedChange = vi.fn()
    render(<Toggle label="Saving" loading onCheckedChange={onCheckedChange} />)
    const s = screen.getByRole('switch')
    fireEvent.click(s)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(s.getAttribute('aria-busy')).toBe('true')
  })
  it('links the description', () => {
    render(<Toggle label="Sync" description="Runs nightly." />)
    expect(screen.getByRole('switch').getAttribute('aria-describedby')).toBeTruthy()
  })
})
