import { render, screen, fireEvent } from '@testing-library/react'
import { Accordion, AccordionItem } from './Accordion'

const setup = (props = {}) => render(
  <Accordion {...props}>
    <AccordionItem value="a" title="First">Panel A</AccordionItem>
    <AccordionItem value="b" title="Second">Panel B</AccordionItem>
    <AccordionItem value="c" title="Third" disabled>Panel C</AccordionItem>
  </Accordion>,
)

describe('Accordion', () => {
  it('renders header buttons inside headings with aria-expanded and aria-controls', () => {
    setup()
    const b = screen.getByRole('button', { name: 'First' })
    expect(b.closest('h3')).toBeTruthy()
    expect(b.getAttribute('aria-expanded')).toBe('false')
    expect(b.getAttribute('aria-controls')).toBeTruthy()
  })
  it('opens a region labelled by its header', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'First' }))
    expect(screen.getByRole('region', { name: 'First' }).textContent).toBe('Panel A')
    expect(screen.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe('true')
  })
  it('allows several open by default', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'First' }))
    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(screen.getAllByRole('region').length).toBe(2)
  })
  it('closes the others in single mode', () => {
    setup({ type: 'single' })
    fireEvent.click(screen.getByRole('button', { name: 'First' }))
    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(screen.getAllByRole('region').length).toBe(1)
    expect(screen.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe('false')
  })
  it('does not open a disabled item', () => {
    setup()
    const b = screen.getByRole('button', { name: 'Third' })
    fireEvent.click(b)
    expect(b.getAttribute('aria-disabled')).toBe('true')
    expect(b.getAttribute('aria-expanded')).toBe('false')
  })
  it('supports controlled value', () => {
    const onValueChange = vi.fn()
    setup({ value: [], onValueChange })
    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(onValueChange).toHaveBeenCalledWith(['b'])
    expect(screen.getByRole('button', { name: 'Second' }).getAttribute('aria-expanded')).toBe('false')
  })
  it('expands and collapses all enabled items', () => {
    setup({ expandAll: true })
    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(screen.getAllByRole('region').length).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(screen.queryAllByRole('region').length).toBe(0)
  })
  it('adds a labelled checkbox per item in the checkbox variant', () => {
    const onCheckedChange = vi.fn()
    setup({ checkbox: true, onCheckedChange })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select First' }))
    expect(onCheckedChange).toHaveBeenCalledWith(['a'])
  })
  it('shows a loading status in the panel', () => {
    render(<Accordion defaultValue={['a']}><AccordionItem value="a" title="First" loading>Done</AccordionItem></Accordion>)
    expect(screen.getByRole('status', { name: 'Loading First' })).toBeTruthy()
  })
})
