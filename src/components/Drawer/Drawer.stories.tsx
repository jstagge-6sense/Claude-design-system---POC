import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Drawer } from './Drawer'
import { Frame, SamplePage } from '../Dialog/storyFrame'
import { Button } from '../Button'
import { Icon } from '../../icons'
import { Input } from '../Input'
import { Badge } from '../Badge'

const meta = {
  title: 'Container/Drawer',
  component: Drawer,
  parameters: { tier: 2, group: 'Container', description: 'Temporary secondary workspace that slides in from an edge while keeping the page in view.' },
  args: { title: 'Segment details', open: true },
} satisfies Meta<typeof Drawer>
export default meta
type Story = StoryObj<typeof meta>

/** Docs-only props: render in place and leave focus, scroll and the page alone. */
const INLINE = { portal: false, trapFocus: false, lockScroll: false, autoFocus: false } as const

const Details = () => (
  <>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge kind="status" tone="success">Active</Badge>
      <span>642 accounts</span>
    </div>
    <Input label="Segment name" defaultValue="Mid-market fintech, EMEA" />
    <Input label="Owner" defaultValue="Priya Raman" />
    <p style={{ margin: 0 }}>Accounts qualify when fit score is 70 or higher and two buying group members engaged in the last 30 days.</p>
  </>
)

const Actions = {
  primaryAction: <Button priority="primary">Save changes</Button>,
  secondaryAction: <Button priority="secondary">Cancel</Button>,
  tertiaryAction: <Button priority="tertiary" icon={<Icon name="trash" />}>Delete segment</Button>,
}

export const Medium: Story = {
  render: (args) => (
    <Frame height={560}>
      <SamplePage />
      <Drawer {...args} {...INLINE} size="medium" icon={<Icon name="users" />} headerActions={<Button priority="tertiary" size="small" iconOnly icon={<Icon name="edit" />} aria-label="Edit segment" />} {...Actions}>
        <Details />
      </Drawer>
    </Frame>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['small', 'medium', 'large'] as const).map((s) => (
        <Frame key={s} height={420}>
          <SamplePage action={false} />
          <Drawer {...args} {...INLINE} size={s} title={`${s[0].toUpperCase()}${s.slice(1)} drawer`} primaryAction={<Button>Save changes</Button>} secondaryAction={<Button priority="secondary">Cancel</Button>}>
            <Details />
          </Drawer>
        </Frame>
      ))}
    </div>
  ),
}

export const StartEdge: Story = {
  name: 'Start edge',
  render: (args) => (
    <Frame height={460}>
      <SamplePage />
      <Drawer {...args} {...INLINE} side="start" size="small" title="Filters" primaryAction={<Button>Apply filters</Button>} secondaryAction={<Button priority="secondary">Reset</Button>}>
        <Input label="Industry" defaultValue="Financial services" />
        <Input label="Region" defaultValue="EMEA" />
      </Drawer>
    </Frame>
  ),
}

export const Loading: Story = {
  render: (args) => (
    <Frame height={460}>
      <SamplePage />
      <Drawer {...args} {...INLINE} loading loadingLabel="Loading segment" size="medium" title="Segment details" primaryAction={<Button>Save changes</Button>}>
        <Details />
      </Drawer>
    </Frame>
  ),
}

export const Push: Story = {
  render: (args) => (
    <Frame height={460}>
      <div style={{ display: 'flex', blockSize: '100%' }}>
        <div style={{ flex: '1 1 0', minInlineSize: 0, overflow: 'auto' }}><SamplePage /></div>
        <Drawer {...args} behavior="push" {...INLINE} size="small" title="Segment details" primaryAction={<Button>Save changes</Button>} secondaryAction={<Button priority="secondary">Cancel</Button>}>
          <Details />
        </Drawer>
      </div>
    </Frame>
  ),
}

export const NonModal: Story = {
  name: 'Not modal (page stays interactive)',
  render: (args) => (
    <Frame height={460}>
      <SamplePage />
      <Drawer {...args} {...INLINE} modal={false} size="small" title="Account preview" icon={<Icon name="building" />}>
        <Details />
      </Drawer>
    </Frame>
  ),
}

export const ScrollingBody: Story = {
  name: 'Scrolling body (fixed header and footer)',
  render: (args) => (
    <Frame height={420}>
      <SamplePage />
      <Drawer {...args} {...INLINE} size="medium" title="Activity" primaryAction={<Button>Export activity</Button>} secondaryAction={<Button priority="secondary">Close</Button>}>
        {Array.from({ length: 14 }, (_, i) => <p key={i} style={{ margin: 0 }}>Day {i + 1}: 3 accounts moved to the engaged stage after visiting the pricing page.</p>)}
      </Drawer>
    </Frame>
  ),
}

export const FullScreenOnMobile: Story = {
  name: 'Full screen on mobile (narrow frame)',
  render: (args) => (
    <Frame width={360} height={640}>
      <SamplePage action={false} />
      <Drawer {...args} {...INLINE} size="medium" title="Segment details" {...Actions}>
        <Details />
      </Drawer>
    </Frame>
  ),
}

const STATES = [undefined, 'hover', 'pressed', 'focus'] as const
export const CloseStates: Story = {
  name: 'Close control states (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
      {STATES.map((s) => (
        <Frame key={s ?? 'default'} height={240}>
          <Drawer {...args} {...INLINE} size="small" title={`State: ${s ?? 'default'}`} closeButtonProps={{ 'data-state': s }}>
            <p style={{ margin: 0 }}>Forced state on the close control.</p>
          </Drawer>
        </Frame>
      ))}
    </div>
  ),
}

export const WithTrigger: Story = {
  name: 'Opens from a trigger',
  render: (args) => {
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <Frame height={460}>
          <SamplePage action={false} />
          <div style={{ position: 'absolute', insetBlockStart: 16, insetInlineEnd: 16 }}>
            <Button priority="secondary" onClick={() => setOpen(true)}>View details</Button>
          </div>
          <Drawer {...args} {...INLINE} autoFocus open={open} onOpenChange={setOpen} size="small" title="Segment details" primaryAction={<Button onClick={() => setOpen(false)}>Done</Button>}>
            <Details />
          </Drawer>
        </Frame>
      )
    }
    return <Demo />
  },
}
