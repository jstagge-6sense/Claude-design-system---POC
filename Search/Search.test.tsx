import { render, screen, fireEvent, act } from '@testing-library/react'
import { Search } from './Search'

const RESULTS = [
  { id: '1', label: 'Enterprise accounts' },
  { id: '2', label: 'Enterprise renewals' },
]

describe('Search', () => {
  it('renders a searchbox by default', () => {
    render(<Search label="Search segments" />)
    expect(screen.getByRole('searchbox', { name: 'Search segments' })).toBeTruthy()
  })
  it('renders a combobox with a listbox when results are provided', () => {
    render(<Search label="Search segments" results={RESULTS} defaultOpen defaultValue="ent" />)
    const input = screen.getByRole('combobox', { name: 'Search segments' })
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getAllByRole('option').length).toBe(2)
  })
  it('shows the clear button whenever there is text and clears on click', () => {
    const onSearch = vi.fn()
    render(<Search label="Search" defaultValue="abc" onSearch={onSearch} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('')
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
    expect(onSearch).toHaveBeenCalledWith('')
  })
  it('debounces onSearch', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(<Search label="Search" onSearch={onSearch} debounceMs={300} />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'e' } })
    fireEvent.change(input, { target: { value: 'en' } })
    expect(onSearch).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(300) })
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('en')
    vi.useRealTimers()
  })
  it('navigates results with arrow keys and selects with Enter', () => {
    const onSelect = vi.fn()
    render(<Search label="Search" results={RESULTS} defaultOpen defaultValue="ent" onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(RESULTS[1])
  })
  it('Escape closes the results, then clears the query', () => {
    render(<Search label="Search" results={RESULTS} defaultOpen defaultValue="ent" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('')
  })
  it('shows a no-results message', () => {
    render(<Search label="Search" results={[]} defaultOpen defaultValue="zzz" />)
    expect(screen.getByText(/No results for/)).toBeTruthy()
  })
  it('shows an inline spinner while searching', () => {
    render(<Search label="Search" loading defaultValue="a" />)
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
    expect(screen.getByRole('searchbox').getAttribute('aria-busy')).toBe('true')
  })
  it('disabled disables the field and the scope slot', () => {
    render(<Search label="Search" disabled scope={<button type="button">All</button>} />)
    expect((screen.getByRole('searchbox') as HTMLInputElement).disabled).toBe(true)
    expect((screen.getByRole('group', { name: 'Search scope', hidden: true }) as HTMLFieldSetElement).disabled).toBe(true)
  })
})
