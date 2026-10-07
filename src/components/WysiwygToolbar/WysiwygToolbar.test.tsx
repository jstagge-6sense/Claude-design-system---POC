import { render, screen, fireEvent } from '@testing-library/react'
import { WysiwygToolbar } from './WysiwygToolbar'

describe('WysiwygToolbar', () => {
  it('is a labelled toolbar connected to its editor', () => {
    render(<WysiwygToolbar controls="editor" />)
    const bar = screen.getByRole('toolbar', { name: 'Text formatting' })
    expect(bar.getAttribute('aria-controls')).toBe('editor')
  })
  it('gives every tool an accessible name', () => {
    render(<WysiwygToolbar controls="editor" />)
    for (const name of ['Bold', 'Italic', 'Underline', 'Insert link', 'Bulleted list', 'Numbered list', 'Align left', 'Increase indent', 'Attach file', 'Code']) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
  })
  it('exposes the active format with aria-pressed', () => {
    render(<WysiwygToolbar controls="editor" active={['bold']} />)
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('aria-pressed')).toBe('false')
  })
  it('reports clicks, except from disabled tools', () => {
    const onToolClick = vi.fn()
    render(<WysiwygToolbar controls="editor" onToolClick={onToolClick} disabledTools={['italic']} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }))
    fireEvent.click(screen.getByRole('button', { name: 'Italic' }))
    expect(onToolClick).toHaveBeenCalledTimes(1)
    expect(onToolClick).toHaveBeenCalledWith('bold')
  })
  it('ignores clicks when the whole toolbar is disabled', () => {
    const onToolClick = vi.fn()
    render(<WysiwygToolbar controls="editor" disabled onToolClick={onToolClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onToolClick).not.toHaveBeenCalled()
  })
  it('uses a roving tabindex with arrow keys, Home and End', () => {
    render(<WysiwygToolbar controls="editor" variant="minimal" />)
    const bold = screen.getByRole('button', { name: 'Bold' })
    const italic = screen.getByRole('button', { name: 'Italic' })
    expect(bold.getAttribute('tabindex')).toBe('0')
    expect(italic.getAttribute('tabindex')).toBe('-1')
    bold.focus()
    fireEvent.keyDown(bold, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(italic)
    fireEvent.keyDown(italic, { key: 'End' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Bulleted list' }))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' })
    expect(document.activeElement).toBe(bold)
  })
  it('minimal variant shows only bold, italic, link and a list', () => {
    render(<WysiwygToolbar controls="editor" variant="minimal" />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })
  it('floating variant renders nothing when not visible', () => {
    const { container } = render(<WysiwygToolbar controls="editor" variant="floating" visible={false} />)
    expect(container.firstChild).toBeNull()
  })
  it('opens the More menu with extended tools as menu items', () => {
    render(<WysiwygToolbar controls="editor" overflow="always" />)
    fireEvent.click(screen.getByRole('button', { name: 'More formatting' }))
    expect(screen.getByRole('menu', { name: 'More formatting' })).toBeTruthy()
    expect(screen.getAllByRole('menuitemcheckbox').length).toBeGreaterThan(0)
  })
})
