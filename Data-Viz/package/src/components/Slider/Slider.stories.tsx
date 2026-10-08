import type { Meta, StoryObj } from '@storybook/react'
import { Slider } from './Slider'

const meta = {
  title: 'Data entry/Slider',
  component: Slider,
  parameters: { tier: 2, group: 'Data entry', description: 'Pick a value within a range by dragging. Always shows the current value. Single-value only: use two number inputs for a range.' },
  args: { label: 'Match confidence', defaultValue: 60, unit: '%' },
  decorators: [(Story) => <div style={{ maxInlineSize: 420, paddingBlockStart: 8 }}><Story /></div>],
} satisfies Meta<typeof Slider>
export default meta
type Story = StoryObj<typeof meta>

const col = { display: 'grid', gap: 32, maxInlineSize: 420 } as const

export const Continuous: Story = { args: { helperText: 'Drag, or use the arrow keys. Home and End jump to the ends, Page Up and Page Down move by 10%.' } }
export const Discrete: Story = {
  args: { label: 'Refresh frequency', discrete: true, min: 1, max: 7, step: 1, defaultValue: 3, unit: 'days', helperText: 'Snaps to whole days.' },
}
export const DiscreteLabelled: Story = {
  name: 'Discrete with custom value text',
  args: {
    label: 'Sensitivity',
    discrete: true,
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 2,
    unit: undefined,
    formatValue: (v) => ['Off', 'Low', 'Medium', 'High', 'Maximum'][v],
  },
}
export const WithValueLabel: Story = { args: { showValueLabel: true } }
export const WithSyncedInput: Story = { name: 'With synced number input', args: { withInput: true, helperText: 'Drag for a rough value, type for precision.' } }
export const WithValueLabelAndInput: Story = { args: { showValueLabel: true, withInput: true, label: 'Budget share', defaultValue: 35 } }
export const Currency: Story = {
  args: { label: 'Monthly budget', min: 0, max: 5000, step: 50, defaultValue: 1500, unit: undefined, formatValue: (v) => `$${v.toLocaleString('en-US')}`, showValueLabel: true },
}
export const Error: Story = { args: { error: 'Choose at least 50% so the segment is large enough to activate.', defaultValue: 20 } }
export const Disabled: Story = { args: { disabled: true, discrete: true, min: 0, max: 10, step: 1, defaultValue: 4, unit: undefined, showValueLabel: true, helperText: 'Locked by your plan.' } }

export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={col}>
      <Slider {...args} label="Default" showValueLabel />
      <Slider {...args} label="Hover (forced)" data-state="hover" showValueLabel />
      <Slider {...args} label="Focus (forced)" data-state="focus" showValueLabel />
      <Slider {...args} label="Dragging (forced)" data-state="pressed" showValueLabel />
      <Slider {...args} label="Disabled" disabled showValueLabel />
      <Slider {...args} label="Error" error="Choose at least 80%." showValueLabel />
    </div>
  ),
}
