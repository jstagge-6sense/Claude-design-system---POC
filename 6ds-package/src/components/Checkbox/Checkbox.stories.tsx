import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox, CheckboxGroup } from './Checkbox'

const meta = {
  title: 'Data entry/Checkbox',
  component: Checkbox,
  parameters: { tier: 1, group: 'Data entry', description: 'Select zero or more options, or a single binary choice that needs form submission.' },
  args: { label: 'Send me product updates' },
} satisfies Meta<typeof Checkbox>
export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Indeterminate: Story = { args: { indeterminate: true, label: 'Select all segments' } }
export const WithDescription: Story = { args: { label: 'Share with my team', description: 'Teammates in this workspace can view and edit the segment.' } }
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <Checkbox label="Archived segment" disabled />
      <Checkbox label="Required by your plan" disabled defaultChecked />
      <Checkbox label="Partly selected" disabled indeterminate />
    </div>
  ),
}
export const Error: Story = {
  args: { label: 'I agree to the data processing terms', error: true, errorMessage: 'Accept the terms to continue.' },
}

const STATES = [undefined, 'hover', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 16, alignItems: 'center' }}>
      {STATES.map((s) => <Checkbox key={'u' + s} label={`Unchecked ${s ?? 'default'}`} data-state={s} />)}
      {STATES.map((s) => <Checkbox key={'c' + s} label={`Checked ${s ?? 'default'}`} defaultChecked data-state={s} />)}
      {STATES.map((s) => <Checkbox key={'i' + s} label={`Mixed ${s ?? 'default'}`} indeterminate data-state={s} />)}
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
      <Checkbox label="Error" error />
    </div>
  ),
}

function GroupDemo({ orientation }: { orientation?: 'vertical' | 'horizontal' }) {
  const [value, setValue] = useState<string[]>(['email'])
  return (
    <CheckboxGroup legend="Notification channels" description="Choose where we send alerts." value={value} onValueChange={setValue} orientation={orientation}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="slack" label="Slack" />
      <Checkbox value="sms" label="Text message" />
    </CheckboxGroup>
  )
}
export const Group: Story = { render: () => <GroupDemo /> }
export const GroupHorizontal: Story = { render: () => <GroupDemo orientation="horizontal" /> }
export const GroupWithDescriptions: Story = {
  render: () => (
    <CheckboxGroup legend="Data to export" defaultValue={['accounts']}>
      <Checkbox value="accounts" label="Accounts" description="Name, domain and owner." />
      <Checkbox value="contacts" label="Contacts" description="Job title, email and phone." />
      <Checkbox value="activity" label="Activity" description="Visits, form fills and ad clicks from the last 90 days." />
    </CheckboxGroup>
  ),
}
export const GroupError: Story = {
  render: () => (
    <CheckboxGroup legend="Notification channels" error="Select at least one channel so we know where to send alerts.">
      <Checkbox value="email" label="Email" />
      <Checkbox value="slack" label="Slack" />
    </CheckboxGroup>
  ),
}

function ParentChild() {
  const options = ['Accounts', 'Contacts', 'Opportunities']
  const [value, setValue] = useState<string[]>(['Accounts'])
  const all = value.length === options.length
  const some = value.length > 0 && !all
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <Checkbox label="Select all objects" checked={all} indeterminate={some} onChange={() => setValue(all ? [] : options)} />
      <div style={{ paddingInlineStart: 28 }}>
        <CheckboxGroup legend="Objects" value={value} onValueChange={setValue}>
          {options.map((o) => <Checkbox key={o} value={o} label={o} />)}
        </CheckboxGroup>
      </div>
    </div>
  )
}
export const IndeterminateParent: Story = { render: () => <ParentChild /> }
export const GroupDisabled: Story = {
  render: () => (
    <CheckboxGroup legend="Notification channels" disabled defaultValue={['email']}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="slack" label="Slack" />
    </CheckboxGroup>
  ),
}
