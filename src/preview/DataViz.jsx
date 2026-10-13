// Data visualization section of the preview. Plain JSX on purpose: it pulls the DBA chart components from the Data-Viz
// folder (their own package, Highcharts peer dependency), so the root typecheck never traverses them.
import React, { useEffect, useState } from 'react'
import {
  initDbaCharts, AreaChart, LineChart, BarChart, StackedGroupedBarChart, DonutChart, FunnelChart, ParetoChart,
} from '../../Data-Viz/package/src/charts'
import { Card as DsCard } from '../components/Card'
import * as d from '../../Data-Viz/package/src/charts/samples/sample-data'

const h = React.createElement
const H = 300

export const DATAVIZ_PAGES = [
  ['area', 'Area'], ['line', 'Line'], ['bar', 'Bar'], ['stacked', 'Stacked and grouped bar'],
  ['donut', 'Donut'], ['funnel', 'Funnel'], ['pareto', 'Pareto'],
]

let ready = false
function useCharts() {
  const [state, setState] = useState(ready ? 'ready' : 'loading')
  useEffect(() => {
    if (ready) return
    let tries = 0
    const t = setInterval(() => {
      if (typeof window !== 'undefined' && window.Highcharts && window.Highcharts.Chart) {
        initDbaCharts(window.Highcharts); ready = true; setState('ready'); clearInterval(t)
      } else if (++tries > 100) { setState('failed'); clearInterval(t) }
    }, 150)
    return () => clearInterval(t)
  }, [])
  return state
}

const Section = ({ title, note, children }) => h('section', { className: 'pv-section' }, h('h2', null, title), note ? h('p', { className: 'pv-muted' }, note) : null, children)
const Card = ({ children }) => h('div', { className: 'pv-card', style: { padding: 16 } }, children)

const PAGES = {
  area: () => [
    h(AreaChart, { key: 1, height: H, title: 'Engaged accounts', description: 'Engaged accounts grew from 820 in January to 1,250 in December.', categories: d.MONTHS, values: d.engagedAccounts, seriesName: 'Engaged accounts', labelStep: 2, yTitle: 'Accounts' }),
    h(AreaChart, { key: 2, height: H, curved: false, title: 'Engaged accounts (straight)', description: 'Same data with straight segments.', categories: d.MONTHS, values: d.engagedAccounts, seriesName: 'Engaged accounts', labelStep: 2, yTitle: 'Accounts' }),
  ],
  line: () => [
    h(LineChart, { key: 1, height: H, title: 'Pipeline by region', description: 'Pipeline created by region per month. North America leads in every month.', categories: d.MONTHS.slice(0, 6), series: d.pipelineByRegion, valueFormat: { kind: 'currency', compact: true }, yTitle: 'Pipeline' }),
  ],
  bar: () => [
    h(BarChart, { key: 1, height: H, title: 'Top industries', description: 'Account counts by industry, software first.', data: d.industries, seriesName: 'Accounts' }),
    h(BarChart, { key: 2, height: H, title: 'Top industries (sequential)', description: 'Same data, darker bars for larger values.', data: d.industries, colorMode: 'sequential', seriesName: 'Accounts' }),
    h(BarChart, { key: 3, height: H, title: 'Leads by channel', description: 'Leads by channel.', data: d.channels, orientation: 'vertical', colorMode: 'categorical', seriesName: 'Leads' }),
  ],
  stacked: () => [
    h(StackedGroupedBarChart, { key: 1, height: H, title: 'Leads by channel (stacked)', description: 'Stacked leads by channel per quarter.', categories: d.quarters, series: d.leadsByChannel, orientation: 'vertical' }),
    h(StackedGroupedBarChart, { key: 2, height: H, title: 'Leads by channel (grouped)', description: 'Leads by channel per quarter, side by side.', categories: d.quarters, series: d.leadsByChannel, mode: 'grouped', orientation: 'vertical' }),
    h(StackedGroupedBarChart, { key: 3, height: H, title: 'Share of leads (100%)', description: 'Share of leads by channel per quarter.', categories: d.quarters, series: d.leadsByChannel, mode: 'percent', legendPosition: 'right' }),
  ],
  donut: () => [
    h(DonutChart, { key: 1, size: 300, legendPosition: 'right', title: 'Accounts by tier', description: 'Accounts by tier. Tier 1 is the largest segment.', data: d.accountsByTier, subtext: 'accounts', change: 4.2 }),
  ],
  funnel: () => [
    h(FunnelChart, { key: 1, height: 320, title: 'Buying stages', description: 'Accounts by buying stage. 153 are targeted but not engaged; of the engaged accounts, 781 are aware, 716 considering, 328 deciding and 213 have purchased.', stages: d.buyingStages, unit: 'Accounts' }),
  ],
  pareto: () => [
    h(ParetoChart, { key: 1, height: H, title: 'Support tickets by cause', description: 'Login and billing cause most tickets.', data: d.ticketCauses, seriesName: 'Tickets', threshold: 80 }),
  ],
}

export function DataVizPage({ id }) {
  const state = useCharts()
  if (!PAGES[id]) id = 'area'
  const title = (DATAVIZ_PAGES.find((p) => p[0] === id) || [])[1]
  return h(Section, { title, note: 'Synthetic sample data. Each chart is 100% of its container width and reflows on resize.' },
    id !== 'funnel' && state === 'failed' ? h(Card, null, 'Highcharts could not be loaded from jsDelivr, unpkg or code.highcharts.com. Check your connection or network filter and reload.')
      : id !== 'funnel' && state !== 'ready' ? h(Card, null, 'Loading Highcharts…')
      : h('div', { style: { display: 'grid', gap: 'var(--core-dimension-space-comfortable)' } }, PAGES[id]().map((c, i) => h(DsCard, { key: i }, c))))
}
