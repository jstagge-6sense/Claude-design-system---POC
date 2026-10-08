import type Highcharts from 'highcharts'
import { dbaTheme } from './theme'

export type HighchartsStatic = typeof Highcharts
export type ChartOptions = Highcharts.Options

let hc: HighchartsStatic | null = null

/**
 * Register the app's Highcharts instance and apply the DBA theme globally. Call once at startup, after importing
 * the Highcharts modules the charts need:
 *
 *   import Highcharts from 'highcharts'
 *   import 'highcharts/modules/accessibility'   // required for every chart
 *   import 'highcharts/modules/funnel'          // FunnelChart
 *   import 'highcharts/modules/pareto'          // ParetoChart
 *   import 'highcharts/modules/pattern-fill'    // optional, pattern fills for color-blind safe categories
 *   initDbaCharts(Highcharts)
 *
 * Highcharts is a peer dependency so the app controls version and license. Highcharts 12.2+ is required
 * (CSS variables in color options).
 */
export function initDbaCharts(highcharts: HighchartsStatic): void {
  hc = highcharts
  const reduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  highcharts.setOptions(highcharts.merge(dbaTheme, reduce ? { plotOptions: { series: { animation: false } }, chart: { animation: false } } : {}))
}

export function getHighcharts(): HighchartsStatic {
  if (!hc) throw new Error('DBA charts are not initialized. Import Highcharts and call initDbaCharts(Highcharts) once at startup.')
  return hc
}

/** Test seam. */
export function resetDbaCharts(): void {
  hc = null
}
