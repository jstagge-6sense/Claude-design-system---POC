import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardGrid } from './Card'
import { Button } from '../Button'
import { Badge } from '../Badge'
import { Icon } from '../../icons'

const meta = {
  title: 'Container/Card',
  component: Card,
  parameters: { tier: 1, group: 'Container', description: 'Contained surface that groups related information and actions for a single subject.' },
  args: {
    title: 'Mid-market expansion',
    subtitle: 'Segment, updated 2 days ago',
    children: 'Accounts with 200 to 1,000 employees that engaged with two or more campaigns in the last 30 days.',
  },
  decorators: [(Story) => <div style={{ maxInlineSize: '24rem' }}><Story /></div>],
} satisfies Meta<typeof Card>
export default meta
type Story = StoryObj<typeof meta>

const Media = () => (
  <svg viewBox="0 0 320 120" role="img" aria-label="Sample chart: accounts engaged per week, rising" style={{ display: 'block', inlineSize: '100%' }}>
    <polyline points="8,100 60,88 112,92 164,60 216,48 268,30 312,22" fill="none" stroke="currentColor" strokeWidth="3" />
  </svg>
)
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', gap: 24, alignItems: 'start', maxInlineSize: 'none' } as const

export const Basic: Story = {
  args: { footer: 'Owner: Priya Raman' },
}
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button priority="tertiary" size="small">Archive segment</Button>
        <Button priority="secondary" size="small">Edit segment</Button>
      </>
    ),
  },
}
export const WithMedia: Story = { args: { media: <Media />, headerAction: <Badge kind="category">Draft</Badge> } }
export const ClickableLink: Story = {
  name: 'Clickable (link)',
  args: { href: '#segment-mid-market', footer: 'Open segment' },
}
export const ClickableButton: Story = {
  name: 'Clickable (button)',
  args: { onClick: () => undefined },
}
export const Metric: Story = {
  args: {
    variant: 'metric',
    title: undefined,
    subtitle: undefined,
    children: undefined,
    metric: { label: 'Engaged accounts', value: 1250, trend: 'up', trendValue: 8, comparison: 'vs last week', sparkline: [820, 870, 860, 910, 990, 970, 1040, 1120, 1180, 1250] },
  },
}
export const Compact: Story = { args: { compact: true } }
export const Loading: Story = { args: { loading: true, media: <Media />, footer: 'Owner' } }
export const Selected: Story = { args: { selected: true, onClick: () => undefined } }

export const Expandable: Story = {
  render: (args) => (
    <Card {...args} expandable details="Includes 412 accounts across 9 industries. Refreshed nightly from the engagement model." />
  ),
}

export const StateMatrix: Story = {
  name: 'States (forced)',
  decorators: [(Story) => <div style={{ maxInlineSize: 'none' }}><Story /></div>],
  render: (args) => (
    <div style={grid}>
      <Card {...args} title="Default" />
      <Card {...args} title="Hover" onClick={() => undefined} data-state="hover" />
      <Card {...args} title="Focus" onClick={() => undefined} data-state="focus" />
      <Card {...args} title="Selected" onClick={() => undefined} selected />
      <Card {...args} title="Loading" loading footer="Owner" />
      <Card {...args} title="Expanded" expandable defaultExpanded details="Includes 412 accounts across 9 industries." />
    </div>
  ),
}

export const InGrid: Story = {
  name: 'Card grid (list semantics)',
  decorators: [(Story) => <div style={{ maxInlineSize: 'none' }}><Story /></div>],
  render: () => <SelectableGrid />,
}
function SelectableGrid() {
    const [picked, setPicked] = useState<string | null>('b')
    const data = [
      { id: 'a', t: 'Enterprise expansion', d: 'Accounts above 1,000 employees with a renewal in the next 2 quarters.' },
      { id: 'b', t: 'Mid-market expansion', d: 'Accounts with 200 to 1,000 employees engaged in the last 30 days.' },
      { id: 'c', t: 'Reactivation', d: 'Closed-lost accounts that returned to the site in the last 14 days.' },
    ]
    return (
      <CardGrid label="Segments">
        {data.map((s) => (
          <Card key={s.id} title={s.t} onClick={() => setPicked(s.id)} selected={picked === s.id} footer={<><Icon name="users" /> 3 owners</>}>
            {s.d}
          </Card>
        ))}
      </CardGrid>
    )
}
export const MetricGrid: Story = {
  name: 'Card grid (metric cards)',
  decorators: [(Story) => <div style={{ maxInlineSize: 'none' }}><Story /></div>],
  render: () => (
    <CardGrid label="Key metrics" minItemWidth="14rem">
      <Card variant="metric" metric={{ label: 'Win rate', value: 0.27, format: { style: 'percent' }, trend: 'up', trendValue: 3, comparison: 'vs last quarter' }} />
      <Card variant="metric" metric={{ label: 'Cycle length (days)', value: 61, trend: 'down', trendValue: 6, trendTone: 'positive', comparison: 'vs last quarter' }} />
      <Card variant="metric" metric={{ label: 'Meetings booked', value: 204, trend: 'neutral', comparison: 'vs last quarter' }} />
    </CardGrid>
  ),
}
