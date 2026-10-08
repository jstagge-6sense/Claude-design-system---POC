import { act, fireEvent, render, screen } from '@testing-library/react'
import { Toast } from './Toast'
import { ToastProvider, useToast, type ToastOptions } from './ToastProvider'

function Harness({ show }: { show: (t: ReturnType<typeof useToast>) => void }) {
  const t = useToast()
  return <button onClick={() => show(t)}>fire</button>
}
const setup = (initial: ToastOptions[] = [], max?: number) =>
  render(<ToastProvider portal={false} initialToasts={initial} max={max}><Harness show={() => {}} /></ToastProvider>)
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })

describe('Toast', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('announces errors assertively and others politely', () => {
    render(<><Toast severity="error" title="Export failed" /><Toast severity="success" title="Saved" /></>)
    const alert = screen.getByRole('alert')
    expect(alert.getAttribute('aria-live')).toBe('assertive')
    const status = screen.getByRole('status')
    expect(status.getAttribute('aria-live')).toBe('polite')
  })
  it('auto-dismisses after 5s', () => {
    setup([{ title: 'Settings saved' }])
    expect(screen.getByText('Settings saved')).toBeTruthy()
    advance(4900)
    expect(screen.queryByText('Settings saved')).not.toBeNull()
    advance(500)
    advance(300)
    expect(screen.queryByText('Settings saved')).toBeNull()
  })
  it('waits 8s when there is an action', () => {
    setup([{ title: 'Segment deleted', action: { label: 'Undo', onClick: () => {} } }])
    advance(6000)
    expect(screen.queryByText('Segment deleted')).not.toBeNull()
    advance(2500)
    expect(screen.queryByText('Segment deleted')).toBeNull()
  })
  it('errors are persistent and show a close button', () => {
    setup([{ severity: 'error', title: 'Export failed' }])
    advance(60000)
    expect(screen.getByText('Export failed')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    advance(300)
    expect(screen.queryByText('Export failed')).toBeNull()
  })
  it('does not show a close button on a timed info toast', () => {
    setup([{ title: 'Settings saved' }])
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).toBeNull()
  })
  it('hover pauses the timer and leaving resumes it', () => {
    setup([{ title: 'Settings saved' }])
    const toast = screen.getByRole('status')
    advance(3000)
    fireEvent.mouseEnter(toast)
    advance(20000)
    expect(screen.queryByText('Settings saved')).not.toBeNull()
    fireEvent.mouseLeave(toast)
    advance(2100)
    advance(300)
    expect(screen.queryByText('Settings saved')).toBeNull()
  })
  it('does not steal focus', () => {
    render(<ToastProvider portal={false}><Harness show={(t) => t.success('Saved')} /></ToastProvider>)
    const b = screen.getByRole('button', { name: 'fire' })
    b.focus()
    fireEvent.click(b)
    expect(document.activeElement).toBe(b)
    expect(screen.getByText('Saved')).toBeTruthy()
  })
  it('aggregates same-key toasts into one with a count', () => {
    render(<ToastProvider portal={false}><Harness show={(t) => t.success((n) => `${n} workflows published`, { aggregateKey: 'publish' })} /></ToastProvider>)
    const b = screen.getByRole('button', { name: 'fire' })
    fireEvent.click(b); fireEvent.click(b); fireEvent.click(b)
    expect(screen.getAllByRole('status').filter((n) => n.getAttribute('data-severity'))).toHaveLength(1)
    expect(screen.getByText('3 workflows published')).toBeTruthy()
  })
  it('never repeats an identical toast while visible', () => {
    render(<ToastProvider portal={false}><Harness show={(t) => t.info('Settings saved')} /></ToastProvider>)
    const b = screen.getByRole('button', { name: 'fire' })
    fireEvent.click(b); fireEvent.click(b)
    expect(screen.getAllByText('Settings saved')).toHaveLength(1)
  })
  it('shows at most 3 and promotes queued toasts, most urgent first', () => {
    setup([
      { title: 'One', duration: null }, { title: 'Two', duration: null }, { title: 'Three', duration: null },
      { title: 'Four info', duration: null }, { severity: 'error', title: 'Five error', duration: null },
    ])
    expect(document.querySelectorAll('[data-severity]')).toHaveLength(3)
    expect(screen.queryByText('Five error')).toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss notification' })[0])
    advance(300)
    expect(document.querySelectorAll('[data-severity]')).toHaveLength(3)
    expect(screen.getByText('Five error')).toBeTruthy()
    expect(screen.queryByText('Four info')).toBeNull()
  })
  it('runs the action and dismisses', () => {
    const onClick = vi.fn()
    setup([{ title: 'Segment deleted', action: { label: 'Undo', onClick } }])
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
