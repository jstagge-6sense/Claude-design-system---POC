import { render, screen } from '@testing-library/react'
import { SkeletonLoader, SkeletonText, SkeletonBlock } from './SkeletonLoader'

describe('SkeletonLoader', () => {
  it('marks the container busy with a default label', () => {
    render(<SkeletonLoader />)
    const s = screen.getByRole('status', { name: 'Loading content' })
    expect(s.getAttribute('aria-busy')).toBe('true')
  })
  it('accepts a custom label', () => {
    render(<SkeletonLoader variant="card" label="Loading accounts" />)
    expect(screen.getByRole('status', { name: 'Loading accounts' })).toBeTruthy()
  })
  it('renders the requested number of text lines and hides shapes from assistive tech', () => {
    const { container } = render(<SkeletonLoader variant="text" lines={5} />)
    expect(container.querySelectorAll('[aria-hidden="true"] > span').length).toBe(5)
  })
  it('renders table rows and columns', () => {
    const { container } = render(<SkeletonLoader variant="table" rows={3} columns={4} />)
    expect(container.querySelectorAll('[aria-hidden="true"] > div').length).toBe(3)
  })
  it('swaps in content when loading is false and announces it', () => {
    render(<SkeletonLoader loading={false}>Real content</SkeletonLoader>)
    expect(screen.getByText('Real content')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('Content loaded')
  })
  it('exports composable shapes', () => {
    const { container } = render(<div><SkeletonText lines={2} /><SkeletonBlock shape="circle" width={32} height={32} /></div>)
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2)
  })
})
