import { render, screen } from '@testing-library/react'
import { Sticky } from './Sticky'

describe('Sticky', () => {
  it('renders its children in one element with the edge', () => {
    render(<Sticky edge="bottom" data-testid="s">Actions</Sticky>)
    const el = screen.getByTestId('s')
    expect(el.textContent).toBe('Actions')
    expect(el.getAttribute('data-edge')).toBe('bottom')
  })
  it('is not stuck by default and shows the boundary when forced', () => {
    const { rerender } = render(<Sticky data-testid="s">Header</Sticky>)
    expect(screen.getByTestId('s').hasAttribute('data-stuck')).toBe(false)
    rerender(<Sticky data-testid="s" data-stuck>Header</Sticky>)
    expect(screen.getByTestId('s').getAttribute('data-stuck')).toBe('true')
  })
  it('passes the offset as a custom property', () => {
    render(<Sticky offset={48} data-testid="s">Under the top bar</Sticky>)
    expect(screen.getByTestId('s').style.getPropertyValue('--_offset')).toBe('48px')
  })
})
