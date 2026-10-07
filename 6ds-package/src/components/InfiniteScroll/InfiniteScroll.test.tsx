import { render, screen, fireEvent } from '@testing-library/react'
import { InfiniteScroll } from './InfiniteScroll'

const items = <ul><li>One</li><li>Two</li></ul>

describe('InfiniteScroll', () => {
  it('always offers a Load more button that calls onLoadMore', () => {
    const onLoadMore = vi.fn()
    render(<InfiniteScroll onLoadMore={onLoadMore} autoLoad={false} count={40} total={200}>{items}</InfiniteScroll>)
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
  it('shows the count', () => {
    render(<InfiniteScroll onLoadMore={() => undefined} autoLoad={false} count={40} total={200}>{items}</InfiniteScroll>)
    expect(screen.getByText('Showing 40 of 200')).toBeTruthy()
  })
  it('loading shows a spinner and marks the region busy, Load more is unavailable', () => {
    const onLoadMore = vi.fn()
    const { container } = render(<InfiniteScroll onLoadMore={onLoadMore} loading count={40} total={200}>{items}</InfiniteScroll>)
    expect(screen.getByRole('status', { name: /Loading more/ })).toBeTruthy()
    expect((container.firstChild as HTMLElement).getAttribute('aria-busy')).toBe('true')
    const b = screen.getByRole('button', { name: 'Load more' })
    fireEvent.click(b)
    expect(onLoadMore).not.toHaveBeenCalled()
    expect(b.getAttribute('aria-disabled')).toBe('true')
  })
  it('shows the end indicator and no Load more at the end', () => {
    render(<InfiniteScroll onLoadMore={() => undefined} hasMore={false} count={200} total={200}>{items}</InfiniteScroll>)
    expect(screen.getByText('You have reached the end')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull()
  })
  it('shows an error row with a retry button', () => {
    const onLoadMore = vi.fn()
    render(<InfiniteScroll onLoadMore={onLoadMore} error count={40} total={200}>{items}</InfiniteScroll>)
    expect(screen.getByText(/Couldn't load more items/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
  it('announces politely and does not move focus', () => {
    const { rerender } = render(<InfiniteScroll onLoadMore={() => undefined} loading count={40} total={200}>{items}</InfiniteScroll>)
    const before = document.activeElement
    rerender(<InfiniteScroll onLoadMore={() => undefined} count={60} total={200}>{items}</InfiniteScroll>)
    expect(document.activeElement).toBe(before)
    const live = document.querySelector('[role="status"][aria-live="polite"]:not([aria-label])')
    expect(live).toBeTruthy()
  })
  it('renders the footer slot', () => {
    render(<InfiniteScroll onLoadMore={() => undefined} footer={<a href="/terms">Terms</a>}>{items}</InfiniteScroll>)
    expect(screen.getByRole('link', { name: 'Terms' })).toBeTruthy()
  })
})
