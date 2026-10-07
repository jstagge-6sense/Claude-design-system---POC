import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NumberInput } from './NumberInput'

const meta = {
  title: 'Data entry/Number input',
  component: NumberInput,
  parameters: { tier: 2, group: 'Data entry', description: 'Numeric entry by typing, steppers or arrow keys. Rejects non-numeric characters and communicates min and max.' },
  args: { label: 'Daily budget cap', defaultValue: 25 },
  decorators: [(Story) => <div style={{ maxInlineSize: 320 }}><Story /></div>],
} satisfies Meta<typeof NumberInput>
export default meta
type Story = StoryObj<typeof meta>

const col = { display: 'grid', gap: 24, maxInlineSize: 320 } as const

export const WithSteppers: Story = { args: { helperText: 'Use the arrow keys, or Shift plus arrow to step by 10.' } }
export const TypeOnly: Story = { args: { steppers: false, label: 'Seats', defaultValue: 12, helperText: 'Type a whole number. Letters, e, + and - are rejected.' } }
export const MinMaxConstrained: Story = {
  args: { label: 'Confidence threshold', min: 0, max: 100, defaultValue: 100, unit: '%', helperText: 'Between 0 and 100.' },
}
export const AtMinimum: Story = { args: { label: 'Retry attempts', min: 0, max: 10, defaultValue: 0, helperText: 'How many times a failed sync retries.' } }
export const WithUnit: Story = {
  render: (args) => (
    <div style={col}>
      <NumberInput {...args} label="Sync window" unit="days" defaultValue={30} min={1} max={365} />
      <NumberInput {...args} label="Column width" unit="px" defaultValue={240} step={10} min={80} />
      <NumberInput {...args} label="Win rate" unit="%" defaultValue={12.5} step={0.5} min={0} max={100} />
    </div>
  ),
}
export const Sizes: Story = {
  render: (args) => (
    <div style={col}>
      <NumberInput {...args} size="medium" label="Medium" />
      <NumberInput {...args} size="small" label="Small" />
    </div>
  ),
}
export const NegativeAllowed: Story = { args: { label: 'Score adjustment', min: -50, max: 50, defaultValue: -10, helperText: 'Negative values are allowed because the minimum is below zero.' } }
export const RequiredEmpty: Story = {
  name: 'Required (validated on blur)',
  args: { label: 'Seats', defaultValue: null, requirement: 'required', requiredMessage: 'Enter the number of seats.', helperText: 'Focus the field, then tab out empty.' },
}
export const Controlled: Story = {
  render: (args) => {
    const Demo = () => {
      const [v, setV] = useState<number | null>(5)
      return (
        <div style={col}>
          <NumberInput {...args} label="Quantity" min={1} max={20} value={v} onValueChange={setV} />
          <span>Current value: {v === null ? 'empty' : v}</span>
        </div>
      )
    }
    return <Demo />
  },
}
export const Error: Story = { args: { label: 'Seats', defaultValue: 0, error: 'Enter at least 1 seat. Your plan needs one admin.', min: 0 } }
export const Disabled: Story = { args: { label: 'Seats', disabled: true, defaultValue: 12, unit: 'seats', helperText: 'Managed by your plan.' } }
export const ReadOnly: Story = { args: { label: 'Seats used', readOnly: true, defaultValue: 48, unit: 'seats' } }

const ROWS: Array<{ name: string; props: Record<string, unknown>; state?: 'hover' | 'focus' }> = [
  { name: 'Default', props: { defaultValue: null, placeholder: '0' } },
  { name: 'Hover (forced)', props: {}, state: 'hover' },
  { name: 'Focus (forced)', props: {}, state: 'focus' },
  { name: 'Filled', props: { defaultValue: 42, unit: 'days' } },
  { name: 'At maximum', props: { defaultValue: 100, min: 0, max: 100, unit: '%' } },
  { name: 'Error', props: { defaultValue: 0, error: 'Enter at least 1.' } },
  { name: 'Disabled', props: { disabled: true, unit: 'days' } },
  { name: 'Read-only', props: { readOnly: true, unit: 'days' } },
]
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))', gap: 24 }}>
      {ROWS.map((r) => <NumberInput key={r.name} {...args} {...r.props} label={r.name} data-state={r.state} />)}
    </div>
  ),
}
