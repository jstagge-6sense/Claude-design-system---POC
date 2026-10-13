import { render, screen, fireEvent } from '@testing-library/react'
import { DataMetric } from './DataMetric'

describe('DataMetric', () => {
  it('groups label, value and trend so they are announced together', () => {
    render(<DataMetric label="Revenue" value={1200} locale="en-US" trend="up" trendValue={12} comparison="vs last period" />)
    const group = screen.getByRole('group', { name: 'Revenue' })
    expect(group.textContent).toContain('1,200')
    expect(group.textContent).toContain('Up 12%')
    expect(group.textContent).toContain('vs last period')
    expect(group.getAttribute('aria-describedby')?.split(' ').length).toBe(2)
  })
  it('formats numbers by locale', () => {
    render(<DataMetric label="Count" value={1234567.5} locale="de-DE" />)
    expect(screen.getByRole('group').textContent).toContain('1.234.567,5')
  })
  it('describes trend in text and with an icon, not color alone', () => {
    const { container } = render(<DataMetric label="Churn" value={4} trend="down" trendValue={3} trendTone="positive" />)
    expect(screen.getByRole('group').textContent).toContain('Down 3%')
    expect(screen.getByRole('group').textContent).toContain('favorable')
    expect(container.querySelector('svg[data-icon="trendDown"]')).toBeTruthy()
  })
  it('gives the sparkline a text alternative and hides the graphic', () => {
    const { container } = render(<DataMetric label="Visits" value={10} sparkline={[1, 3, 2, 5]} locale="en-US" />)
    expect(container.querySelector('svg polyline')?.closest('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('group').textContent).toContain('Trend over 4 periods, from 1 to 5.')
  })
  it('shows a loading status named after the metric', () => {
    render(<DataMetric label="Revenue" loading />)
    expect(screen.getByRole('status', { name: 'Loading Revenue' })).toBeTruthy()
  })
  it('shows an error with a working retry', () => {
    const onRetry = vi.fn()
    render(<DataMetric label="Revenue" error onRetry={onRetry} />)
    expect(screen.getByRole('alert').textContent).toContain("couldn't load Revenue")
    fireEvent.click(screen.getByRole('button', { name: /Retry/ }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
  it('adds a polite live region when live', () => {
    const { container } = render(<DataMetric label="Visitors" value={5} live />)
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy()
  })
})
