import { render, screen } from '@testing-library/react'
import { ProgressCircle } from './ProgressCircle'

describe('ProgressCircle', () => {
  it('exposes role progressbar with name and value', () => {
    render(<ProgressCircle label="Profile completeness" value={65} />)
    const p = screen.getByRole('progressbar', { name: 'Profile completeness' })
    expect(p.getAttribute('aria-valuenow')).toBe('65')
    expect(p.getAttribute('aria-valuemin')).toBe('0')
    expect(p.getAttribute('aria-valuemax')).toBe('100')
  })
  it('shows the percentage as visible text by default', () => {
    render(<ProgressCircle label="Coverage" value={42} />)
    expect(screen.getByText('42%')).toBeTruthy()
  })
  it('center label and valueText give assistive tech a plain-text value', () => {
    render(<ProgressCircle label="Tasks" value={60} centerLabel="12/20" valueText="12 of 20 tasks" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe('12 of 20 tasks')
    expect(screen.getByText('12/20')).toBeTruthy()
  })
  it('completes at 100 with an icon and text value', () => {
    const { container } = render(<ProgressCircle label="Setup" value={100} />)
    expect(container.querySelector('[data-icon="check"]')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toContain('complete')
  })
  it('error state is marked invalid and uses an icon', () => {
    const { container } = render(<ProgressCircle label="Sync" value={30} state="error" />)
    expect(screen.getByRole('progressbar').getAttribute('aria-invalid')).toBe('true')
    expect(container.querySelector('[data-icon="error"]')).toBeTruthy()
  })
  it('clamps values', () => {
    render(<ProgressCircle label="Sync" value={-5} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')
  })
})
