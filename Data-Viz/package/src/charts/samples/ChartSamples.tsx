import { AreaChart, LineChart, BarChart, StackedGroupedBarChart, DonutChart } from '../index'
import * as d from './sample-data'

/**
 * React usage samples for all seven DBA charts, with synthetic data. Render this component in an app that has
 * called `initDbaCharts(Highcharts)` once (see ../README.md), or open samples/index.html for the offline page.
 */
export function ChartSamples() {
  // One chart per screen, full width. Heights are CSS lengths, so each chart fills that space and reflows on resize.
  const grid = { display: 'grid', gridTemplateColumns: '1fr', gap: 32 } as const
  const H = 300
  return (
    <div style={grid}>
      <AreaChart height={H} title="Engaged accounts" description="Engaged accounts grew from 820 in January to 1,250 in December." categories={d.MONTHS} values={d.engagedAccounts} seriesName="Engaged accounts" labelStep={2} yTitle="Accounts" />
      <LineChart height={H} title="Pipeline by region" description="Pipeline created by region per month. North America leads in every month." categories={d.MONTHS.slice(0, 6)} series={d.pipelineByRegion} valueFormat={{ kind: 'currency', compact: true }} yTitle="Pipeline" />
      <BarChart height={H} title="Top industries" description="Account counts by industry, software first." data={d.industries} seriesName="Accounts" />
      <BarChart height={H} title="Top industries (sequential)" description="Same data, darker bars for larger values." data={d.industries} colorMode="sequential" seriesName="Accounts" />
      <BarChart height={H} title="Leads by channel" description="Leads by channel." data={d.channels} orientation="vertical" colorMode="categorical" seriesName="Leads" />
      <StackedGroupedBarChart height={H} title="Leads by channel (stacked)" description="Stacked leads by channel per quarter." categories={d.quarters} series={d.leadsByChannel} orientation="vertical" />
      <StackedGroupedBarChart height={H} title="Leads by channel (grouped)" description="Leads by channel per quarter, side by side." categories={d.quarters} series={d.leadsByChannel} mode="grouped" orientation="vertical" />
      <StackedGroupedBarChart height={H} title="Share of leads (100%)" description="Share of leads by channel per quarter." categories={d.quarters} series={d.leadsByChannel} mode="percent" legendPosition="right" />
      <div style={{ height: H }}><DonutChart title="Accounts by tier" description="Accounts by tier. Tier 1 is the largest segment." data={d.accountsByTier} size="fill" subtext="accounts" change={4.2} /></div>
    </div>
  )
}
