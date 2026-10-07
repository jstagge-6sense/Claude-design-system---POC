import { render, screen, fireEvent } from '@testing-library/react'
import { Menu, MenuTrigger } from './Menu'
import { MenuItem, filterEntries, flattenItems, type MenuEntry } from './MenuList'

const ACTIONS: MenuEntry[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'copy', label: 'Copy' },
  { value: 'gone', label: 'Archive', disabled: true },
  { value: 'del', label: 'Delete', destructive: true },
]
const OPTIONS: MenuEntry[] = [
  { type: 'group', label: 'Region', items: [{ value: 'na', label: 'North America' }, { value: 'emea', label: 'EMEA' }] },
  { value: 'apac', label: 'APAC' },
]

describe('Menu', () => {
  it('trigger exposes aria-haspopup and aria-expanded and opens a role=menu', () => {
    render(<Menu label="Actions" items={ACTIONS} portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy()
    expect(screen.getAllByRole('menuitem').length).toBe(4)
  })
  it('runs the action and closes when an item is chosen', () => {
    const onAction = vi.fn()
    render(<Menu label="Actions" items={ACTIONS} onAction={onAction} portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} />)
    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }))
    expect(onAction).toHaveBeenCalledWith('copy', expect.objectContaining({ value: 'copy' }))
    expect(screen.queryByRole('menu')).toBeNull()
  })
  it('does not run disabled items', () => {
    const onAction = vi.fn()
    render(<Menu label="Actions" items={ACTIONS} onAction={onAction} defaultOpen portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} />)
    const item = screen.getByRole('menuitem', { name: 'Archive' })
    expect(item.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(item)
    expect(onAction).not.toHaveBeenCalled()
  })
  it('moves focus with arrow keys, wraps, and supports Home and End', () => {
    render(<Menu label="Actions" items={ACTIONS} defaultOpen portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} />)
    const items = screen.getAllByRole('menuitem')
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(items[1], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[3]) // skips the disabled item
    fireEvent.keyDown(items[3], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(items[0], { key: 'End' })
    expect(document.activeElement).toBe(items[3])
    fireEvent.keyDown(items[3], { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
  })
  it('type-ahead focuses the matching item', () => {
    render(<Menu label="Actions" items={ACTIONS} defaultOpen portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} />)
    const items = screen.getAllByRole('menuitem')
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'd' })
    expect(document.activeElement).toBe(items[3])
  })
  it('Enter activates and Escape closes and returns focus to the trigger', () => {
    const onAction = vi.fn()
    render(<Menu label="Actions" items={ACTIONS} onAction={onAction} portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} />)
    const trigger = screen.getByRole('button', { name: 'Actions' })
    fireEvent.click(trigger)
    const items = screen.getAllByRole('menuitem')
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'Enter' })
    expect(onAction).toHaveBeenCalledWith('edit', expect.anything())
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
  it('click outside closes', () => {
    render(<div><Menu label="Actions" items={ACTIONS} defaultOpen portal={false} trigger={<MenuTrigger>Actions</MenuTrigger>} /><p>Outside</p></div>)
    fireEvent.mouseDown(screen.getByText('Outside'))
    expect(screen.queryByRole('menu')).toBeNull()
  })
  it('selection mode uses listbox and option roles with aria-selected', () => {
    render(<Menu label="Region" items={OPTIONS} mode="single" defaultValue={['emea']} defaultOpen portal={false} trigger={<MenuTrigger>Region</MenuTrigger>} />)
    expect(screen.getByRole('button', { name: 'Region' }).getAttribute('aria-haspopup')).toBe('listbox')
    expect(screen.getByRole('listbox', { name: 'Region' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'EMEA' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('option', { name: 'APAC' }).getAttribute('aria-selected')).toBe('false')
  })
  it('multi mode stays open and toggles values', () => {
    const onValueChange = vi.fn()
    render(<Menu label="Region" items={OPTIONS} mode="multi" onValueChange={onValueChange} defaultOpen portal={false} trigger={<MenuTrigger>Region</MenuTrigger>} />)
    fireEvent.click(screen.getByRole('option', { name: 'APAC' }))
    fireEvent.click(screen.getByRole('option', { name: 'EMEA' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['apac', 'emea'])
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true')
  })
  it('filters and highlights matches, and shows an empty state', () => {
    render(<Menu label="Region" items={OPTIONS} mode="single" searchable defaultOpen portal={false} trigger={<MenuTrigger>Region</MenuTrigger>} />)
    const input = screen.getByRole('textbox', { name: 'Search options' })
    fireEvent.change(input, { target: { value: 'ame' } })
    expect(screen.getAllByRole('option').length).toBe(1)
    expect(document.querySelector('mark')?.textContent).toBe('ame')
    fireEvent.change(input, { target: { value: 'zzz' } })
    expect(screen.queryAllByRole('option').length).toBe(0)
    expect(screen.getByText(/No results for/)).toBeTruthy()
  })
  it('shows a spinner while loading', () => {
    render(<Menu label="Region" items={[]} mode="single" loading defaultOpen portal={false} trigger={<MenuTrigger>Region</MenuTrigger>} />)
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
    expect(screen.getByRole('listbox').getAttribute('aria-busy')).toBe('true')
  })
})

describe('MenuItem and helpers', () => {
  it('renders a menuitem and an option', () => {
    render(<ul><MenuItem label="Rename" /><MenuItem label="Chosen" selection="single" selected /></ul>)
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Chosen' }).getAttribute('aria-selected')).toBe('true')
  })
  it('flattens and filters entries', () => {
    expect(flattenItems(OPTIONS).map((i) => i.value)).toEqual(['na', 'emea', 'apac'])
    expect(filterEntries(OPTIONS, 'pac').length).toBe(1)
    expect(filterEntries(OPTIONS, 'na').length).toBe(1)
  })
})
