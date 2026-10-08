import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import { formatValue } from './format'
import type { ChartOptions } from './highcharts'
import { categorical, single, type Hue } from './palette'
import { barEndRadius, cartesianAxes, tooltipPoint, type AxisProps } from './presets'

/**
 * Pareto. Intent: find the few categories that account for most of the total. Story: ranking, part of a whole.
 * Sorted columns (largest first) plus a cumulative-percentage line on a 0 to 100% secondary axis.
 * Not in the DBA v1 chart list: built on the shared theme, palette and formatters (see README, "Beyond v1").
 * Requires the Highcharts `pareto` module.
 */
export interface ParetoDatum {
  name: string
  value: number
}

export interface ParetoChartProps extends DbaChartBaseProps, AxisProps {
  data: ParetoDatum[]
  /** Name of the column series. Default "Count". */
  seriesName?: string
  /** Name of the cumulative line. Default "Cumulative %". */
  cumulativeName?: string
  hue?: Hue
  /** Draws a reference line at this cumulative percent (for example 80). */
  threshold?: number
}

export function buildParetoOptions(p: ParetoChartProps): ChartOptions {
  const sorted = [...p.data].sort((a, b) => b.value - a.value)
  const lineColor = categorical(2)[1] // second categorical hue, so the line differs from the columns by hue and by shape
  return {
    chart: { type: 'column' },
    ...cartesianAxes(p, sorted.map((d) => d.name), p.locale),
    yAxis: [
      {
        title: { text: p.yTitle },
        gridLineWidth: p.gridLines === false ? 0 : 1,
        labels: { formatter: function (this: { value: number | string }) { return formatValue(Number(this.value), { ...p.valueFormat, compact: p.valueFormat?.compact ?? true, locale: p.locale }) } as never },
      },
      {
        title: { text: p.cumulativeName ?? 'Cumulative %' },
        opposite: true,
        min: 0,
        max: 100,
        tickInterval: 20,
        gridLineWidth: 0,
        labels: { format: '{value}%' },
        plotLines: p.threshold === undefined ? [] : [{ value: p.threshold, width: 1, dashStyle: 'Dash', zIndex: 4, color: 'var(--core-color-border-strong)' }],
      },
    ],
    legend: { enabled: true, align: 'left', verticalAlign: 'bottom' },
    tooltip: { shared: true },
    plotOptions: { column: { pointPadding: 0.1, groupPadding: 0, borderRadius: barEndRadius() } },
    series: [
      {
        type: 'column',
        id: 'pareto-base',
        name: p.seriesName ?? 'Count',
        data: sorted.map((d) => ({ name: d.name, y: d.value })),
        color: single(p.hue),
        yAxis: 0,
        zIndex: 2,
        tooltip: { pointFormatter: tooltipPoint(p.valueFormat, p.locale) as never },
      },
      {
        type: 'pareto',
        name: p.cumulativeName ?? 'Cumulative %',
        baseSeries: 'pareto-base',
        yAxis: 1,
        zIndex: 3,
        color: lineColor,
        marker: { enabled: true, symbol: 'diamond', radius: 4 }, // shape, not only color, marks the line
        tooltip: { valueDecimals: 1, valueSuffix: '%' },
      },
    ] as ChartOptions['series'],
  }
}

export const ParetoChart = forwardRef<HTMLElement, ParetoChartProps>(function ParetoChart(props, ref) {
  const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildParetoOptions(props), [props.data, props.seriesName, props.cumulativeName, props.hue, props.threshold, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.data.length === 0} />
})
