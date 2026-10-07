import { render, screen, fireEvent } from '@testing-library/react'
import { Avatar, getInitials } from './Avatar'

describe('Avatar', () => {
  it('derives initials from the name and exposes the name as an image role', () => {
    render(<Avatar name="Maya Okafor" />)
    const a = screen.getByRole('img', { name: 'Maya Okafor' })
    expect(a.textContent).toBe('MO')
  })
  it('getInitials handles one word and extra spaces', () => {
    expect(getInitials('  prince ')).toBe('P')
    expect(getInitials('Ana Maria de Souza')).toBe('AS')
  })
  it('falls back to the placeholder icon when forced', () => {
    const { container } = render(<Avatar name="Unknown" placeholder />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('falls back to initials when the image fails to load', () => {
    const { container } = render(<Avatar name="Maya Okafor" src="/missing.png" />)
    const img = container.querySelector('img') as HTMLImageElement
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Maya Okafor' }).textContent).toBe('MO')
  })
  it('includes status in the accessible name', () => {
    render(<Avatar name="Maya Okafor" status="busy" />)
    expect(screen.getByRole('img', { name: 'Maya Okafor, Busy' })).toBeTruthy()
  })
  it('becomes a button when onClick is given', () => {
    const onClick = vi.fn()
    render(<Avatar name="Maya Okafor" onClick={onClick} aria-haspopup="menu" aria-expanded={false} />)
    const b = screen.getByRole('button', { name: 'Maya Okafor' })
    fireEvent.click(b)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(b.getAttribute('aria-haspopup')).toBe('menu')
  })
})
