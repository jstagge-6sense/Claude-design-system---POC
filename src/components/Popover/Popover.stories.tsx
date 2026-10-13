import type { Meta, StoryObj } from '@storybook/react'
import { Popover } from './Popover'
import { Button } from '../Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Container/Popover',
  component: Popover,
  parameters: { tier: 1, group: 'Container', description: 'Contextual overlay next to a trigger. Simple mode is a tooltip on hover and focus. Rich mode is a dialog on click.' },
  args: { content: 'Copies the report link to your clipboard.', children: <Button priority="secondary">Trigger</Button>, portal: false, defaultOpen: true, exclusive: false },
} satisfies Meta<typeof Popover>
export default meta
type Story = StoryObj<typeof meta>

/** Docs frame: roomy and positioned, so overlays render in place. */
const frame = { position: 'relative', display: 'grid', placeItems: 'center', minBlockSize: 200, padding: 64 } as const

export const Simple: Story = {
  render: (args) => (
    <div style={frame}>
      <Popover {...args} mode="simple" side="top">
        <Button priority="secondary" iconOnly icon={<Icon name="copy" />} aria-label="Copy link" />
      </Popover>
    </div>
  ),
}
export const Rich: Story = {
  render: (args) => (
    <div style={{ ...frame, minBlockSize: 280 }}>
      <Popover {...args} mode="rich" side="bottom" align="start" title="Intent score" content="Scores combine third-party research signals and first-party engagement from the last 30 days. Review the scoring model before you build a segment on it.">
        <Button priority="secondary">About this score</Button>
      </Popover>
    </div>
  ),
}
export const RichWithCloseButton: Story = {
  render: (args) => (
    <div style={{ ...frame, minBlockSize: 300 }}>
      <Popover {...args} mode="rich" side="bottom" closeButton title="Share this segment" content={<div style={{ display: 'grid', gap: 12 }}><span>Anyone in your workspace can view it. Only editors can change the rules.</span><Button priority="primary" size="small">Copy link</Button></div>}>
        <Button priority="secondary" icon={<Icon name="users" />}>Share</Button>
      </Popover>
    </div>
  ),
}
export const Sides: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
      {(['top', 'bottom', 'start', 'end'] as const).map((s) => (
        <div key={s} style={{ ...frame, minBlockSize: 160, padding: 56 }}>
          <Popover {...args} mode="simple" side={s} content={`Side: ${s}`}>
            <Button priority="tertiary">{s}</Button>
          </Popover>
        </div>
      ))}
    </div>
  ),
}
export const FlipsToAvailableSpace: Story = {
  name: 'Flips to available space',
  render: (args) => (
    <div style={{ ...frame, placeItems: 'start center', minBlockSize: 180, padding: 8 }}>
      <Popover {...args} mode="simple" side="top" content="Prefers top, flips to bottom because there is no room above.">
        <Button priority="secondary">Near the top edge</Button>
      </Popover>
    </div>
  ),
}
export const NoArrow: Story = {
  render: (args) => (
    <div style={frame}>
      <Popover {...args} mode="simple" arrow={false} side="bottom">
        <Button priority="tertiary">No arrow</Button>
      </Popover>
    </div>
  ),
}
export const Interactive: Story = {
  name: 'Interactive (hover, focus, click)',
  args: { defaultOpen: false, portal: true, exclusive: true },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, padding: 64 }}>
      <Popover {...args} mode="simple" content="Hover or focus me.">
        <Button priority="secondary" iconOnly icon={<Icon name="info" />} aria-label="More information" />
      </Popover>
      <Popover {...args} mode="rich" title="Click popover" closeButton content="Press Escape, use the close button or click outside to dismiss.">
        <Button priority="secondary">Open popover</Button>
      </Popover>
    </div>
  ),
}
