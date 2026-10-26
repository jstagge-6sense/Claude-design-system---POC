import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Sticky } from './Sticky'
import { Button } from '../Button'

const meta = {
  title: 'Patterns/Sticky',
  component: Sticky,
  parameters: {
    tier: 0,
    group: 'Patterns',
    description: 'Pins an element to a scroll edge and shows a visible boundary while stuck. Sticky elements must cover no more than 20% of the viewport height.',
    docs: {
      description: {
        component:
          'Rules. (1) A sticky element must not obscure more than 20% of the viewport height; Sticky warns in development when it does. (2) On mobile, reduce sticky height: collapse the page header and hide the toolbar until the user scrolls up. (3) A stuck element shows a boundary (rule plus shadow) so it reads as separate from scrolling content. (4) Sticky inside a scroll container only works relative to that container: pass `root` and test nested scroll contexts. Use `useStuck` to build your own sticky element (Table header, PageHeader).',
      },
    },
  },
} satisfies Meta<typeof Sticky>
export default meta
type Story = StoryObj<typeof meta>

const FRAME: React.CSSProperties = { blockSize: 280, overflow: 'auto', position: 'relative', border: '1px solid currentColor', borderRadius: 12 }
const Filler = ({ n = 18, prefix = 'Account' }: { n?: number; prefix?: string }) => (
  <div style={{ padding: 16, display: 'grid', gap: 12 }}>
    {Array.from({ length: n }, (_, i) => <p key={i} style={{ margin: 0 }}>{prefix} {i + 1}: Acme Corp renewal review notes and next steps.</p>)}
  </div>
)

export const Top: Story = {
  render: () => {
    const root = useRef<HTMLDivElement>(null)
    return (
      <div ref={root} style={FRAME} tabIndex={0} role="region" aria-label="Scrollable accounts">
        <Sticky edge="top" root={root} style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Accounts</strong>
          <Button priority="secondary" size="small">Export list</Button>
        </Sticky>
        <Filler />
      </div>
    )
  },
}
export const Bottom: Story = {
  render: () => {
    const root = useRef<HTMLDivElement>(null)
    return (
      <div ref={root} style={FRAME} tabIndex={0} role="region" aria-label="Scrollable form">
        <Filler n={14} prefix="Field" />
        <Sticky edge="bottom" root={root} style={{ padding: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button priority="tertiary" size="small">Cancel</Button>
          <Button size="small">Save changes</Button>
        </Sticky>
      </div>
    )
  },
}
export const StartEdge: Story = {
  name: 'Start edge (horizontal scroll)',
  render: () => {
    const root = useRef<HTMLDivElement>(null)
    return (
      <div ref={root} style={{ ...FRAME, blockSize: 120, display: 'flex' }} tabIndex={0} role="region" aria-label="Scrollable columns">
        <Sticky edge="start" root={root} style={{ padding: 16, minInlineSize: 140 }}>Acme Corp</Sticky>
        <div style={{ padding: 16, minInlineSize: 1200, whiteSpace: 'nowrap' }}>Scroll sideways. The first column stays in view and shows a boundary.</div>
      </div>
    )
  },
}
export const StuckMatrix: Story = {
  name: 'Boundary (forced)',
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['top', 'bottom', 'start'] as const).map((edge) => (
        <div key={edge} style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ minInlineSize: 120 }}>edge: {edge}</span>
          <Sticky edge={edge} data-stuck={false} style={{ position: 'static', padding: 12, minInlineSize: 160 }}>Not stuck</Sticky>
          <Sticky edge={edge} data-stuck style={{ position: 'static', padding: 12, minInlineSize: 160 }}>Stuck</Sticky>
        </div>
      ))}
    </div>
  ),
}
