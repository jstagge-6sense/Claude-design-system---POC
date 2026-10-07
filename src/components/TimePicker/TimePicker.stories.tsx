import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TimePicker } from './TimePicker'

const meta = {
  title: 'Data entry/Time Picker',
  component: TimePicker,
  parameters: { tier: 3, group: 'Data entry', description: 'Time of day field. Typing is the primary path, with smart parsing and a list of preset slots.' },
  args: { label: 'Start time', locale: 'en-US' },
  decorators: [(Story) => <div style={{ maxInlineSize: 360, minBlockSize: 440 }}><Story /></div>],
} satisfies Meta<typeof TimePicker>
export default meta
type Story = StoryObj<typeof meta>

const tall = { display: 'grid', gap: 24, maxInlineSize: 360, minBlockSize: 440 } as const

export const Default: Story = { args: { defaultOpen: true, defaultValue: '09:30', helperText: 'Type a time such as 930, 2:30pm or 1430.' } }
export const Closed: Story = { args: { defaultValue: '14:30' } }
export const SlotStep15: Story = { name: 'Slot step (15 minutes)', args: { defaultOpen: true, step: 15, min: '09:00', max: '12:00', defaultValue: '10:15' } }
export const WithPresets: Story = { name: 'With presets', args: { defaultOpen: true, presets: true, defaultValue: '17:00' } }
export const TwentyFourHour: Story = { name: '24-hour', args: { defaultOpen: true, hourCycle: 'h23', defaultValue: '14:30', locale: 'de-DE', label: 'Beginn' } }
export const Granular: Story = { name: 'Granular (H:M:S) with Apply', args: { defaultOpen: true, granular: true, presets: true, defaultValue: '09:15:30' }, decorators: [(Story) => <div style={{ maxInlineSize: 360, minBlockSize: 380 }}><Story /></div>] }
export const Invalid: Story = { args: { defaultValue: '', error: 'Enter a time like 9:30 AM.', helperText: 'Ignored while there is an error.' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: '09:00', helperText: 'Set by the schedule template.' } }
export const Controlled: Story = {
  render: (args) => {
    const Demo = () => {
      const [v, setV] = useState('08:45')
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <TimePicker {...args} value={v} onValueChange={setV} presets />
          <p style={{ margin: 0 }}>Value: {v || 'none'}</p>
        </div>
      )
    }
    return <Demo />
  },
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 360px))', gap: 24 }}>
      <TimePicker {...args} label="Default" defaultValue="09:30" />
      <TimePicker {...args} label="Hover" data-state="hover" defaultValue="09:30" />
      <TimePicker {...args} label="Focus" data-state="focus" defaultValue="09:30" />
      <TimePicker {...args} label="Error" error="Enter a time like 9:30 AM." defaultValue="" />
      <TimePicker {...args} label="Disabled" disabled defaultValue="09:30" />
      <div style={{ minBlockSize: 440 }}>
        <TimePicker {...args} label="Open, option states" defaultOpen step={60} defaultValue="09:00" forcedOptionStates={{ '01:00': 'hover', '02:00': 'pressed', '03:00': 'focus' }} />
      </div>
    </div>
  ),
}
