import { render, screen, fireEvent, within } from '@testing-library/react'
import { Table, type TableColumn } from './Table'
import { ACCOUNTS, type Account } from './sampleData'

const COLS: TableColumn<Account>[] = [
  { id: 'name', header: 'Account', sortable: true, rowHeader: true },
  { id: 'owner', header: 'Owner', sortable: true, editable: true },
  { id: 'domain', header: 'Domain', truncate: true },
]
const ROWS = ACCOUNTS.slice(0, 3)
const base = { caption: 'Accounts', columns: COLS, rows: ROWS, getRowId: (r: Account) => r.id }

describe('Table', () => {
  it('uses table, thead, tbody and th scope=col with a caption', () => {
    const { container } = render(<Table {...base} />)
    expect(screen.getByRole('table', { name: 'Accounts' })).toBeTruthy()
    expect(container.querySelector('thead')).toBeTruthy()
    expect(container.querySelector('tbody')).toBeTruthy()
    container.querySelectorAll('thead th').forEach((th) => expect(th.getAttribute('scope')).toBe('col'))
    expect(screen.getAllByRole('rowheader').length).toBe(3)
  })
  it('sets aria-sort and cycles sort direction through onSortChange', () => {
    const onSortChange = vi.fn()
    const { rerender } = render(<Table {...base} sort={null} onSortChange={onSortChange} />)
    const th = screen.getByRole('columnheader', { name: 'Account' })
    expect(th.getAttribute('aria-sort')).toBe('none')
    fireEvent.click(within(th).getByRole('button'))
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'ascending' })
    rerender(<Table {...base} sort={{ columnId: 'name', direction: 'ascending' }} onSortChange={onSortChange} />)
    expect(screen.getByRole('columnheader', { name: 'Account' }).getAttribute('aria-sort')).toBe('ascending')
    fireEvent.click(within(screen.getByRole('columnheader', { name: 'Account' })).getByRole('button'))
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'name', direction: 'descending' })
  })
  it('moves focus between header sort buttons with the arrow keys', () => {
    render(<Table {...base} />)
    const [a, b] = screen.getAllByRole('button').filter((x) => x.hasAttribute('data-sort-btn'))
    a.focus()
    fireEvent.keyDown(a, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(b)
  })
  it('labels row checkboxes, supports select all with mixed state, and announces the count', () => {
    render(<Table {...base} selectionMode="multiple" />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Acme Corp' }))
    expect(screen.getByRole('status').textContent).toBe('1 row selected')
    const all = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement
    expect(all.indeterminate).toBe(true)
    fireEvent.click(all)
    expect(screen.getByRole('status').textContent).toBe('3 rows selected')
    fireEvent.click(all)
    expect(screen.getByRole('status').textContent).toBe('Selection cleared')
  })
  it('single selection replaces the previous row', () => {
    const onSelectionChange = vi.fn()
    render(<Table {...base} selectionMode="single" onSelectionChange={onSelectionChange} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Acme Corp' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Globex Industries' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(['acct-2'])
    expect(screen.queryByRole('checkbox', { name: 'Select all rows' })).toBeNull()
  })
  it('expands rows with aria-expanded and a controlled detail row', () => {
    render(<Table {...base} renderExpanded={(r) => <p>Detail for {r.name}</p>} />)
    const btn = screen.getByRole('button', { name: 'Expand details for Acme Corp' })
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(btn)
    const open = screen.getByRole('button', { name: 'Collapse details for Acme Corp' })
    expect(open.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById(open.getAttribute('aria-controls')!)?.textContent).toContain('Detail for Acme Corp')
  })
  it('inline editing: Enter saves, Escape cancels', () => {
    const onCellEdit = vi.fn()
    render(<Table {...base} onCellEdit={onCellEdit} />)
    fireEvent.click(screen.getAllByRole('button', { name: /Owner for Acme Corp/ })[0])
    let input = screen.getByRole('textbox', { name: 'Edit Owner for Acme Corp' })
    fireEvent.change(input, { target: { value: 'Sam Park' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onCellEdit).toHaveBeenCalledWith('acct-1', 'owner', 'Sam Park')
    fireEvent.click(screen.getAllByRole('button', { name: /Owner for Acme Corp/ })[0])
    input = screen.getByRole('textbox', { name: 'Edit Owner for Acme Corp' })
    fireEvent.change(input, { target: { value: 'Nobody' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onCellEdit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('textbox')).toBeNull()
  })
  it('shows a busy skeleton while loading', () => {
    render(<Table {...base} rows={[]} loading />)
    expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('status', { name: 'Loading table rows' })).toBeTruthy()
  })
  it('shows an empty state, and an error state with a retry', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<Table {...base} rows={[]} />)
    expect(screen.getByText('Nothing to show')).toBeTruthy()
    rerender(<Table {...base} rows={[]} error={{ onRetry }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalled()
  })
  it('renders a row-level error under the row and links it with aria-describedby', () => {
    render(<Table {...base} rowErrors={{ 'acct-1': 'We couldn’t sync this account.' }} />)
    const msg = screen.getByText('We couldn’t sync this account.')
    expect(msg).toBeTruthy()
    expect(document.querySelector(`[aria-describedby="${msg.closest('span[id]')!.id}"]`)).toBeTruthy()
  })
  it('links the table to its footer with aria-describedby', () => {
    render(<Table {...base} footer={<span>Showing 3 of 240</span>} />)
    const id = screen.getByRole('table').getAttribute('aria-describedby')!
    expect(document.getElementById(id)?.textContent).toBe('Showing 3 of 240')
  })
  it('renders only the visible columns in the given order', () => {
    render(<Table {...base} columnOrder={['owner', 'name', 'domain']} hiddenColumnIds={['domain']} />)
    const heads = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(heads).toEqual(['Owner', 'Account'])
  })
})
