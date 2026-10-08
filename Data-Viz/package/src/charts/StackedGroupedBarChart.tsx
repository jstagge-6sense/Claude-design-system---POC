import { forwardRef, useMemo } from 'react'
import { DbaChart, type DbaChartBaseProps } from './DbaChart'
import type { ChartOptions } from './highcharts'
import { OTHER_COLOR, categorical, sequential, type Hue } from './palette'
import { barEndRadius, barPadding, cartesianAxes, legendFor, tooltipPoint, type AxisProps, type BarSpacing, type LegendPosition } from './presets'

/**
 * Bar graph (stacked and grouped). Intent: view the size of each item within a subgroup and how subgroups compare.
 * Story: change over time, comparison, part of a whole, ranking, relationship. Color: single or categorical.
 */
export interface StackSeries {
  name: string
  data: number[]
  /** Marks the series as the "Other" bucket: drawn in gray. */
  other?: boolean
}

export interface StackedGroupedBarChartProps extends DbaChartBaseProps, AxisProps {
  categories: string[]
  series: StackSeries[]
  /** `stacked` (totals), `percent` (100% stacked) or `grouped` (side by side). Default stacked. */
  mode?: 'stacked' | 'percent' | 'grouped'
  orientation?: 'horizontal' | 'vertical'
  /** `categorical` (one hue per series) or `single` (one hue, steps by series). Default categorical. */
  colorMode?: 'single' | 'categorical'
  hue?: Hue
  spacing?: BarSpacing
  legendPosition?: LegendPosition
}

const PLOT_CHROME = 120

export function buildStackedGroupedOptions(p: StackedGroupedBarChartProps): ChartOptions {
  const mode = p.mode ?? 'stacked'
  const names = p.series.filter((s) => !s.other).length
  const pool = p.colorMode === 'single' ? sequential(Math.max(1, names), { hue: p.hue }) : categorical(names)
  let i = 0
  const heightPx = typeof p.height === 'number' ? p.height : 320
  const stacking = mode === 'grouped' ? undefined : mode === 'percent' ? 'percent' : 'normal'
  return {
    chart: { type: p.orientation === 'vertical' ? 'column' : 'bar' },
    ...cartesianAxes(p, p.categories, p.locale),
    legend: legendFor(p.legendPosition),
    tooltip: { shared: false, pointFormatter: tooltipPoint(p.valueFormat, p.locale) as never },
    plotOptions: {
      series: {
        stacking,
        borderRadius: barEndRadius(stacking ? 'stack' : 'point'), // 8px at the end of the bar or of the whole stack
        groupPadding: 0.1,
        pointPadding: mode === 'grouped' ? 0.05 : barPadding(p.spacing ?? 12, Math.max(1, heightPx - PLOT_CHROME), p.categories.length),
        borderWidth: stacking ? 1 : 0, // thin separator between stacked segments (outline helps non-color distinction)
        borderColor: 'var(--core-color-surface-control-default)',
      },
    },
    series: p.series.map((s) => ({
      type: p.orientation === 'vertical' ? ('column' as const) : ('bar' as const),
      name: s.name,
      data: s.data,
      color: s.other ? OTHER_COLOR : pool[i++ % pool.length],
    })),
  }
}

export const StackedGroupedBarChart = forwardRef<HTMLElement, StackedGroupedBarChartProps>(function StackedGroupedBarChart(props, ref) {
  const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props
  const options = useMemo(() => buildStackedGroupedOptions(props), [props.categories, props.series, props.mode, props.orientation, props.colorMode, props.hue, props.spacing, props.legendPosition, props.height, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]) // eslint-disable-line react-hooks/exhaustive-deps
  return <DbaChart ref={ref} {...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }} options={options} isEmpty={props.series.length === 0 || props.categories.length === 0} />
})
