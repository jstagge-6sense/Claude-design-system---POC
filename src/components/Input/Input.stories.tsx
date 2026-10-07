import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'
import { Icon } from '../../icons'

const meta = {
  title: 'Data entry/Input',
  component: Input,
  parameters: { tier: 1, group: 'Data entry', description: 'Single-line text field with label, helper text, validation on blur, counter and inline actions.' },
  args: { label: 'Segment name', placeholder: 'For example, Enterprise accounts in EMEA' },
  decorators: [(Story) => <div style={{ maxInlineSize: 360 }}><Story /></div>],
} satisfies Meta<typeof Input>
export default meta
type Story = StoryObj<typeof meta>

const col = { display: 'grid', gap: 24, maxInlineSize: 360 } as const

export const Default: Story = {}
export const WithHelperText: Story = { args: { helperText: 'Shown in lists and reports. Use 3 to 40 characters.' } }
export const RequiredAndOptional: Story = {
  render: (args) => (
    <div style={col}>
      <Input {...args} label="Work email" requirement="required" placeholder="name@company.com" type="email" autoComplete="email" />
      <Input {...args} label="Description" requirement="optional" placeholder="What is this segment for?" />
    </div>
  ),
}
export const Sizes: Story = {
  render: (args) => (
    <div style={col}>
      <Input {...args} size="medium" label="Medium (default)" defaultValue="Enterprise accounts" />
      <Input {...args} size="small" label="Small (dense layouts)" defaultValue="Enterprise accounts" />
    </div>
  ),
}
export const WithIcons: Story = {
  render: (args) => (
    <div style={col}>
      <Input {...args} label="Search segments" leadingIcon={<Icon name="search" />} placeholder="Find a segment" />
      <Input {...args} label="Website" trailingIcon={<Icon name="externalLink" />} placeholder="company.com" defaultValue="6sense.com" />
      <Input {...args} label="Owner" leadingIcon={<Icon name="user" />} trailingIcon={<Icon name="check" />} defaultValue="Priya Raman" />
    </div>
  ),
}
export const CharacterCounter: Story = {
  args: { label: 'Campaign name', maxLength: 40, defaultValue: 'Q4 expansion, mid-market SaaS', helperText: 'Visible to everyone in your workspace.' },
}
export const ClearButton: Story = { args: { label: 'Account owner', clearable: true, defaultValue: 'Priya Raman' } }
export const PasswordToggle: Story = {
  args: { label: 'Password', type: 'password', passwordToggle: true, defaultValue: 'correct horse battery', autoComplete: 'current-password', helperText: 'Use at least 12 characters.' },
}
export const LoadingAsyncValidation: Story = {
  args: { label: 'Workspace URL', loading: true, defaultValue: 'acme-marketing', helperText: 'Checking availability.', trailingIcon: undefined },
}
export const ErrorState: Story = {
  args: { label: 'Work email', defaultValue: 'priya@', error: 'Enter an email address like name@company.com.', type: 'email' },
}
export const ValidationOnBlur: Story = {
  name: 'Validation timing (on blur)',
  render: (args) => (
    <Input
      {...args}
      label="Work email"
      requirement="required"
      type="email"
      helperText="Type an invalid address, then tab out. The error appears on blur, then clears as you fix it."
      validate={(v) => (/^\S+@\S+\.\S+$/.test(v) ? undefined : 'Enter an email address like name@company.com.')}
    />
  ),
}
export const AsyncValidation: Story = {
  name: 'Async validation with spinner',
  render: (args) => {
    const Demo = () => {
      const [state, setState] = useState<'idle' | 'checking'>('idle')
      return (
        <Input
          {...args}
          label="Workspace URL"
          loading={state === 'checking'}
          helperText="Type, then pause. We check availability after 400 ms."
          onValueChange={() => { setState('checking'); setTimeout(() => setState('idle'), 800) }}
        />
      )
    }
    return <Demo />
  },
}
export const Disabled: Story = { args: { label: 'Segment name', disabled: true, defaultValue: 'Enterprise accounts', helperText: 'Locked while the segment syncs.' } }
export const ReadOnly: Story = { args: { label: 'Segment ID', readOnly: true, defaultValue: 'seg_8f3a21c7', helperText: 'Read-only. Copy it for API calls.' } }

const ROWS: Array<{ name: string; props: Record<string, unknown>; state?: 'hover' | 'focus' }> = [
  { name: 'Default', props: {} },
  { name: 'Hover (forced)', props: {}, state: 'hover' },
  { name: 'Focus (forced)', props: {}, state: 'focus' },
  { name: 'Filled', props: { defaultValue: 'Enterprise accounts' } },
  { name: 'Error', props: { defaultValue: 'priya@', error: 'Enter an email address like name@company.com.' } },
  { name: 'Error + focus', props: { defaultValue: 'priya@', error: 'Enter an email address like name@company.com.' }, state: 'focus' },
  { name: 'Disabled', props: { defaultValue: 'Enterprise accounts', disabled: true } },
  { name: 'Read-only', props: { defaultValue: 'seg_8f3a21c7', readOnly: true } },
  { name: 'Loading', props: { defaultValue: 'acme-marketing', loading: true } },
]
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: 24 }}>
      {(['medium', 'small'] as const).map((size) => (
        <div key={size} style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          {ROWS.map((r) => (
            <Input key={size + r.name} {...args} {...r.props} size={size} label={`${r.name} (${size})`} data-state={r.state} />
          ))}
        </div>
      ))}
    </div>
  ),
}
