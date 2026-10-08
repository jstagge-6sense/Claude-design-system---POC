import { render, screen } from '@testing-library/react'
import {
  CATEGORICAL, USABLE, OTHER_COLOR, PRIMARY_HUE, categorical, contrast, maxSteps, ramp, readableOn, sequential, single, HUES,
  formatChange, formatValue, initDbaCharts, resetDbaCharts,
  buildAreaOptions, buildLineOptions, buildBarOptions, buildStackedGroupedOptions, buildDonutOptions, buildFunnelOptions, buildParetoOptions,
  AreaChart, DonutChart, ParetoChart, type HighchartsStatic,
} from './index'

const base = { title: 'T', description: 'D' }
const cats = ['Jan', 'Feb', 'Mar']

describe('palette (6DS tokens only)', () => {
  it('every usable step of every hue is at least 3:1 against white', () => {
    for (const h of HUES) USABLE[h].forEach((st) => expect(contrast('#ffffff', st.hex)).toBeGreaterThanOrEqual(3))
  })
  it('only uses 6DS color tokens', () => {
    for (const h of HUES) USABLE[h].forEach((st) => expect(st.token).toMatch(new RegExp(`^core\\.color\\.${h}\\.\\d{3}$`)))
  })
  it('sequential ramps run light to dark and pad with the darkest step beyond the usable steps', () => {
    const r = ramp('blue')
    expect(sequential(maxSteps('blue'), { hue: 'blue' })).toEqual(r)
    expect(sequential(2, { hue: 'blue' })).toEqual([r[0], r[r.length - 1]])
    expect(sequential(r.length + 2, { hue: 'blue' }).slice(-3).every((c) => c === r[r.length - 1])).toBe(true)
    expect(sequential(1)).toHaveLength(1)
  })
  it('uses the primary hue middle step for single color and 15 distinct categorical colors', () => {
    const r = ramp(PRIMARY_HUE)
    expect(single()).toBe(r[Math.floor((r.length - 1) / 2)])
    expect(CATEGORICAL).toHaveLength(15)
    expect(new Set(CATEGORICAL).size).toBe(15)
    expect(categorical(5)).toEqual(CATEGORICAL.slice(0, 5))
    expect(CATEGORICAL).not.toContain(OTHER_COLOR)
  })
  it('picks white or ink text by contrast', () => {
    expect(readableOn(ramp('teal').at(-1)!)).toBe('#ffffff')
    expect(readableOn('#ffffff')).not.toBe('#ffffff')
  })
})

describe('format', () => {
  it('formats counts, currency, compact and percent', () => {
    expect(formatValue(1234, { locale: 'en-US' })).toBe('1,234')
    expect(formatValue(2350000, { kind: 'currency', compact: true, locale: 'en-US' })).toBe('$2.4M')
    expect(formatValue(27, { kind: 'percent', locale: 'en-US' })).toBe('27%')
    expect(formatChange(12, 'en-US')).toBe('+12%')
    expect(formatChange(-4.5, 'en-US')).toBe('-4.5%')
  })
})

