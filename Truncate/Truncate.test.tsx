import { render, screen, fireEvent } from '@testing-library/react'
import { Truncate } from './Truncate'

const TEXT = 'A very long campaign name that will not fit on one line'

describe('Truncate', () => {
  it('keeps the full text in the DOM and in title', () => {
    const { container } = render(<Truncate>{TEXT}</Truncate>)
    expect(container.textContent).toBe(TEXT)
    expect((container.firstElementChild as HTMLElement).getAttribute('title')).toBe(TEXT)
  })
  it('multi-line clamps by setting the line count', () => {
    const { container } = render(<Truncate lines={3}>{TEXT}</Truncate>)
    const root = container.firstElementChild as HTMLElement
    expect(root.getAttribute('data-mode')).toBe('multi')
    expect(root.style.getPropertyValue('--_lines')).toBe('3')
  })
  it('middle truncation splits the text but exposes the full text to assistive tech', () => {
    const { container } = render(<Truncate middle endChars={8}>/exports/2026/enterprise-accounts-final.csv</Truncate>)
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(2)
    expect(screen.getByText('/exports/2026/enterprise-accounts-final.csv')).toBeTruthy()
    expect(container.querySelectorAll('[aria-hidden="true"]')[1].textContent).toBe('inal.csv')
  })
  it('expandable toggles aria-expanded and the label', () => {
    render(<Truncate lines={2} expandable>{TEXT}</Truncate>)
    const b = screen.getByRole('button', { name: 'Show more' })
    expect(b.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(b)
    expect(screen.getByRole('button', { name: 'Show less' }).getAttribute('aria-expanded')).toBe('true')
  })
  it('supports controlled expansion', () => {
    const onExpandedChange = vi.fn()
    render(<Truncate lines={2} expandable expanded={false} onExpandedChange={onExpandedChange}>{TEXT}</Truncate>)
    fireEvent.click(screen.getByRole('button'))
    expect(onExpandedChange).toHaveBeenCalledWith(true)
  })
})
