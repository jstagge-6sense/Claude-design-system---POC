import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import { formatValue, type ValueFormat } from './format'
import type { ChartOptions } from './highcharts'
import { contrast, readableOn, sequential, type Hue } from './palette'

/**
 * Funnel. Intent: understand the flow of users through a predefined process. Story: flow, relationship.
 * Color: sequential (light to dark by stage). 3 to 6 stages recommended, more allowed.
 * Requires the Highcharts `funnel` module.
 */
export interface FunnelStage {
  name: string
  value: number
}

export interface FunnelChartProps extends DbaChartBaseProps {
  stages: FunnelStage[]
  hue?: Hue
  valueFormat?: ValueFormat
  /** `inside` writes name and count in the block (text color chosen for contrast); `outside` puts labels beside the funnel. Default inside. */
  labels?: 'inside' | 'outside'
  /** Show the conversion rate from the previous stage in the tooltip. Default true. */
  showConversion?: boolean
}

export function buildFunnelOptions(p: FunnelChartProps): ChartOptions {
  const n = p.stages.length
  const colors = sequential(n, { hue: p.hue })
  const fmt = { ...p.valueFormat, compact: p.valueFormat?.compact ?? true, locale: p.valueFormat?.locale ?? p.locale }
  const inside = (p.labels ?? 'inside') === 'inside'
  const stages = p.stages
  const conversion = p.showConversion !== false
  return {
    chart: { type: 'funnel' },
    legend: { enabled: false },
    tooltip: {
      pointFormatter: function (this: { x?: number; y?: number | null; index?: number }) {
        const i = this.index ?? 0
        const base = `<b>${formatValue(Number(this.y ?? 0), fmt)}</b>`
        if (!conversion || i === 0 || !stages[i - 1].value) return base
        return `${base} (${formatValue(((this.y ?? 0) / stages[i - 1].value) * 100, { kind: 'percent' })} of previous stage)`
      } as never,
    },
    plotOptions: {
      series: {
        borderWidth: 1,
        borderColor: 'var(--core-color-surface-control-default)',
        neckWidth: '30%',
        neckHeight: '0%',
        width: inside ? '90%' : '60%',
        dataLabels: {
          enabled: true,
          inside,
          format: '{point.name}<br/><b>{point.custom.display}</b>',
          style: { textOutline: 'none' },
        },
      },
    },
    series: [
      {
        type: 'funnel',
        name: p.title,
        data: p.stages.map((s, i) => ({
          name: s.name,
          y: s.value,
          color: colors[i],
          custom: { display: formatValue(s.value, fmt) },
          // Inside labels take white or ink, whichever has higher contrast, but only when that reaches 4.5:1 on the step.
          // Lighter steps that cannot hold readable text move their label outside the block.
          dataLabels: inside ? (contrast(readableOn(colors[i]), colors[i]) >= 4.5 ? { inside: true, color: readableOn(colors[i]) } : { inside: false, color: 'var(--core-color-content-primary)' }) : undefined,
        })),
      },
    ],
  }
}

export const FunnelChart = forwardRef<HTMLElement, FunnelChartProps>(function FunnelChart(props, ref) {
  const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildFunnelOptions(props), [props.stages, props.hue, props.valueFormat, props.labels, props.showConversion, props.title, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.stages.length === 0} />
})
