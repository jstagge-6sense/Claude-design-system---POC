import { render, screen } from '@testing-library/react'
import { Divider } from './Divider'

describe('Divider', () => {
  it('is a separator by default', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).toBeTruthy()
  })
  it('vertical sets aria-orientation', () => {
    render(<Divider orientation="vertical" />)
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical')
  })
  it('decorative dividers are hidden from assistive tech', () => {
    const { container } = render(<Divider decorative />)
    expect(screen.queryByRole('separator')).toBeNull()
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })
  it('renders a visible label', () => {
    render(<Divider label="or" />)
    expect(screen.getByText('or')).toBeTruthy()
    expect(screen.getByRole('separator')).toBeTruthy()
  })
})
