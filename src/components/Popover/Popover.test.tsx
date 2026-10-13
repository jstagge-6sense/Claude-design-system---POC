import { render, screen, fireEvent } from '@testing-library/react'
import { Popover } from './Popover'

describe('Popover', () => {
  it('simple mode opens on focus with role tooltip and aria-describedby', () => {
    render(<Popover content="Copy link" portal={false}><button>Copy</button></Popover>)
    const trigger = screen.getByRole('button', { name: 'Copy' })
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.focus(trigger)
    const tip = screen.getByRole('tooltip')
    expect(tip.textContent).toContain('Copy link')
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id)
  })
  it('simple mode closes on blur and on Escape', () => {
    render(<Popover content="Copy link" portal={false}><button>Copy</button></Popover>)
    const trigger = screen.getByRole('button', { name: 'Copy' })
    fireEvent.focus(trigger)
    fireEvent.blur(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.focus(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
  it('rich mode opens on click as a labelled dialog', () => {
    render(<Popover mode="rich" title="Intent score" content="Details" portal={false}><button>About</button></Popover>)
    const trigger = screen.getByRole('button', { name: 'About' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Intent score' })
    expect(dialog).toBeTruthy()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
  it('rich mode closes with the close button and returns focus to the trigger', () => {
    render(<Popover mode="rich" title="Share" closeButton content="Body" portal={false}><button>Share</button></Popover>)
    const trigger = screen.getByRole('button', { name: 'Share' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
  it('rich mode closes on click outside', () => {
    render(<div><Popover mode="rich" title="Share" content="Body" portal={false}><button>Share</button></Popover><p>Outside</p></div>)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.mouseDown(screen.getByText('Outside'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('only one popover is open at a time', () => {
    render(<div><Popover mode="rich" title="A" content="a" portal={false}><button>One</button></Popover><Popover mode="rich" title="B" content="b" portal={false}><button>Two</button></Popover></div>)
    fireEvent.click(screen.getByRole('button', { name: 'One' }))
    fireEvent.click(screen.getByRole('button', { name: 'Two' }))
    expect(screen.getAllByRole('dialog').length).toBe(1)
    expect(screen.getByRole('dialog', { name: 'B' })).toBeTruthy()
  })
})
