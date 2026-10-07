import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its text and is not interactive', () => {
    render(<Badge tone="success">Active</Badge>)
    expect(screen.getByText('Active')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })
  it('status badges with a tone include an icon so color is not the only signal', () => {
    const { container } = render(<Badge kind="status" tone="critical">Error</Badge>)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('icon={false} removes the default icon', () => {
    const { container } = render(<Badge kind="status" tone="critical" icon={false}>Error</Badge>)
    expect(container.querySelector('svg')).toBeNull()
  })
  it('counts are a polite live region and cap at max', () => {
    render(<Badge kind="count" count={150} max={99} />)
    const s = screen.getByRole('status')
    expect(s.textContent).toBe('99+')
    expect(s.getAttribute('aria-live')).toBe('polite')
    expect(s.getAttribute('title')).toBe('150')
  })
  it('static badges are not live regions', () => {
    render(<Badge>Draft</Badge>)
    expect(screen.queryByRole('status')).toBeNull()
  })
  it('new badges default to the accent tone', () => {
    render(<Badge kind="new">Beta</Badge>)
    expect(screen.getByText('Beta').parentElement?.getAttribute('data-tone')).toBe('accent')
  })
})
