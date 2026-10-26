import { render, screen, fireEvent } from '@testing-library/react'
import { ProgressSteps } from './ProgressSteps'

const steps = [
  { id: 'a', label: 'Account' },
  { id: 'b', label: 'Data' },
  { id: 'c', label: 'Audience' },
  { id: 'd', label: 'Review' },
]

describe('ProgressSteps', () => {
  it('is a labelled list with one item per step', () => {
    render(<ProgressSteps steps={steps} current={1} />)
    expect(screen.getByRole('list', { name: 'Progress' })).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })
  it('marks the active step with aria-current="step"', () => {
    render(<ProgressSteps steps={steps} current={1} />)
    const items = screen.getAllByRole('listitem')
    expect(items[1].getAttribute('aria-current')).toBe('step')
    expect(items[0].getAttribute('aria-current')).toBeNull()
  })
  it('makes completed steps buttons and upcoming steps non-interactive in linear mode', () => {
    render(<ProgressSteps steps={steps} current={2} />)
    expect(screen.getByRole('button', { name: /Account/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Review/ })).toBeNull()
  })
  it('goes back when a completed step is activated and announces the change', () => {
    const onStepClick = vi.fn()
    render(<ProgressSteps steps={steps} defaultCurrent={2} onStepClick={onStepClick} />)
    fireEvent.click(screen.getByRole('button', { name: /Account/ }))
    expect(onStepClick).toHaveBeenCalledWith(0, steps[0])
    expect(screen.getByRole('status').textContent).toBe('Step 1 of 4: Account')
  })
  it('moves between completed steps with the arrow keys', () => {
    render(<ProgressSteps steps={steps} current={3} />)
    const first = screen.getByRole('button', { name: /Account/ })
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Data/ }))
  })
  it('exposes status text so state is not conveyed by color alone', () => {
    render(<ProgressSteps steps={steps} current={1} />)
    expect(screen.getByRole('button', { name: /Account.*completed/ })).toBeTruthy()
  })
  it('shows error info', () => {
    render(<ProgressSteps steps={[{ id: 'a', label: 'Data', status: 'error', errorMessage: 'Reconnect to continue.' }, { id: 'b', label: 'Next' }]} current={1} />)
    expect(screen.getByText('Reconnect to continue.')).toBeTruthy()
  })
})
