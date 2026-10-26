import { render, screen, fireEvent } from '@testing-library/react'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('renders a labelled dialog and moves focus inside', () => {
    render(<Drawer open title="Segment details"><input aria-label="Name" /></Drawer>)
    const d = screen.getByRole('dialog', { name: 'Segment details' })
    expect(d.getAttribute('aria-modal')).toBe('true')
    expect(d.contains(document.activeElement)).toBe(true)
  })
  it('renders nothing when closed', () => {
    render(<Drawer open={false} title="Segment details" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('closes with the close button and Escape', () => {
    const onDismiss = vi.fn()
    render(<Drawer open onDismiss={onDismiss} title="Segment details" />)
    fireEvent.click(screen.getByRole('button', { name: 'Close drawer' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onDismiss.mock.calls.map((c) => c[0])).toEqual(['close', 'escape'])
  })
  it('non-modal leaves scroll unlocked and is not aria-modal', () => {
    render(<Drawer open modal={false} title="Account preview" />)
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('false')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
  it('modal locks body scroll', () => {
    render(<Drawer open title="Segment details" />)
    expect(document.body.style.overflow).toBe('hidden')
  })
  it('marks the dialog busy while loading and keeps children mounted', () => {
    render(<Drawer open loading title="Segment details"><p>Details body</p></Drawer>)
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true')
    expect(screen.getByText('Details body')).toBeTruthy()
  })
  it('places footer actions', () => {
    render(<Drawer open title="Segment details" primaryAction={<button>Save changes</button>} tertiaryAction={<button>Delete segment</button>} />)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Delete segment' })).toBeTruthy()
  })
})
