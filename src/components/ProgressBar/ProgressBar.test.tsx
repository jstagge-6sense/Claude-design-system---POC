import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('exposes role progressbar with name and value range', () => {
    render(<ProgressBar label="Importing accounts" value={45} />)
    const p = screen.getByRole('progressbar', { name: 'Importing accounts' })
    expect(p.getAttribute('aria-valuemin')).toBe('0')
    expect(p.getAttribute('aria-valuemax')).toBe('100')
    expect(p.getAttribute('aria-valuenow')).toBe('45')
  })
  it('indeterminate omits aria-valuenow', () => {
    render(<ProgressBar label="Syncing" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBeNull()
  })
  it('shows the percentage when asked', () => {
    render(<ProgressBar label="Upload" value={72} showValue />)
    expect(screen.getByText('72%')).toBeTruthy()
  })
  it('completes at 100 and says so in text, not color alone', () => {
    render(<ProgressBar label="Upload" value={100} />)
    expect(screen.getByText('Complete')).toBeTruthy()
  })
  it('error state shows the message and marks the bar invalid', () => {
    render(<ProgressBar label="Upload" value={20} state="error" statusText="Upload failed. Try again." />)
    expect(screen.getByText('Upload failed. Try again.')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-invalid')).toBe('true')
  })
  it('multi-step computes overall progress and announces the step', () => {
    render(<ProgressBar label="Launch" steps={4} currentStep={3} value={50} />)
    const p = screen.getByRole('progressbar')
    expect(p.getAttribute('aria-valuenow')).toBe('63')
    expect(p.getAttribute('aria-valuetext')).toContain('Step 3 of 4')
    expect(p.querySelectorAll('span > span').length).toBe(4)
  })
  it('clamps out-of-range values', () => {
    render(<ProgressBar label="Upload" value={140} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })
})
