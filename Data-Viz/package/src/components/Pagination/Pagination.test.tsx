import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination, getPageItems } from './Pagination'

describe('getPageItems', () => {
  it('shows every page when there are few', () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })
  it('truncates with ellipses and keeps a stable slot count', () => {
    expect(getPageItems(1, 100)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 100])
    expect(getPageItems(50, 100)).toEqual([1, 'start-ellipsis', 49, 50, 51, 'end-ellipsis', 100])
    expect(getPageItems(100, 100)).toEqual([1, 'start-ellipsis', 96, 97, 98, 99, 100])
  })
  it('supports a wider boundary: 1 2 3 ... 98 99 100', () => {
    expect(getPageItems(50, 100, 1, 3)).toEqual([1, 2, 3, 'start-ellipsis', 49, 50, 51, 'end-ellipsis', 98, 99, 100])
  })
})

describe('Pagination', () => {
  it('is a nav labelled Pagination with aria-current on the current page', () => {
    render(<Pagination total={500} pageSize={20} defaultPage={3} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeTruthy()
    const current = screen.getByRole('button', { name: 'Page 3' })
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBeNull()
  })
  it('shows the result count', () => {
    render(<Pagination total={500} pageSize={20} defaultPage={1} />)
    expect(screen.getByText('Showing 1 to 20 of 500 results')).toBeTruthy()
  })
  it('keeps previous visible but aria-disabled on the first page, and next on the last', () => {
    const { rerender } = render(<Pagination total={100} pageSize={20} page={1} />)
    const prev = screen.getByRole('button', { name: 'Previous page' })
    expect(prev.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('button', { name: 'Next page' }).getAttribute('aria-disabled')).toBeNull()
    rerender(<Pagination total={100} pageSize={20} page={5} />)
    expect(screen.getByRole('button', { name: 'Next page' }).getAttribute('aria-disabled')).toBe('true')
  })
  it('changes page with next, previous and a number, and ignores disabled controls', () => {
    const onPageChange = vi.fn()
    render(<Pagination total={100} pageSize={20} defaultPage={1} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    fireEvent.click(screen.getByRole('button', { name: 'Page 5' }))
    expect(onPageChange).toHaveBeenLastCalledWith(5)
  })
  it('announces page changes in a polite live region', () => {
    render(<Pagination total={100} pageSize={20} defaultPage={1} />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    const live = screen.getAllByRole('status').find((n) => n.textContent?.includes('Page 3 of 5'))
    expect(live).toBeTruthy()
    expect(live?.getAttribute('aria-live')).toBe('polite')
  })
  it('mini variant shows previous, a page status and next only', () => {
    render(<Pagination total={100} pageSize={20} defaultPage={2} variant="mini" />)
    expect(screen.getByText('Page 2 of 5')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Page 3' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeTruthy()
  })
  it('loading marks the nav busy and blocks page changes', () => {
    const onPageChange = vi.fn()
    render(<Pagination total={100} pageSize={20} defaultPage={1} loading onPageChange={onPageChange} />)
    expect(screen.getByRole('navigation').getAttribute('aria-busy')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })
  it('page-size select reports the new size', () => {
    const onPageSizeChange = vi.fn()
    render(<Pagination total={500} pageSize={20} onPageSizeChange={onPageSizeChange} portal={false} />)
    fireEvent.click(screen.getByRole('button', { name: /Results per page/ }))
    fireEvent.click(screen.getByRole('option', { name: '50 per page' }))
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })
})