describe('option builders', () => {
  it('Area is a single-color areaspline by default, straight area when curved=false', () => {
    const a = buildAreaOptions({ ...base, categories: cats, values: [1, 2, 3], seriesName: 'S' })
    expect(a.chart?.type).toBe('areaspline')
    expect(buildAreaOptions({ ...base, categories: cats, values: [1], seriesName: 'S', curved: false }).chart?.type).toBe('area')
    expect(a.series).toHaveLength(1)
    expect(a.legend).toEqual({ enabled: false })
  })
  it('Line uses categorical colors and straight segments by default', () => {
    const l = buildLineOptions({ ...base, categories: cats, series: [{ name: 'A', data: [1, 2, 3] }, { name: 'B', data: [3, 2, 1] }, { name: 'Other', data: [1, 1, 1], other: true }] })
    expect(l.chart?.type).toBe('line')
    const colors = (l.series ?? []).map((s) => (s as { color: string }).color)
    expect(colors[0]).toBe(CATEGORICAL[0])
    expect(colors[1]).toBe(CATEGORICAL[1])
    expect(colors[2]).not.toBe(CATEGORICAL[2])
  })
  it('Bar is horizontal by default; sequential mode gives the largest value the darkest color', () => {
    const data = [{ name: 'a', value: 1 }, { name: 'b', value: 9 }, { name: 'c', value: 5 }]
    const b = buildBarOptions({ ...base, data, colorMode: 'sequential' })
    expect(b.chart?.type).toBe('bar')
    const pts = (b.series?.[0] as { data: { y: number; color: string }[] }).data
    expect(pts[1].color).toBe(sequential(3).reverse()[0])
    expect(buildBarOptions({ ...base, data, orientation: 'vertical' }).chart?.type).toBe('column')
  })
  it('Stacked/grouped maps mode to stacking', () => {
    const s = [{ name: 'A', data: [1, 2, 3] }]
    const st = (m: 'stacked' | 'percent' | 'grouped') => buildStackedGroupedOptions({ ...base, categories: cats, series: s, mode: m }).plotOptions?.series?.stacking
    expect(st('stacked')).toBe('normal')
    expect(st('percent')).toBe('percent')
    expect(st('grouped')).toBeUndefined()
  })
  it('bars round only their end, by 8px (stacks round the whole stack)', () => {
    const r = (o: any) => o.plotOptions.series?.borderRadius ?? o.plotOptions.column?.borderRadius
    expect(r(buildBarOptions({ ...base, data: [{ name: 'a', value: 1 }] }))).toEqual({ radius: 8, scope: 'point', where: 'end' })
    expect(r(buildParetoOptions({ ...base, data: [{ name: 'a', value: 3 }, { name: 'b', value: 1 }] }))).toEqual({ radius: 8, scope: 'point', where: 'end' })
    const st = buildStackedGroupedOptions({ ...base, categories: cats, series: [{ name: 's', data: [1, 2, 3] }] })
    expect(r(st)).toEqual({ radius: 8, scope: 'stack', where: 'end' })
    expect(r(buildStackedGroupedOptions({ ...base, categories: cats, series: [{ name: 's', data: [1, 2, 3] }], mode: 'grouped' }))).toEqual({ radius: 8, scope: 'point', where: 'end' })
  })

  it('Donut centers the total, and uses a 65% inner radius', () => {
    const d = buildDonutOptions({ ...base, data: [{ name: 'a', value: 30 }, { name: 'b', value: 70 }], subtext: 'accounts', change: 12, locale: 'en-US' })
    expect(d.plotOptions?.pie?.innerSize).toBe('65%')
    expect(String(d.subtitle?.text)).toContain('100')
    expect(String(d.subtitle?.text)).toContain('accounts')
    expect(String(d.subtitle?.text)).toContain('+12%')
  })
  it('Funnel colors stages light to dark; inside labels are readable (4.5:1) or moved outside', () => {
    const f = buildFunnelOptions({ ...base, stages: [{ name: 'a', value: 100 }, { name: 'b', value: 50 }, { name: 'c', value: 10 }] })
    const pts = (f.series?.[0] as { data: { color: string; dataLabels?: { inside: boolean; color: string } }[] }).data
    expect(pts.map((p) => p.color)).toEqual(sequential(3))
    pts.forEach((p) => {
      if (p.dataLabels!.inside) expect(contrast(p.color, p.dataLabels!.color)).toBeGreaterThanOrEqual(4.5)
      else expect(p.dataLabels!.color).toContain('var(--core-color-content-primary)')
    })
  })
  it('Pareto sorts descending and links the cumulative series to the columns', () => {
    const p = buildParetoOptions({ ...base, data: [{ name: 'a', value: 1 }, { name: 'b', value: 9 }, { name: 'c', value: 5 }] })
    const base0 = p.series?.[0] as { data: { name: string }[]; id: string }
    expect(base0.data.map((d) => d.name)).toEqual(['b', 'c', 'a'])
    expect((p.series?.[1] as { baseSeries: string }).baseSeries).toBe(base0.id)
  })
})

function fakeHighcharts() {
  const calls = { chart: [] as unknown[], update: 0, destroy: 0, setOptions: 0 }
  const deep = (a: any, b: any): any => {
    if (b === undefined) return a
    if (Array.isArray(b) || typeof b !== 'object' || b === null) return b
    const out = { ...(a ?? {}) }
    for (const k of Object.keys(b)) out[k] = deep(out[k], b[k])
    return out
  }
  const hc = {
    setOptions: () => { calls.setOptions++ },
    merge: (...o: unknown[]) => o.reduce((acc, x) => deep(acc, x), {}),
    chart: (_el: unknown, opts: unknown) => {
      calls.chart.push(opts)
      return { update: () => { calls.update++ }, destroy: () => { calls.destroy++ }, reflow: () => undefined }
    },
  }
  return { hc: hc as unknown as HighchartsStatic, calls }
}

describe('chart components', () => {
  beforeEach(() => resetDbaCharts())

  it('throws a helpful error when charts are not initialized', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => render(<AreaChart {...base} categories={cats} values={[1, 2, 3]} seriesName="S" />)).toThrow(/initDbaCharts/)
    spy.mockRestore()
  })

  it('creates the chart with title, description and shared options, and destroys it on unmount', () => {
    const { hc, calls } = fakeHighcharts()
    initDbaCharts(hc)
    const { unmount } = render(<AreaChart title="Engaged accounts" description="Engaged accounts rose each month." categories={cats} values={[1, 2, 3]} seriesName="Engaged" />)
    const opts = calls.chart[0] as { title: { text: string }; accessibility: { description: string }; chart: { type: string } }
    expect(opts.title.text).toBe('Engaged accounts')
    expect(opts.accessibility.description).toBe('Engaged accounts rose each month.')
    expect(opts.chart.type).toBe('areaspline')
    unmount()
    expect(calls.destroy).toBe(1)
  })

  it('shows loading, error and empty states without creating a chart', () => {
    const { hc, calls } = fakeHighcharts()
    initDbaCharts(hc)
    const { rerender } = render(<DonutChart {...base} data={[{ name: 'a', value: 1 }]} loading />)
    expect(screen.getByRole('status', { name: 'Loading T' })).toBeTruthy()
    rerender(<DonutChart {...base} data={[{ name: 'a', value: 1 }]} error />)
    expect(screen.getByRole('alert').textContent).toContain("couldn't load T")
    rerender(<ParetoChart {...base} data={[]} emptyMessage="Nothing yet." />)
    expect(screen.getByText('Nothing yet.')).toBeTruthy()
    expect(calls.chart).toHaveLength(0)
  })
})
