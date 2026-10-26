import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from './Dialog'
import { Frame, SamplePage } from './storyFrame'
import { Button } from '../Button'
import { Input } from '../Input'

const meta = {
  title: 'Container/Dialog',
  component: Dialog,
  parameters: { tier: 1, group: 'Container', description: 'Interrupts the workflow to confirm an action, show critical information or complete a short focused task.' },
  args: { title: 'Delete segment?', open: true, portal: false, trapFocus: false, lockScroll: false, autoFocus: false },
} satisfies Meta<typeof Dialog>
export default meta
type Story = StoryObj<typeof meta>

/** Docs-only props: render in place and do not trap focus, lock scroll or move focus. */
const INLINE = { portal: false, trapFocus: false, lockScroll: false, autoFocus: false } as const

export const ConfirmationDestructive: Story = {
  name: 'Confirmation (destructive)',
  render: (args) => (
    <Frame>
      <SamplePage />
      <Dialog {...args} {...INLINE} complexity="confirmation" size="small" destructive title="Delete segment?"
        description="Healthcare, new buying group will be removed from 3 active campaigns. This cannot be undone."
        confirmLabel="Delete segment" onConfirm={() => {}} />
    </Frame>
  ),
}

export const ConfirmationUnsavedChanges: Story = {
  name: 'Confirmation (unsaved changes)',
  render: (args) => (
    <Frame>
      <SamplePage />
      <Dialog {...args} {...INLINE} complexity="confirmation" size="small" title="Save changes before leaving?"
        description="You edited the scoring rules. Unsaved changes are lost when you leave this page."
        confirmLabel="Save changes" cancelLabel="Keep editing" onConfirm={() => {}} />
    </Frame>
  ),
}

export const Form: Story = {
  render: (args) => (
    <Frame>
      <SamplePage />
      <Dialog {...args} {...INLINE} complexity="form" size="medium" title="Rename segment" confirmLabel="Save name" onConfirm={() => {}}>
        <Input label="Segment name" defaultValue="Mid-market fintech, EMEA" helperText="Names appear in campaign targeting." />
      </Dialog>
    </Frame>
  ),
}

export const Information: Story = {
  render: (args) => (
    <Frame>
      <SamplePage />
      <Dialog {...args} {...INLINE} complexity="information" size="medium" title="Segment summary">
        <p style={{ margin: 0 }}>Mid-market fintech, EMEA includes 642 accounts across 9 countries.</p>
        <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
          <li>Fit score 70 or higher</li>
          <li>Two or more buying group members engaged in the last 30 days</li>
          <li>Last refreshed today</li>
        </ul>
      </Dialog>
    </Frame>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['small', 'medium', 'large'] as const).map((s) => (
        <Frame key={s} height={420}>
          <SamplePage action={false} />
          <Dialog {...args} {...INLINE} size={s} complexity="information" title={`${s[0].toUpperCase()}${s.slice(1)} dialog`}>
            <p style={{ margin: 0 }}>Width uses a minimum and a maximum, never a fixed pixel size, so it adapts to its container.</p>
          </Dialog>
        </Frame>
      ))}
    </div>
  ),
}

export const Confirming: Story = {
  render: (args) => (
    <Frame>
      <SamplePage />
      <Dialog {...args} {...INLINE} complexity="confirmation" size="small" destructive confirming title="Delete segment?"
        description="Healthcare, new buying group will be removed from 3 active campaigns." confirmLabel="Delete segment" />
    </Frame>
  ),
}

export const LongContent: Story = {
  name: 'Long content (fixed header and footer)',
  render: (args) => (
    <Frame height={420}>
      <SamplePage />
      <Dialog {...args} {...INLINE} complexity="information" size="medium" title="Scoring model changes" confirmLabel="Acknowledge changes">
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: 0 }}>Rule {i + 1}: accounts that visit the pricing page twice in 14 days add 5 points to intent, capped at 20 per week.</p>
        ))}
      </Dialog>
    </Frame>
  ),
}

export const FullScreenOnMobile: Story = {
  name: 'Full screen on mobile (narrow frame)',
  render: (args) => (
    <Frame width={360} height={640}>
      <SamplePage action={false} />
      <Dialog {...args} {...INLINE} complexity="confirmation" size="small" destructive title="Delete segment?"
        description="Healthcare, new buying group will be removed from 3 active campaigns." confirmLabel="Delete segment" />
    </Frame>
  ),
}

const STATES = [undefined, 'hover', 'pressed', 'focus'] as const
export const ButtonStates: Story = {
  name: 'Close and action states (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
      {STATES.map((s) => (
        <Frame key={s ?? 'default'} height={300}>
          <Dialog {...args} {...INLINE} complexity="confirmation" size="small" destructive title={`State: ${s ?? 'default'}`}
            description="Forced states on the close, cancel and confirm controls." confirmLabel="Delete segment"
            closeButtonProps={{ 'data-state': s }} cancelButtonProps={{ 'data-state': s }} confirmButtonProps={{ 'data-state': s }} />
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
        <Frame>
          <SamplePage action={false} />
          <div style={{ position: 'absolute', insetBlockStart: 16, insetInlineEnd: 16 }}>
            <Button priority="destructive" onClick={() => setOpen(true)}>Delete segment</Button>
          </div>
          <Dialog {...args} {...INLINE} autoFocus open={open} onOpenChange={setOpen} complexity="confirmation" size="small" destructive
            title="Delete segment?" description="This removes the segment from 3 active campaigns." confirmLabel="Delete segment" onConfirm={() => setOpen(false)} />
        </Frame>
      )
    }
    return <Demo />
  },
}
