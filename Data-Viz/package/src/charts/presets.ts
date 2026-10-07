import type Highcharts from 'highcharts'
import { formatValue, type ValueFormat } from './format'
import type { ChartOptions } from './highcharts'

/** Shared building blocks for the chart presets. Charts compose these; products never copy option blocks between charts. */

export type LegendPosition = 'bottom' | 'right' | 'none'
export type BarSpacing = 4 | 8 | 12 | 16 | 18 | 20 | 24
export type ColorMode = 'single' | 'sequential' | 'categorical'

export interface AxisProps {
  xTitle?: string
  yTitle?: string
  /** Show every Nth x label (2 shows every other). */
  labelStep?: number
  /** Show horizontal grid lines. Default true. */
  gridLines?: boolean
  /** Y value format (prefix/suffix, K/M/B). */
  valueFormat?: ValueFormat
}

export function valueLabel(fmt: ValueFormat | undefined, locale?: string) {
  return function (this: { value: number | string }): string {
    return formatValue(Number(this.value), { ...fmt, locale: fmt?.locale ?? locale })
  }
}

export function tooltipPoint(fmt: ValueFormat | undefined, locale?: string) {
  return function (this: { y?: number | null; series: { name: string }; key?: string | number; color?: unknown; point?: { name?: string } }): string {
    const y = formatValue(Number(this.y ?? 0), { ...fmt, locale: fmt?.locale ?? locale })
    const name = this.point?.name ?? this.key ?? ''
    return `<span>${name ? `${name}: ` : ''}<b>${y}</b></span><br/><span>${this.series.name}</span>`
  }
}

export function legendFor(position: LegendPosition = 'bottom'): ChartOptions['legend'] {
  if (position === 'none') return { enabled: false }
  return position === 'right'
    ? { enabled: true, align: 'right', verticalAlign: 'middle', layout: 'vertical' }
    : { enabled: true, align: 'left', verticalAlign: 'bottom', layout: 'horizontal' }
}

/** Category x axis and numeric y axis with DBA labels, titles, steps and grid lines. */
export function cartesianAxes(p: AxisProps, categories: string[], locale?: string): Pick<ChartOptions, 'xAxis' | 'yAxis'> {
  return {
    xAxis: {
      categories,
      title: { text: p.xTitle },
      labels: { step: p.labelStep, overflow: 'justify', style: { textOverflow: 'ellipsis' } },
      crosshair: true,
    },
    yAxis: {
      title: { text: p.yTitle },
      gridLineWidth: p.gridLines === false ? 0 : 1,
      labels: { formatter: valueLabel(p.valueFormat, locale) as Highcharts.AxisLabelsFormatterCallbackFunction },
    },
  }
}

/** Bar series spacing (px between bars) mapped to Highcharts pointPadding, from the plot height and bar count. */
/**
 * Rounded end of bars and columns: 8px, on the end (value side) only, so the baseline stays flat.
 * GAP: 6DS has no 8px radius token (--core-dimension-radius-200 is 0.5rem but is a surface radius, not a data-viz one),
 * so this is a constant. Replace it with a token when 6DS adds one.
 */
export const BAR_END_RADIUS = 8
export function barEndRadius(scope: 'point' | 'stack' = 'point') {
  return { radius: BAR_END_RADIUS, scope, where: 'end' } as const
}

export function barPadding(spacing: BarSpacing, plotSize: number, count: number): number {
  const slot = Math.max(1, plotSize / Math.max(1, count))
  return Math.min(0.45, spacing / 2 / slot)
}
