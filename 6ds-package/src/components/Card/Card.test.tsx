import { render, screen, fireEvent } from '@testing-library/react'
import { Card, CardGrid } from './Card'

describe('Card', () => {
  it('renders the title as a heading and the body', () => {
    render(<Card title="Segment" headingLevel={2}>Body text</Card>)
    expect(screen.getByRole('heading', { level: 2, name: 'Segment' })).toBeTruthy()
    expect(screen.getByText('Body text')).toBeTruthy()
  })
  it('makes the whole card one link with one accessible name', () => {
    render(<Card title="Open segment" href="/segments/1">Body</Card>)
    const link = screen.getByRole('link', { name: 'Open segment' })
    expect(link.getAttribute('href')).toBe('/segments/1')
    expect(screen.getAllByRole('link').length).toBe(1)
  })
  it('makes the whole card a button and reports selection with aria-pressed', () => {
    const onClick = vi.fn()
    render(<Card title="Pick me" onClick={onClick} selected />)
    const b = screen.getByRole('button', { name: 'Pick me' })
    fireEvent.click(b)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(b.getAttribute('aria-pressed')).toBe('true')
  })
  it('announces selection on a static card with text, not color alone', () => {
    render(<Card title="Static" selected />)
    expect(screen.getByText('Selected')).toBeTruthy()
  })
  it('toggles expanded details with aria-expanded and aria-controls', () => {
    render(<Card title="More" expandable details="Hidden details" />)
    const t = screen.getByRole('button', { name: 'Details' })
    expect(t.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(t)
    expect(t.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById(t.getAttribute('aria-controls') as string)?.hasAttribute('hidden')).toBe(false)
  })
  it('shows a loading status instead of content', () => {
    render(<Card title="Segment" loading>Body</Card>)
    expect(screen.getByRole('status', { name: 'Loading Segment' })).toBeTruthy()
    expect(screen.queryByText('Body')).toBeNull()
  })
  it('composes DataMetric for the metric variant', () => {
    render(<Card variant="metric" metric={{ label: 'Win rate', value: 27, trend: 'up', trendValue: 3 }} />)
    expect(screen.getByRole('group', { name: 'Win rate' })).toBeTruthy()
  })
  it('keeps actions as separate controls from the clickable layer', () => {
    render(<Card title="Seg" href="#" actions={<button type="button">Edit</button>} />)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeTruthy()
  })
})

describe('CardGrid', () => {
  it('renders a labelled list with one item per card', () => {
    render(<CardGrid label="Segments"><Card title="A" /><Card title="B" /></CardGrid>)
    expect(screen.getByRole('list', { name: 'Segments' })).toBeTruthy()
    expect(screen.getAllByRole('listitem').length).toBe(2)
  })
  it('renders a labelled region landmark', () => {
    render(<CardGrid label="Shortcuts" semantics="region"><Card title="A" /></CardGrid>)
    expect(screen.getByRole('region', { name: 'Shortcuts' })).toBeTruthy()
  })
})
