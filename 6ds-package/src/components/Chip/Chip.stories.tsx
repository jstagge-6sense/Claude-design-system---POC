import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Chip, ChipGroup } from './Chip'
import { Icon } from '../../icons'

const meta = {
  title: 'Feedback and status/Chip',
  component: Chip,
  parameters: { tier: 2, group: 'Feedback and status', description: 'Compact element for a user-generated input, selection or filter. Dismissible, choice or view-only.' },
  args: { children: 'Software and SaaS' },
} satisfies Meta<typeof Chip>
export default meta
type Story = StoryObj<typeof meta>

export const Dismissible: Story = { args: { variant: 'dismissible' } }
export const Choice: Story = { args: { variant: 'choice' } }
export const ChoiceSelected: Story = { args: { variant: 'choice', defaultSelected: true } }
export const ViewOnly: Story = { args: { variant: 'viewOnly', children: 'Series B' } }

export const WithLeadingIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip variant="dismissible" leading={<Icon name="building" />}>Acme Corp</Chip>
      <Chip variant="choice" leading={<Icon name="filter" />}>High intent</Chip>
      <Chip variant="viewOnly" leading={<Icon name="hash" />}>enterprise</Chip>
    </div>
  ),
}
export const WithAvatar: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip variant="dismissible" leadingType="avatar" leading={<Icon name="user" size="100%" />}>Maya Chen</Chip>
      <Chip variant="choice" leadingType="avatar" leading={<Icon name="user" size="100%" />}>Owner: me</Chip>
      <Chip variant="viewOnly" leadingType="avatar" leading={<Icon name="user" size="100%" />}>Sam Ortiz</Chip>
    </div>
  ),
}
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip variant="dismissible" disabled>Locked filter</Chip>
      <Chip variant="choice" disabled>Unavailable</Chip>
      <Chip variant="choice" disabled defaultSelected>Unavailable, selected</Chip>
    </div>
  ),
}

const STATES = [undefined, 'hover', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 16, alignItems: 'center' }}>
      {STATES.map((s) => <Chip key={'c' + s} variant="choice" data-state={s}>Choice {s ?? 'default'}</Chip>)}
      {STATES.map((s) => <Chip key={'s' + s} variant="choice" defaultSelected data-state={s}>Selected {s ?? 'default'}</Chip>)}
      {STATES.map((s) => <Chip key={'d' + s} variant="dismissible" data-state={s}>Dismissible {s ?? 'default'}</Chip>)}
      <Chip variant="viewOnly">View-only</Chip>
      <Chip variant="choice" disabled>Disabled choice</Chip>
      <Chip variant="dismissible" disabled>Disabled dismissible</Chip>
    </div>
  ),
}

const INDUSTRIES = ['Software and SaaS', 'Financial services', 'Healthcare', 'Manufacturing']
function DismissibleGroup() {
  const [items, setItems] = useState(INDUSTRIES)
  return (
    <ChipGroup aria-label="Selected industries" onClearAll={() => setItems([])} showClearAll={items.length > 0}>
      {items.map((i) => <Chip key={i} variant="dismissible" onDismiss={() => setItems(items.filter((x) => x !== i))}>{i}</Chip>)}
      {items.length === 0 ? <span>No industries selected.</span> : null}
    </ChipGroup>
  )
}
export const DismissibleWithClearAll: Story = { render: () => <DismissibleGroup /> }

function ChoiceGroup() {
  const [picked, setPicked] = useState<string[]>(['Healthcare'])
  return (
    <ChipGroup aria-label="Filter by industry">
      {INDUSTRIES.map((i) => (
        <Chip
          key={i}
          variant="choice"
          selected={picked.includes(i)}
          onSelectedChange={(on) => setPicked(on ? [...picked, i] : picked.filter((x) => x !== i))}
        >
          {i}
        </Chip>
      ))}
    </ChipGroup>
  )
}
export const ChoiceSet: Story = { render: () => <ChoiceGroup /> }
