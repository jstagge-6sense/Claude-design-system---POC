import type { Meta, StoryObj } from '@storybook/react'
import { DataMetric } from './DataMetric'

const meta = {
  title: 'Navigation and structure/Data metric',
  component: DataMetric,
  parameters: { tier: 0, group: 'Navigation and structure', description: 'Atomic unit that shows one quantitative value with label, trend and comparison context.' },
  args: { label: 'Qualified accounts', value: 12480 },
} satisfies Meta<typeof DataMetric>
export default meta
type Story = StoryObj<typeof meta>

const SERIES = [820, 870, 860, 910, 990, 970, 1040, 1120, 1180, 1250]
const row = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))', gap: 32, alignItems: 'start' } as const

export const Simple: Story = {}
export const WithTrend: Story = { args: { trend: 'up', trendValue: 12, comparison: 'vs last period' } }
export const WithComparison: Story = {
  args: { label: 'Pipeline created', value: 2350000, format: { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }, trend: 'down', trendValue: 4.5, comparison: 'vs target of $2.5M' },
}
export const WithSparkline: Story = { args: { label: 'Weekly engaged accounts', value: 1250, trend: 'up', trendValue: 8, comparison: 'vs last week', sparkline: SERIES } }
export const Compact: Story = { args: { size: 'compact', label: 'Open opportunities', value: 342, trend: 'neutral', comparison: 'vs last month', sparkline: SERIES } }

export const Trends: Story = {
  render: (args) => (
    <div style={row}>
      <DataMetric {...args} label="Win rate" value={0.27} format={{ style: 'percent' }} trend="up" trendValue={3} comparison="vs last quarter" />
      <DataMetric {...args} label="Cycle length (days)" value={61} trend="down" trendValue={6} trendTone="positive" comparison="vs last quarter" />
      <DataMetric {...args} label="Churned accounts" value={18} trend="up" trendValue={20} trendTone="negative" comparison="vs last quarter" />
      <DataMetric {...args} label="Meetings booked" value={204} trend="neutral" comparison="vs last quarter" />
    </div>
  ),
}
export const Locales: Story = {
  name: 'Locale formatting',
  render: (args) => (
    <div style={row}>
      <DataMetric {...args} label="en-US" value={1234567.89} locale="en-US" />
      <DataMetric {...args} label="de-DE" value={1234567.89} locale="de-DE" />
      <DataMetric {...args} label="fr-FR currency" value={1234567.89} locale="fr-FR" format={{ style: 'currency', currency: 'EUR' }} />
    </div>
  ),
}
export const Loading: Story = { args: { loading: true } }
export const ErrorState: Story = { name: 'Error', args: { error: true, onRetry: () => undefined } }
export const Live: Story = { args: { live: true, label: 'Visitors on site now', value: 183, trend: 'up', trendValue: 2, comparison: 'vs 5 minutes ago' } }

export const StateMatrix: Story = {
  name: 'States (matrix)',
  render: () => (
    <div style={row}>
      <DataMetric label="Default" value={4210} />
      <DataMetric label="Positive trend" value={4210} trend="up" trendValue={12} comparison="vs last period" />
      <DataMetric label="Negative trend" value={4210} trend="down" trendValue={7} comparison="vs last period" />
      <DataMetric label="Neutral" value={4210} trend="neutral" comparison="vs last period" />
      <DataMetric label="Loading" value={4210} loading />
      <DataMetric label="Error" value={4210} error onRetry={() => undefined} />
      <DataMetric label="Compact" value={4210} size="compact" trend="up" trendValue={12} comparison="vs last period" />
      <DataMetric label="Compact loading" value={4210} size="compact" loading />
    </div>
  ),
}
