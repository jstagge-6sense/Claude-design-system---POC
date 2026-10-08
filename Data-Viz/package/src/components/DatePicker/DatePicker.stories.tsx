import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker, type DateValue } from './DatePicker'

const TODAY = '2026-10-06'

const meta = {
  title: 'Data entry/Date Picker',
  component: DatePicker,
  parameters: { tier: 2, group: 'Data entry', description: 'Date or date range field. Typing is always supported, with a calendar and presets in a positioned panel.' },
  args: { label: 'Due date', locale: 'en-US', today: TODAY },
  decorators: [(Story) => <div style={{ maxInlineSize: 420, minBlockSize: 520 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>
export default meta
type Story = StoryObj<typeof meta>

const wide = (Story: () => JSX.Element) => <div style={{ maxInlineSize: 560, minBlockSize: 540 }}><Story /></div>

export const SingleDate: Story = { args: { defaultOpen: true, defaultValue: '2026-10-14' } }
export const Closed: Story = { args: { defaultValue: '2026-10-14', helperText: 'Type a date, or press the down arrow to open the calendar.' } }
export const DateRangeWithApply: Story = {
  name: 'Date range (Apply)',
  args: { label: 'Reporting period', mode: 'range', defaultOpen: true, defaultValue: { start: '2026-10-05', end: '2026-10-12' } },
  decorators: [wide],
}
export const RangeWithPresets: Story = {
  name: 'Range with presets',
  args: { label: 'Reporting period', mode: 'range', presets: true, defaultOpen: true, defaultValue: { start: '2026-09-30', end: '2026-10-06' } },
  decorators: [wide],
}
export const SingleWithPresets: Story = { name: 'Single with presets', args: { presets: true, defaultOpen: true }, decorators: [wide] }
export const Constraints: Story = {
  name: 'Min, max and disabled dates',
  args: {
    label: 'Delivery date', defaultOpen: true, min: '2026-10-05', max: '2026-10-28', defaultValue: '2026-10-14',
    isDateDisabled: (iso) => { const d = new Date(iso + 'T00:00:00Z').getUTCDay(); return d === 0 || d === 6 },
    helperText: 'Weekends are not available.',
  },
}
export const WithTime: Story = { name: 'With time', args: { withTime: true, label: 'Send on', defaultOpen: true, defaultValue: '2026-10-14', defaultTime: '09:30' }, decorators: [wide] }
export const LocaleMondayStart: Story = { name: 'Locale: de-DE (week starts Monday)', args: { locale: 'de-DE', label: 'Fälligkeitsdatum', defaultOpen: true, defaultValue: '2026-10-14' } }
export const RightToLeft: Story = {
  name: 'Right to left',
  args: { locale: 'ar-EG', label: 'تاريخ الاستحقاق', defaultOpen: true, defaultValue: '2026-10-14' },
  decorators: [(Story) => <div dir="rtl" lang="ar" style={{ maxInlineSize: 420, minBlockSize: 520 }}><Story /></div>],
}
export const Invalid: Story = { args: { error: 'Enter a date like MM/DD/YYYY.', defaultValue: null } }
export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-10-14', helperText: 'Locked after the campaign launches.' } }
export const Controlled: Story = {
  render: (args) => {
    const Demo = () => {
      const [v, setV] = useState<DateValue>('2026-10-20')
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          <DatePicker {...args} value={v} onValueChange={setV} />
          <p style={{ margin: 0 }}>Value: {typeof v === 'string' ? v : v ? `${v.start} to ${v.end}` : 'none'}</p>
        </div>
      )
    }
    return <Demo />
  },
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  decorators: [(Story) => <div style={{ minBlockSize: 560 }}><Story /></div>],
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 420px))', gap: 24 }}>
      <DatePicker {...args} label="Default" defaultValue="2026-10-14" />
      <DatePicker {...args} label="Hover" data-state="hover" defaultValue="2026-10-14" />
      <DatePicker {...args} label="Focus" data-state="focus" defaultValue="2026-10-14" />
      <DatePicker {...args} label="Invalid" error="Enter a date like MM/DD/YYYY." />
      <DatePicker {...args} label="Disabled" disabled defaultValue="2026-10-14" />
      <DatePicker
        {...args}
        label="Open, day states"
        defaultOpen
        mode="range"
        defaultValue={{ start: '2026-10-08', end: '2026-10-12' }}
        min="2026-10-02"
        forcedDayStates={{ '2026-10-15': 'hover', '2026-10-16': 'pressed', '2026-10-19': 'focus' }}
      />
    </div>
  ),
}
