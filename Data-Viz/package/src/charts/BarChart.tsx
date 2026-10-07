import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import type { ChartOptions } from './highcharts'
import { categorical, sequential, single, type Hue } from './palette'
import { barEndRadius, barPadding, cartesianAxes, tooltipPoint, type AxisProps, type BarSpacing, type ColorMode } from './presets'

/**
 * Bar graph (single series). Intent: view the size of each item within a group. Story: change over time, ranking.
 * Color: single, sequential or categorical. Horizontal bars by default; `orientation="vertical"` draws columns.
 */
export interface BarDatum {
  name: string
  value: number
}

export interface BarChartProps extends DbaChartBaseProps, AxisProps {
  data: BarDatum[]
  seriesName?: string
  orientation?: 'horizontal' | 'vertical'
  /** `single` (one color), `sequential` (ramp by rank, light to dark), `categorical` (one hue per bar). Default single. */
  colorMode?: ColorMode
  hue?: Hue
  /** Space between bars in px. Default 12. Approximated from the chart height and bar count. */
  spacing?: BarSpacing
  /** Show value labels on the bars. Default true. */
  showValues?: boolean
}

const PLOT_CHROME = 96 // axis, title and spacing allowance when estimating the plot height

export function buildBarOptions(p: BarChartProps): ChartOptions {
  const mode = p.colorMode ?? 'single'
  const n = p.data.length
  const colors = mode === 'single' ? p.data.map(() => single(p.hue)) : mode === 'sequential' ? sequential(n, { hue: p.hue }).reverse() : categorical(n)
  // sequential: largest value gets the darkest color. Colors are assigned by rank, then mapped back to input order.
  const ranked = [...p.data.keys()].sort((a, b) => p.data[b].value - p.data[a].value)
  const byIndex = new Array<string>(n)
  if (mode === 'sequential') ranked.forEach((idx, rank) => (byIndex[idx] = colors[rank]))
  const heightPx = typeof p.height === 'number' ? p.height : 320
  return {
    chart: { type: p.orientation === 'vertical' ? 'column' : 'bar' },
    ...cartesianAxes(p, p.data.map((d) => d.name), p.locale),
    legend: { enabled: false },
    tooltip: { formatter: tooltipPoint(p.valueFormat, p.locale) as never },
    plotOptions: {
      series: { groupPadding: 0, pointPadding: barPadding(p.spacing ?? 12, Math.max(1, heightPx - PLOT_CHROME), n), borderRadius: barEndRadius() },
    },
    series: [
      {
        type: p.orientation === 'vertical' ? 'column' : 'bar',
        name: p.seriesName ?? 'Value',
        colorByPoint: mode !== 'single',
        color: single(p.hue),
        data: p.data.map((d, i) => ({ name: d.name, y: d.value, color: mode === 'sequential' ? byIndex[i] : mode === 'categorical' ? colors[i] : undefined })),
        dataLabels: p.showValues === false ? { enabled: false } : { enabled: true },
      },
    ],
  }
}

export const BarChart = forwardRef<HTMLElement, BarChartProps>(function BarChart(props, ref) {
  const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildBarOptions(props), [props.data, props.seriesName, props.orientation, props.colorMode, props.hue, props.spacing, props.showValues, props.height, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.data.length === 0} />
})
