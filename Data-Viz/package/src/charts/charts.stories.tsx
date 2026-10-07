import type { Meta, StoryObj } from '@storybook/react'
import { setupCharts } from './charts.setup'
import { AreaChart, LineChart, BarChart, StackedGroupedBarChart, DonutChart, FunnelChart, ParetoChart } from './index'

const meta = {
  title: 'Charts/DBA charts',
  parameters: { tier: 2, group: 'Patterns', description: 'Highcharts-based DBA charts that share one theme, palette and formatter set.' },
} satisfies Meta
setupCharts()
export default meta
type Story = StoryObj<typeof meta>

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(24rem, 1fr))', gap: 32 } as const

export const Area: Story = {
  render: () => (
    <AreaChart title="Engaged accounts" description="Engaged accounts grew from 820 in January to 1,250 in December." categories={MONTHS} values={[820, 870, 860, 910, 990, 970, 1040, 1120, 1180, 1250, 1230, 1250]} seriesName="Engaged accounts" labelStep={2} yTitle="Accounts" />
  ),
}
export const AreaStraight: Story = {
  name: 'Area (straight)',
  render: () => <AreaChart title="Weekly visits" description="Visits per week." categories={MONTHS.slice(0, 6)} values={[12, 18, 15, 22, 30, 28]} seriesName="Visits" curved={false} />,
}
export const Line: Story = {
  render: () => (
    <LineChart
      title="Pipeline by region"
      description="Pipeline created by region per month. North America leads in every month."
      categories={MONTHS.slice(0, 6)}
      series={[{ name: 'North America', data: [4.1, 4.4, 4.9, 5.2, 5.8, 6.1] }, { name: 'EMEA', data: [2.2, 2.5, 2.4, 2.9, 3.1, 3.4] }, { name: 'APAC', data: [1.1, 1.3, 1.6, 1.5, 1.9, 2.2] }, { name: 'Other', data: [0.4, 0.5, 0.4, 0.6, 0.6, 0.7], other: true }]}
      valueFormat={{ kind: 'currency', compact: true }}
      yTitle="Pipeline"
    />
  ),
}
export const LineCurved: Story = {
  name: 'Line (curved, trend)',
  render: () => <LineChart title="Win rate trend" description="Win rate trends upward." curved categories={MONTHS.slice(0, 6)} series={[{ name: 'Win rate', data: [22, 24, 23, 26, 27, 29] }]} valueFormat={{ kind: 'percent' }} legendPosition="none" />,
}
export const Bar: Story = {
  render: () => (
    <div style={grid}>
      <BarChart title="Top industries (single color)" description="Account counts by industry, software first." data={[{ name: 'Software', value: 420 }, { name: 'Financial services', value: 310 }, { name: 'Healthcare', value: 280 }, { name: 'Manufacturing', value: 190 }, { name: 'Retail', value: 140 }]} />
      <BarChart title="Top industries (sequential)" description="Same data, darker bars for larger values." colorMode="sequential" data={[{ name: 'Software', value: 420 }, { name: 'Financial services', value: 310 }, { name: 'Healthcare', value: 280 }, { name: 'Manufacturing', value: 190 }, { name: 'Retail', value: 140 }]} />
      <BarChart title="Channels (categorical, column)" description="Leads by channel." orientation="vertical" colorMode="categorical" data={[{ name: 'Email', value: 52 }, { name: 'Paid', value: 38 }, { name: 'Events', value: 27 }, { name: 'Organic', value: 61 }]} />
    </div>
  ),
}
export const StackedGrouped: Story = {
  name: 'Bar (stacked and grouped)',
  render: () => {
    const series = [{ name: 'Email', data: [30, 34, 28, 40] }, { name: 'Paid', data: [20, 22, 25, 18] }, { name: 'Events', data: [10, 12, 15, 20] }, { name: 'Other', data: [4, 5, 3, 6], other: true }]
    const cats = ['Q1', 'Q2', 'Q3', 'Q4']
    return (
      <div style={grid}>
        <StackedGroupedBarChart title="Leads by channel (stacked)" description="Stacked leads by channel per quarter." categories={cats} series={series} orientation="vertical" />
        <StackedGroupedBarChart title="Leads by channel (grouped)" description="Leads by channel per quarter, side by side." categories={cats} series={series} mode="grouped" orientation="vertical" />
        <StackedGroupedBarChart title="Share of leads (100%)" description="Share of leads by channel per quarter." categories={cats} series={series} mode="percent" legendPosition="right" />
      </div>
    )
  },
}
export const Donut: Story = {
  render: () => (
    <DonutChart title="Accounts by tier" description="Accounts by tier, tier 1 is the largest segment." size={300} subtext="accounts" change={4.2} data={[{ name: 'Tier 1', value: 540 }, { name: 'Tier 2', value: 320 }, { name: 'Tier 3', value: 210 }, { name: 'Other', value: 60, other: true }]} />
  ),
}
export const Funnel: Story = {
  render: () => (
    <FunnelChart title="Buying stage funnel" description="Accounts by buying stage, from 12,480 targeted to 310 won." stages={[{ name: 'Targeted', value: 12480 }, { name: 'Aware', value: 6200 }, { name: 'Considering', value: 2400 }, { name: 'Decision', value: 820 }, { name: 'Purchase', value: 310 }]} />
  ),
}
export const Pareto: Story = {
  render: () => (
    <ParetoChart title="Support tickets by cause" description="Three causes account for about 80 percent of tickets." threshold={80} seriesName="Tickets" data={[{ name: 'Login', value: 120 }, { name: 'Billing', value: 80 }, { name: 'Sync', value: 45 }, { name: 'Reports', value: 20 }, { name: 'Other', value: 15 }]} />
  ),
}
export const States: Story = {
  render: () => (
    <div style={grid}>
      <AreaChart title="Loading" description="Loading state." categories={[]} values={[]} seriesName="x" loading />
      <BarChart title="Error" description="Error state." data={[]} error />
      <DonutChart title="Empty" description="Empty state." data={[]} />
    </div>
  ),
}
