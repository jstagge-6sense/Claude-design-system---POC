import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'

const meta = {
  title: 'Feedback/Spinner',
  component: Spinner,
  parameters: { tier: 1, group: 'Feedback and status', description: 'System is processing. Use for waits under 10 seconds where structure is unknown.' },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>

// BEGIN generated guidelines (scripts/gen-storybook-guidelines.mjs)
import { GuidelinesStory } from '../../storybook/GuidelinesStory'
import * as self from './Spinner.stories'
export const Guidelines: StoryObj = {
  name: 'Guidelines',
  parameters: { layout: 'fullscreen', controls: { disable: true }, actions: { disable: true } },
  render: () => <GuidelinesStory folder="Spinner" mod={self as unknown as Record<string, unknown>} />,
}
// END generated guidelines

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Spinner size="small" /><Spinner size="medium" /><Spinner size="large" />
    </div>
  ),
}
export const WithLabel: Story = { args: { size: 'medium', label: 'Loading segments' } }
export const Overlay: Story = {
  render: () => (
    <div style={{ position: 'relative', inlineSize: 280, blockSize: 140, border: '1px dashed currentColor', display: 'grid', placeItems: 'center' }}>
      Section content
      <Spinner overlay size="medium" label="Loading" />
    </div>
  ),
}
