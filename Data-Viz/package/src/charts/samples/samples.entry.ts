// Entry for the offline sample page (samples/index.html). Bundled to samples/dist/dba-charts-samples.js by
// scripts/build-chart-samples.mjs. It uses the same option builders and theme as the React components, and the
// same merge order as DbaChart (title, description, height, preset options).
import { dbaTheme } from '../theme'
import { buildAreaOptions } from '../AreaChart'
import { buildLineOptions } from '../LineChart'
import { buildBarOptions } from '../BarChart'
import { buildStackedGroupedOptions } from '../StackedGroupedBarChart'
import { buildDonutOptions } from '../DonutChart'
import type { ChartOptions, HighchartsStatic } from '../highcharts'
import { USABLE } from '../palette.generated'
import { mountEditor } from './editor'
import * as d from './sample-data'

interface Sample {
  id: string
  title: string
  description: string
  height: number
  options: ChartOptions
}

function samples(): Sample[] {
  const mk = (id: string, title: string, description: string, height: number, options: ChartOptions): Sample => ({ id, title, description, height, options })
  return [
    mk('area', 'Engaged accounts', 'Engaged accounts grew from 820 in January to 1,250 in December.', 320,
      buildAreaOptions({ title: 'Engaged accounts', description: '', categories: d.MONTHS, values: d.engagedAccounts, seriesName: 'Engaged accounts', labelStep: 2, yTitle: 'Accounts' })),
    mk('line', 'Pipeline by region', 'Pipeline created by region per month. North America leads in every month.', 320,
      buildLineOptions({ title: 'Pipeline by region', description: '', categories: d.MONTHS.slice(0, 6), series: d.pipelineByRegion, valueFormat: { kind: 'currency', compact: true }, yTitle: 'Pipeline' })),
    mk('bar', 'Top industries', 'Account counts by industry, software first.', 320,
      buildBarOptions({ title: 'Top industries', description: '', data: d.industries, seriesName: 'Accounts' })),
    mk('bar-sequential', 'Top industries (sequential)', 'Same data, darker bars for larger values.', 320,
      buildBarOptions({ title: 'Top industries (sequential)', description: '', data: d.industries, colorMode: 'sequential', seriesName: 'Accounts' })),
    mk('bar-categorical', 'Leads by channel (columns, categorical)', 'Leads by channel.', 320,
      buildBarOptions({ title: 'Leads by channel', description: '', data: d.channels, orientation: 'vertical', colorMode: 'categorical', seriesName: 'Leads' })),
    mk('stacked', 'Leads by channel (stacked)', 'Stacked leads by channel per quarter.', 340,
      buildStackedGroupedOptions({ title: 'Leads by channel (stacked)', description: '', categories: d.quarters, series: d.leadsByChannel, orientation: 'vertical' })),
    mk('grouped', 'Leads by channel (grouped)', 'Leads by channel per quarter, side by side.', 340,
      buildStackedGroupedOptions({ title: 'Leads by channel (grouped)', description: '', categories: d.quarters, series: d.leadsByChannel, mode: 'grouped', orientation: 'vertical' })),
    mk('percent', 'Share of leads (100%)', 'Share of leads by channel per quarter.', 340,
      buildStackedGroupedOptions({ title: 'Share of leads (100%)', description: '', categories: d.quarters, series: d.leadsByChannel, mode: 'percent', legendPosition: 'right' })),
    mk('donut', 'Accounts by tier', 'Accounts by tier. Tier 1 is the largest segment.', 300,
      buildDonutOptions({ title: 'Accounts by tier', description: '', data: d.accountsByTier, size: 'fill', subtext: 'accounts', change: 4.2 })),
  ]
}

// Palette hex -> 6DS token CSS variable. Chart series colors are baked from tokens at build time, so when a token is
// edited in the token editor the options are re-colored from the live computed value before the chart is redrawn.
const HEX_TO_VAR = new Map<string, string>()
for (const steps of Object.values(USABLE)) for (const st of steps) HEX_TO_VAR.set(st.hex.toLowerCase(), '--' + st.token.replace(/\./g, '-'))
const css = getComputedStyle.bind(window)

function liveColor(hex: string): string {
  const v = HEX_TO_VAR.get(hex.toLowerCase())
  return (v && css(document.documentElement).getPropertyValue(v).trim()) || hex
}
function toRgb(c: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(c)
  if (m) { const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255] }
  const r = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(c)
  return r ? [+r[1], +r[2], +r[3]] : null
}
const RGB_TO_HEX = new Map<string, string>()
HEX_TO_VAR.forEach((_v, hex) => { const c = toRgb(hex); if (c) RGB_TO_HEX.set(c.join(','), hex) })

/** Deep copy of Highcharts options with every palette color (hex, or rgba made by withAlpha) swapped for its live token value. */
function recolor<T>(o: T): T {
  if (typeof o === 'string') {
    if (HEX_TO_VAR.has(o.toLowerCase())) return liveColor(o) as unknown as T
    const m = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(o)
    const hex = m && RGB_TO_HEX.get(`${m[1]},${m[2]},${m[3]}`)
    if (m && hex) { const c = toRgb(liveColor(hex)); if (c) return `rgba(${c.join(', ')}, ${m[4]})` as unknown as T }
    return o
  }
  if (Array.isArray(o)) return o.map(recolor) as unknown as T
  if (o && typeof o === 'object' && Object.getPrototypeOf(o) === Object.prototype) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o)) out[k] = recolor(v)
    return out as T
  }
  return o
}

type Chart = { destroy(): void; reflow(): void }
const live = new Map<string, Chart>()
const observed = new Set<string>()
let HC: HighchartsStatic | null = null

function draw(): void {
  if (!HC) return
  HC.setOptions(recolor(dbaTheme))
  for (const s of samples()) {
    const el = document.getElementById(`chart-${s.id}`)
    if (!el) continue
    live.get(s.id)?.destroy()
    const chart = HC.chart(
      el,
      HC.merge({ title: { text: s.title }, accessibility: { description: s.description } }, recolor(s.options), { chart: { height: null, width: null } }),
    ) as Chart
    live.set(s.id, chart)
    if (typeof ResizeObserver !== 'undefined' && !observed.has(s.id)) {
      observed.add(s.id)
      new ResizeObserver(() => live.get(s.id)?.reflow()).observe(el)
    }
  }
}

/**
 * Applies the DBA theme and renders every sample into `#chart-<id>` containers. Each container sets its own size in CSS
 * (the page makes them fill the screen); charts use `chart.height: null` so they take the container height, and a
 * ResizeObserver reflows them when the container or window changes size. Also mounts the header and token editor;
 * any token edit, theme or density change redraws the charts.
 */
export function renderAll(Highcharts: HighchartsStatic): void {
  HC = Highcharts
  draw()
}

/** Mounts the header and token editor. Safe to call before Highcharts has loaded; charts draw once it has. */
export function init(): void {
  mountEditor(draw)
}

export { samples }
