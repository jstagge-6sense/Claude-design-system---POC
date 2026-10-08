import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import { formatChange, formatValue, type ValueFormat } from './format'
import type { ChartOptions } from './highcharts'
import { OTHER_COLOR, categorical } from './palette'
import { legendFor, type LegendPosition } from './presets'

/**
 * Donut. Intent: understand how items combine to make a whole. Story: part of a whole, relationship.
 * Color: categorical. 2 to 10 segments. The total metric (value, subtext, change) sits in the center.
 */
export interface DonutDatum {
  name: string
  value: number
  /** Marks the segment as the "Other" bucket: drawn in gray. */
  other?: boolean
}

export type DonutSize = 100 | 200 | 300 | 400 | 500

export interface DonutChartProps extends Omit<DbaChartBaseProps, 'height' | 'subtitle'> {
  data: DonutDatum[]
  /** Chart size in px (square), or 'fill' to take the full width and height of the parent. Default 300. */
  size?: DonutSize | 'fill'
  /** Center total. Defaults to the sum of the segments. */
  total?: number
  valueFormat?: ValueFormat
  /** Text under the total, for example "accounts". */
  subtext?: string
  /** % change vs the previous period, shown under the total (12 means +12%). */
  change?: number
  legendPosition?: Exclude<LegendPosition, 'none'> | 'none'
}

export function buildDonutOptions(p: DonutChartProps): ChartOptions {
  const size = p.size ?? 300
  const sum = p.data.reduce((a, d) => a + d.value, 0)
  const total = p.total ?? sum
  const fmt = { ...p.valueFormat, compact: p.valueFormat?.compact ?? true, locale: p.valueFormat?.locale ?? p.locale }
  const pool = categorical(p.data.filter((d) => !d.other).length)
  let i = 0
  const parts = [formatValue(total, fmt), p.subtext, p.change !== undefined ? formatChange(p.change, p.locale) : undefined].filter(Boolean)
  return {
    chart: typeof size === 'number' ? { type: 'pie', height: size, width: p.legendPosition === 'right' ? undefined : size } : { type: 'pie', height: null },
    // Center metric: the subtitle floats in the middle of the donut, so the real title stays top-left.
    subtitle: { align: 'center', verticalAlign: 'middle', floating: true, y: 24, text: parts.join('<br/>'), style: { textAlign: 'center' } },
    legend: legendFor(p.legendPosition ?? 'right'),
    tooltip: {
      pointFormatter: function (this: { y?: number | null; percentage?: number }) {
        return `<b>${formatValue(Number(this.y ?? 0), fmt)}</b> (${formatValue(this.percentage ?? 0, { kind: 'percent' })})`
      } as never,
    },
    plotOptions: {
      pie: {
        innerSize: '65%',
        showInLegend: true,
        dataLabels: { enabled: false },
        borderWidth: 2,
        borderColor: 'var(--core-color-surface-control-default)', // separator between segments, not color alone
        center: ['50%', '50%'],
      },
    },
    series: [
      {
        type: 'pie',
        name: p.title,
        data: p.data.map((d) => ({ name: d.name, y: d.value, color: d.other ? OTHER_COLOR : pool[i++ % pool.length] })),
      },
    ],
  }
}

export const DonutChart = forwardRef<HTMLElement, DonutChartProps>(function DonutChart(props, ref) {
  const { title, description, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildDonutOptions(props), [props.data, props.size, props.total, props.valueFormat, props.subtext, props.change, props.legendPosition, props.title, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, height: props.size === 'fill' ? '100%' : (props.size ?? 300), loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.data.length === 0 || props.data.every((d) => d.value === 0)} />
})
