import { render, screen, fireEvent, within } from '@testing-library/react'
import { DataTableToolbar } from './DataTableToolbar'

const COLS = [
  { id: 'name', label: 'Account', visible: true },
  { id: 'owner', label: 'Owner', visible: true },
  { id: 'arr', label: 'ARR', visible: false },
]

describe('DataTableToolbar', () => {
  it('is a toolbar with an accessible name and a search field', () => {
    render(<DataTableToolbar label="Account table toolbar" />)
    expect(screen.getByRole('toolbar', { name: 'Account table toolbar' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Search table' })).toBeTruthy()
  })
  it('shows the filter count and Clear filters only when filters are active', () => {
    const onClear = vi.fn()
    const { rerender } = render(<DataTableToolbar onFilterClick={() => undefined} onClearFilters={onClear} activeFilterCount={0} />)
    expect(screen.queryByRole('button', { name: 'Clear filters' })).toBeNull()
    rerender(<DataTableToolbar onFilterClick={() => undefined} onClearFilters={onClear} activeFilterCount={2} />)
    expect(screen.getByRole('button', { name: /Filter/ }).textContent).toContain('2 filters applied')
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onClear).toHaveBeenCalled()
  })
  it('never shows the bulk bar when nothing is selected, and announces the count when it is', () => {
    const { rerender } = render(<DataTableToolbar selectedCount={0} bulkActions={<button>Assign owner</button>} />)
    expect(screen.queryByRole('region', { name: 'Bulk actions' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Assign owner' })).toBeNull()
    rerender(<DataTableToolbar selectedCount={3} bulkActions={<button>Assign owner</button>} />)
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toBeTruthy()
    expect(screen.getAllByRole('status').some((n) => n.textContent?.includes('3 rows selected'))).toBe(true)
  })
  it('column panel toggles, moves, and closes with Escape', () => {
    const onToggle = vi.fn()
    const onMove = vi.fn()
    render(<DataTableToolbar columns={COLS} onToggleColumn={onToggle} onMoveColumn={onMove} />)
    const trigger = screen.getByRole('button', { name: 'Columns' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    const panel = screen.getByRole('group', { name: 'Configure columns' })
    fireEvent.click(within(panel).getByRole('checkbox', { name: 'ARR' }))
    expect(onToggle).toHaveBeenCalledWith('arr', true)
    fireEvent.click(within(panel).getByRole('button', { name: 'Move Account down' }))
    expect(onMove).toHaveBeenCalledWith('name', 'down')
    expect(within(panel).getByRole('button', { name: 'Move Account up' }).getAttribute('aria-disabled')).toBe('true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: 'Configure columns' })).toBeNull()
  })
  it('density toggle exposes pressed state', () => {
    const onDensityChange = vi.fn()
    render(<DataTableToolbar density="default" onDensityChange={onDensityChange} />)
    expect(screen.getByRole('button', { name: 'Default density' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Compact density' }))
    expect(onDensityChange).toHaveBeenCalledWith('dense')
  })
  it('calls onExport', () => {
    const onExport = vi.fn()
    render(<DataTableToolbar onExport={onExport} />)
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    expect(onExport).toHaveBeenCalled()
  })
})
