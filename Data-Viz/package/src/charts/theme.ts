import type Highcharts from 'highcharts'
import { CATEGORICAL } from './palette'

/**
 * The global DBA Highcharts theme. Applied once by `initDbaCharts`. Chart presets and chart instances only add to it.
 *
 * Series colors come from palette.ts (6DS color tokens only). No Highcharts default color is left in play: every color
 * option Highcharts would otherwise default (text, axes, markers, borders, crosshair, hidden legend items, no-data) is set below. Everything else (text, borders, surfaces, type)
 * uses 6DS semantic tokens as CSS variables, which Highcharts 12.2+ accepts in color and style options.
 * Light mode only. No raw hex here.
 */

const text = (style: 'label-1' | 'label-2' | 'help-1' | 'paragraph-2' | 'heading-3') => ({
  fontFamily: `var(--core-typography-${style}-font-family)`,
  fontSize: `var(--core-typography-${style}-font-size)`,
  fontWeight: `var(--core-typography-${style}-font-weight)`,
})

const PRIMARY = 'var(--core-color-content-primary)'
const SECONDARY = 'var(--core-color-content-secondary)'
const BORDER = 'var(--core-color-border-standard)'
const SURFACE = 'var(--core-color-surface-control-default)'
const DISABLED = 'var(--core-color-content-disabled)'
const FOCUS = 'var(--core-color-border-focus)'

export const dbaTheme: Highcharts.Options = {
  colors: [...CATEGORICAL],
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: 'var(--core-typography-label-1-font-family)' },
    spacing: [16, 16, 16, 16],
  },
  title: { align: 'left', style: { color: PRIMARY, ...text('heading-3') } },
  subtitle: { align: 'left', style: { color: SECONDARY, ...text('help-1') } },
  credits: { enabled: false },
  exporting: { enabled: false },
  accessibility: {
    enabled: true,
    keyboardNavigation: { enabled: true },
  },
  legend: {
    itemStyle: { color: PRIMARY, ...text('label-1') },
    itemHoverStyle: { color: PRIMARY },
    itemHiddenStyle: { color: DISABLED },
    navigation: { activeColor: FOCUS, inactiveColor: DISABLED, style: { color: PRIMARY } },
    symbolRadius: 2,
  },
  tooltip: {
    // Fill, stroke and radius are set in Charts.module.css via .highcharts-tooltip-box (surface and border tokens).
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    shadow: false,
    style: { color: PRIMARY, ...text('label-1') },
  },
  xAxis: {
    lineColor: BORDER,
    tickColor: BORDER,
    gridLineColor: BORDER, // faded to the documented 16% border alpha in Charts.module.css
    labels: { style: { color: SECONDARY, ...text('help-1') } },
    title: { style: { color: SECONDARY, ...text('label-2') } },
    crosshair: { color: BORDER },
    minorGridLineColor: BORDER,
    minorTickColor: BORDER,
  },
  yAxis: {
    lineColor: BORDER,
    tickColor: BORDER,
    gridLineColor: BORDER,
    gridLineWidth: 1,
    labels: { style: { color: SECONDARY, ...text('help-1') } },
    title: { style: { color: SECONDARY, ...text('label-2') } },
  },
  // Small containers: legend moves below, axis titles drop, x labels stay readable. Rules follow the chart container, not the window.
  responsive: {
    rules: [
      {
        condition: { maxWidth: 520 },
        chartOptions: {
          chart: { spacing: [8, 8, 8, 8] },
          legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
          xAxis: { title: { text: undefined }, labels: { step: undefined, autoRotation: [-45] } },
          yAxis: { title: { text: undefined } },
        },
      },
    ],
  },
  noData: { style: { color: SECONDARY, ...text('label-1') } },
  plotOptions: {
    series: {
      borderWidth: 0,
      marker: { lineColor: SURFACE },
      dataLabels: { style: { color: PRIMARY, textOutline: 'none', fontWeight: 'var(--core-typography-label-2-font-weight)' } },
      states: { inactive: { opacity: 0.4 } },
    },
  },
}
