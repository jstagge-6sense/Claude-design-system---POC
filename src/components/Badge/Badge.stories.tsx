import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge, type BadgeTone } from './Badge'
import { Button } from '../Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Feedback/Badge',
  component: Badge,
  parameters: { tier: 2, group: 'Feedback and status', description: 'Non-interactive label for status, category, count or a New and Beta moniker. One or two words.' },
  args: { children: 'Active' },
} satisfies Meta<typeof Badge>
export default meta
type Story = StoryObj<typeof meta>

const TONES: BadgeTone[] = ['neutral', 'info', 'success', 'warning', 'critical', 'accent']
const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } as const

export const Status: Story = {
  render: () => (
    <div style={row}>
      <Badge kind="status" tone="success">Active</Badge>
      <Badge kind="status" tone="warning">Pending</Badge>
      <Badge kind="status" tone="critical">Error</Badge>
      <Badge kind="status" tone="info">Syncing</Badge>
      <Badge kind="status" tone="neutral">Inactive</Badge>
    </div>
  ),
}
export const Category: Story = {
  render: () => (
    <div style={row}>
      <Badge kind="category">Intent</Badge>
      <Badge kind="category">Advertising</Badge>
      <Badge kind="category">Sales</Badge>
    </div>
  ),
}
export const Count: Story = {
  render: () => (
    <div style={row}>
      <Badge kind="count" tone="critical" count={3} />
      <Badge kind="count" tone="critical" count={42} />
      <Badge kind="count" tone="critical" count={240} />
      <Badge kind="count" tone="neutral" count={7} />
    </div>
  ),
}
export const NewAndBeta: Story = {
  render: () => (
    <div style={row}>
      <Badge kind="new">New</Badge>
      <Badge kind="new">Beta</Badge>
    </div>
  ),
}
export const WithLeadingIcon: Story = {
  render: () => (
    <div style={row}>
      <Badge kind="status" tone="success" icon={<Icon name="check" />}>Verified</Badge>
      <Badge kind="category" icon={<Icon name="sparkle" />}>AI assisted</Badge>
      <Badge kind="status" tone="warning" icon={false}>Draft</Badge>
    </div>
  ),
}

function LiveCount() {
  const [n, setN] = useState(2)
  return (
    <div style={row}>
      <span>Notifications</span>
      <Badge kind="count" tone="critical" count={n} />
      <Button priority="secondary" size="small" onClick={() => setN(n + 1)}>Add notification</Button>
    </div>
  )
}
export const DynamicCount: Story = { render: () => <LiveCount /> }

export const ToneMatrix: Story = {
  name: 'Tones (forced matrix)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 16, alignItems: 'center' }}>
      {TONES.map((t) => (
        <>
          <Badge key={t + 's'} kind="status" tone={t}>{t}</Badge>
          <Badge key={t + 'c'} kind="category" tone={t}>{t}</Badge>
          <Badge key={t + 'n'} kind="count" tone={t} count={12} />
          <Badge key={t + 'i'} kind="status" tone={t} icon={<Icon name="info" />}>{t}</Badge>
        </>
      ))}
    </div>
  ),
}
