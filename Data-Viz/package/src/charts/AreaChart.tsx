import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import type { ChartOptions } from './highcharts'
import { single, withAlpha, type Hue } from './palette'
import { cartesianAxes, tooltipPoint, type AxisProps } from './presets'

/**
 * Area (spline). Intent: understand change over time of a single item. Story: time. Color: single only (gradient).
 * Curved by default (trend stories); set `curved={false}` for a straight-segment area.
 */
export interface AreaChartProps extends DbaChartBaseProps, AxisProps {
  categories: string[]
  values: number[]
  /** Series name shown in the tooltip and to screen readers. */
  seriesName: string
  /** Curved (areaspline, trend stories) or straight (area). Default true. */
  curved?: boolean
  /** Single hue. Default blue (primary). */
  hue?: Hue
}

export function buildAreaOptions(p: AreaChartProps): ChartOptions {
  const color = single(p.hue)
  return {
    chart: { type: p.curved === false ? 'area' : 'areaspline' },
    ...cartesianAxes(p, p.categories, p.locale),
    legend: { enabled: false },
    tooltip: { formatter: tooltipPoint(p.valueFormat, p.locale) as never },
    plotOptions: {
      area: { marker: { enabled: false } },
      areaspline: { marker: { enabled: false } },
      series: { lineWidth: 2 },
    },
    series: [
      {
        type: p.curved === false ? 'area' : 'areaspline',
        name: p.seriesName,
        data: p.values,
        color,
        fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, withAlpha(color, 0.4)], [1, withAlpha(color, 0.04)]] },
      },
    ],
  }
}

export const AreaChart = forwardRef<HTMLElement, AreaChartProps>(function AreaChart(props, ref) {
  const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildAreaOptions(props), [props.categories, props.values, props.seriesName, props.curved, props.hue, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.values.length === 0} />
})
