import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import type { ChartOptions } from './highcharts'
import { CATEGORICAL, OTHER_COLOR } from './palette'
import { cartesianAxes, legendFor, tooltipPoint, type AxisProps, type LegendPosition } from './presets'

/**
 * Line graph. Intent: understand change over time of a group of items. Story: time. Color: categorical only.
 * Straight segments by default (detailed stories); `curved` for trend stories. Markers appear on hover.
 */
export interface LineSeries {
  name: string
  data: number[]
  /** Marks the series as the "Other" bucket: drawn in gray. */
  other?: boolean
}

export interface LineChartProps extends DbaChartBaseProps, AxisProps {
  categories: string[]
  series: LineSeries[]
  curved?: boolean
  legendPosition?: LegendPosition
}

export function buildLineOptions(p: LineChartProps): ChartOptions {
  let i = 0
  return {
    chart: { type: p.curved ? 'spline' : 'line' },
    ...cartesianAxes(p, p.categories, p.locale),
    legend: legendFor(p.legendPosition),
    tooltip: { shared: true, pointFormatter: tooltipPoint(p.valueFormat, p.locale) as never },
    plotOptions: { series: { lineWidth: 2, marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } } } },
    series: p.series.map((s) => ({
      type: p.curved ? ('spline' as const) : ('line' as const),
      name: s.name,
      data: s.data,
      color: s.other ? OTHER_COLOR : CATEGORICAL[i++ % CATEGORICAL.length],
    })),
  }
}

export const LineChart = forwardRef<HTMLElement, LineChartProps>(function LineChart(props, ref) {
  const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildLineOptions(props), [props.categories, props.series, props.curved, props.legendPosition, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.series.length === 0 || props.categories.length === 0} />
})
