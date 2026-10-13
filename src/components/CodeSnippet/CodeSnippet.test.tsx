import { render, screen, fireEvent, act } from '@testing-library/react'
import { CodeSnippet } from './CodeSnippet'

describe('CodeSnippet', () => {
  it('renders semantic pre and code with the plain text', () => {
    const { container } = render(<CodeSnippet code={'a = 1\nb = 2'} language="Python" />)
    expect(container.querySelector('pre > code')?.textContent).toBe('a = 1\nb = 2')
  })
  it('always shows a copy button named Copy code', () => {
    render(<CodeSnippet code="x" />)
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy()
  })
  it('copies plain text, announces Copied politely, then resets', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const { container } = render(<CodeSnippet code={'line 1\nline 2'} />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy code' })) })
    expect(writeText).toHaveBeenCalledWith('line 1\nline 2')
    expect(screen.getByRole('status').textContent).toBe('Copied')
    expect(container.querySelector('svg[data-icon="check"]')).toBeTruthy()
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(screen.getByRole('status').textContent).toBe('')
    expect(container.querySelector('svg[data-icon="copy"]')).toBeTruthy()
    vi.useRealTimers()
  })
  it('exposes a keyboard focusable scroll region', () => {
    render(<CodeSnippet code="x" language="Shell" />)
    const region = screen.getByRole('region', { name: 'Shell code' })
    expect(region.getAttribute('tabindex')).toBe('0')
  })
  it('shows line numbers for multi-line code and hides them for one line', () => {
    const { container, rerender } = render(<CodeSnippet code={'a\nb'} />)
    expect(container.querySelector('[data-line="2"]')).toBeTruthy()
    rerender(<CodeSnippet code="a" />)
    expect(container.querySelector('[data-line]')).toBeNull()
  })
  it('renders an inline variant with a copy button', () => {
    render(<CodeSnippet variant="inline" code="npm i sdk" />)
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy()
  })
})
