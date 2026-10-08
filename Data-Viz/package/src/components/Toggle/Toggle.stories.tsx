import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './Toggle'

const meta = {
  title: 'Data entry/Toggle',
  component: Toggle,
  parameters: { tier: 1, group: 'Data entry', description: 'Immediate on/off switch. The change takes effect without a save button.' },
  args: { label: 'Email me when a segment changes' },
} satisfies Meta<typeof Toggle>
export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {}
export const On: Story = { args: { defaultChecked: true } }
export const WithDescription: Story = {
  args: { label: 'Sync accounts nightly', description: 'Pulls new accounts from your CRM at 2 AM UTC.', defaultChecked: true },
}
export const Small: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 4 }}>
      <Toggle {...args} size="small" label="Show archived segments" />
      <Toggle {...args} size="small" label="Show owner column" defaultChecked />
    </div>
  ),
}
export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 4 }}>
      <Toggle {...args} disabled label="Sync accounts nightly (off, locked)" />
      <Toggle {...args} disabled defaultChecked label="Audit logging (on, locked by your admin)" />
    </div>
  ),
}
export const Loading: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 4 }}>
      <Toggle {...args} loading label="Saving, currently off" />
      <Toggle {...args} loading defaultChecked label="Saving, currently on" />
      <Toggle {...args} loading size="small" defaultChecked label="Saving, small" />
    </div>
  ),
}

const STATES = [undefined, 'hover', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 16, alignItems: 'center' }}>
      {STATES.map((s) => <Toggle key={'off' + s} {...args} label={`Off ${s ?? 'default'}`} data-state={s} />)}
      {STATES.map((s) => <Toggle key={'on' + s} {...args} defaultChecked label={`On ${s ?? 'default'}`} data-state={s} />)}
      <Toggle {...args} disabled label="Disabled off" />
      <Toggle {...args} disabled defaultChecked label="Disabled on" />
      <Toggle {...args} loading defaultChecked label="Loading" />
    </div>
  ),
}

function Optimistic() {
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <Toggle
      label="Enable weekly digest"
      description="Sent every Monday at 8 AM."
      checked={on}
      loading={busy}
      onCheckedChange={(next) => { setBusy(true); setTimeout(() => { setOn(next); setBusy(false) }, 800) }}
    />
  )
}
export const AsyncChange: Story = { render: () => <Optimistic /> }
