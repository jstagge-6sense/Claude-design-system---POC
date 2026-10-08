import { render, screen, fireEvent } from '@testing-library/react'
import { SidePanel, SidePanelRailItem } from './SidePanel'

describe('SidePanel', () => {
  it('is a complementary landmark named by its title', () => {
    render(<SidePanel title="Filters"><p>Body</p></SidePanel>)
    expect(screen.getByRole('complementary', { name: 'Filters' })).toBeTruthy()
  })
  it('fixed panels have no collapse toggle', () => {
    render(<SidePanel title="Filters" />)
    expect(screen.queryByRole('button', { name: /Collapse/ })).toBeNull()
  })
  it('toggle has an action label and aria-expanded, and flips on click', () => {
    const onCollapsedChange = vi.fn()
    render(<SidePanel title="Filters" collapsible onCollapsedChange={onCollapsedChange}><p>Body</p></SidePanel>)
    const t = screen.getByRole('button', { name: 'Collapse Filters panel' })
    expect(t.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(t)
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    const t2 = screen.getByRole('button', { name: 'Expand Filters panel' })
    expect(t2.getAttribute('aria-expanded')).toBe('false')
  })
  it('keeps children mounted while collapsed so state is preserved', () => {
    render(<SidePanel title="Filters" collapsible defaultCollapsed><input aria-label="Region" defaultValue="EMEA" /></SidePanel>)
    const input = document.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('EMEA')
    expect(input.closest('[hidden]')).toBeTruthy()
  })
  it('announces collapsed and expanded', () => {
    render(<SidePanel title="Filters" collapsible />)
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Filters panel' }))
    expect(screen.getByRole('status').textContent).toBe('Filters panel collapsed')
  })
  it('shows rail items when collapsed and they have accessible names', () => {
    render(<SidePanel title="Filters" collapsible defaultCollapsed rail={<SidePanelRailItem label="Columns" icon={<svg />} />} />)
    expect(screen.getByRole('button', { name: 'Columns' })).toBeTruthy()
  })
  it('does not lock scroll or trap focus by default', () => {
    render(<SidePanel title="Filters"><button>First</button></SidePanel>)
    expect(document.body.style.overflow).not.toBe('hidden')
  })
  it('marks itself busy while loading', () => {
    render(<SidePanel title="Filters" loading />)
    expect(screen.getByRole('complementary').getAttribute('aria-busy')).toBe('true')
  })
})
