import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, TabList, Tab, TabPanel } from './Tabs'

const Demo = (props: Partial<React.ComponentProps<typeof Tabs>> & { disabledMiddle?: boolean }) => {
  const { disabledMiddle, ...rest } = props
  return (
    <Tabs defaultValue="a" {...rest}>
      <TabList aria-label="Sections">
        <Tab value="a">Alpha</Tab>
        <Tab value="b" disabled={disabledMiddle} disabledReason="Not available on your plan.">Beta</Tab>
        <Tab value="c" badge={3}>Gamma</Tab>
      </TabList>
      <TabPanel value="a">Alpha panel</TabPanel>
      <TabPanel value="b">Beta panel</TabPanel>
      <TabPanel value="c">Gamma panel</TabPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('exposes tablist, tabs, selected state and panel wiring', () => {
    render(<Demo />)
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeTruthy()
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    expect(alpha.getAttribute('aria-selected')).toBe('true')
    const panel = screen.getByRole('tabpanel')
    expect(alpha.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(alpha.id)
  })
  it('uses roving tabindex', () => {
    render(<Demo />)
    expect(screen.getByRole('tab', { name: 'Alpha' }).getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: /Beta/ }).getAttribute('tabindex')).toBe('-1')
  })
  it('selects on click and shows the matching panel', () => {
    render(<Demo />)
    fireEvent.click(screen.getByRole('tab', { name: /Gamma/ }))
    expect(screen.getByRole('tabpanel').textContent).toBe('Gamma panel')
  })
  it('moves with arrow keys, Home and End, and wraps', () => {
    render(<Demo />)
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: /Beta/ }))
    fireEvent.keyDown(document.activeElement as Element, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: /Gamma/ }))
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(alpha)
    fireEvent.keyDown(alpha, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: /Gamma/ }))
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' })
    expect(document.activeElement).toBe(alpha)
  })
  it('manual activation moves focus without selecting', () => {
    render(<Demo activation="manual" />)
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: /Beta/ }).getAttribute('aria-selected')).toBe('false')
    fireEvent.click(document.activeElement as Element)
    expect(screen.getByRole('tab', { name: /Beta/ }).getAttribute('aria-selected')).toBe('true')
  })
  it('disabled tabs use aria-disabled, stay focusable and never select', () => {
    const onValueChange = vi.fn()
    render(<Demo disabledMiddle onValueChange={onValueChange} />)
    const beta = screen.getByRole('tab', { name: /Beta/ })
    expect(beta.getAttribute('aria-disabled')).toBe('true')
    expect(beta.getAttribute('aria-describedby')).toBeTruthy()
    fireEvent.click(beta)
    expect(onValueChange).not.toHaveBeenCalled()
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(beta)
    expect(beta.getAttribute('aria-selected')).toBe('false')
  })
  it('supports controlled use', () => {
    const onValueChange = vi.fn()
    render(<Demo value="a" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByRole('tab', { name: /Gamma/ }))
    expect(onValueChange).toHaveBeenCalledWith('c')
    expect(screen.getByRole('tab', { name: 'Alpha' }).getAttribute('aria-selected')).toBe('true')
  })
  it('lazy panels mount content only after first selection', () => {
    render(<Demo lazy />)
    expect(screen.queryByText('Gamma panel')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: /Gamma/ }))
    expect(screen.getByText('Gamma panel')).toBeTruthy()
  })
  it('uses vertical arrows in the vertical variant', () => {
    render(<Demo variant="vertical" />)
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical')
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    alpha.focus()
    fireEvent.keyDown(alpha, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: /Beta/ }))
  })
  it('hides inactive panels', () => {
    render(<Demo />)
    expect(screen.getAllByRole('tabpanel').length).toBe(1)
  })
})
