import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Radio, RadioGroup } from './Radio'

const meta = {
  title: 'Data entry/Radio',
  component: RadioGroup,
  parameters: { tier: 1, group: 'Data entry', description: 'Select exactly one option from a small visible set of 2 to 7.' },
  args: { legend: 'Report frequency', defaultValue: 'weekly' },
} satisfies Meta<typeof RadioGroup>
export default meta
type Story = StoryObj<typeof meta>

const Options = () => (
  <>
    <Radio value="daily" label="Daily" />
    <Radio value="weekly" label="Weekly" />
    <Radio value="monthly" label="Monthly" />
  </>
)

export const Vertical: Story = { render: (args) => <RadioGroup {...args}><Options /></RadioGroup> }
export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="Visibility" orientation="horizontal" defaultValue="private">
      <Radio value="private" label="Private" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  ),
}
export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="Refresh schedule" description="Choose how often this segment updates." defaultValue="nightly">
      <Radio value="live" label="Live" description="Updates as account activity arrives. Uses more credits." />
      <Radio value="nightly" label="Nightly" description="Updates once a day at 2 AM UTC." />
      <Radio value="manual" label="Manual" description="Updates only when you select Refresh." />
    </RadioGroup>
  ),
}
export const Cards: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="Choose a plan" variant="card" defaultValue="team">
      <Radio value="solo" label="Solo" description="One seat. Best for trying the product." />
      <Radio value="team" label="Team" description="Up to 20 seats with shared segments." />
      <Radio value="org" label="Organization" description="Unlimited seats, SSO and audit logs." />
    </RadioGroup>
  ),
}
export const Error: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="Report frequency" defaultValue={undefined} error="Choose a frequency so we know when to send the report.">
      <Options />
    </RadioGroup>
  ),
}
export const Disabled: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <RadioGroup {...args} legend="Whole group disabled" disabled defaultValue="weekly"><Options /></RadioGroup>
      <RadioGroup {...args} legend="One option disabled" defaultValue="daily">
        <Radio value="daily" label="Daily" />
        <Radio value="weekly" label="Weekly" disabled />
        <Radio value="monthly" label="Monthly" disabled />
      </RadioGroup>
    </div>
  ),
}

const STATES = [undefined, 'hover', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 16, alignItems: 'start' }}>
      {STATES.map((s) => (
        <RadioGroup key={'u' + s} {...args} legend={`Unselected ${s ?? 'default'}`} defaultValue="b">
          <Radio value="a" label="Option" data-state={s} />
          <Radio value="b" label="Other" />
        </RadioGroup>
      ))}
      {STATES.map((s) => (
        <RadioGroup key={'c' + s} {...args} legend={`Selected ${s ?? 'default'}`} defaultValue="a">
          <Radio value="a" label="Option" data-state={s} />
          <Radio value="b" label="Other" />
        </RadioGroup>
      ))}
      {STATES.map((s) => (
        <RadioGroup key={'k' + s} {...args} legend={`Card ${s ?? 'default'}`} variant="card" defaultValue="a">
          <Radio value="a" label="Selected card" description="With a description." data-state={s} />
          <Radio value="b" label="Other card" description="Unselected." />
        </RadioGroup>
      ))}
    </div>
  ),
}

function Controlled() {
  const [v, setV] = useState('weekly')
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <RadioGroup legend="Report frequency" value={v} onValueChange={setV}><Options /></RadioGroup>
      <span>Selected: {v}</span>
    </div>
  )
}
export const ControlledGroup: Story = { render: () => <Controlled /> }
