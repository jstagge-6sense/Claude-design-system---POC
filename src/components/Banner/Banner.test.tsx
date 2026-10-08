import { render, screen, fireEvent } from '@testing-library/react'
import { Banner, resolveBannerPriority } from './Banner'
import { BannerStack } from './BannerStack'

describe('Banner', () => {
  it('uses role=alert for error and warning', () => {
    render(<><Banner severity="error" title="Outage" /><Banner severity="warning" title="Sync late" /></>)
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })
  it('uses role=status for info and success', () => {
    render(<><Banner severity="info" title="FYI" /><Banner severity="success" title="Saved" /></>)
    expect(screen.getAllByRole('status')).toHaveLength(2)
  })
  it('maps severity to priority', () => {
    expect(resolveBannerPriority('info')).toBe('P4')
    expect(resolveBannerPriority('warning')).toBe('P3')
    expect(resolveBannerPriority('error')).toBe('P1')
    expect(resolveBannerPriority('error', 'P2')).toBe('P2')
    expect(resolveBannerPriority('success')).toBeUndefined()
  })
  it('has an icon and text, never color alone', () => {
    const { container } = render(<Banner severity="error" title="Outage" />)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.getByText('Outage')).toBeTruthy()
  })
  it('dismisses with an accessible close button and calls onDismiss', () => {
    const onDismiss = vi.fn()
    render(<Banner severity="info" dismissible onDismiss={onDismiss} title="Tip" />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Tip')).toBeNull()
  })
  it('P1 is not dismissible', () => {
    render(<Banner severity="error" priority="P1" dismissible title="Outage" />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })
  it('P1 receives focus on mount', () => {
    render(<Banner severity="error" title="Outage" />)
    expect(document.activeElement).toBe(screen.getByRole('alert'))
  })
  it('renders a CTA button that fires onAction', () => {
    const onAction = vi.fn()
    render(<Banner severity="warning" title="Sync late" actionLabel="Review settings" onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Review settings' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})

describe('BannerStack', () => {
  const items = [
    { id: 'i', severity: 'info' as const, title: 'Info one' },
    { id: 'p1', severity: 'error' as const, title: 'Outage', priority: 'P1' as const },
    { id: 'p1b', severity: 'error' as const, title: 'Second outage', priority: 'P1' as const },
    { id: 'w', severity: 'warning' as const, title: 'Warn one' },
  ]
  it('shows the most urgent banner and a count of the rest', () => {
    render(<BannerStack items={items} />)
    expect(screen.getByText('Outage')).toBeTruthy()
    expect(screen.queryByText('Info one')).toBeNull()
    expect(screen.getByRole('button', { name: 'Show 3 more notifications' }).getAttribute('aria-expanded')).toBe('false')
  })
  it('expands and collapses', () => {
    render(<BannerStack items={items} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 more notifications' }))
    expect(screen.getByText('Info one')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Show fewer notifications' }).getAttribute('aria-expanded')).toBe('true')
  })
  it('renders only one P1', () => {
    const { container } = render(<BannerStack items={items} defaultExpanded />)
    expect(container.querySelectorAll('[data-priority="P1"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-priority="P2"]')).toHaveLength(1)
  })
})
