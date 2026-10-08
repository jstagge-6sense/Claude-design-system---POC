// Storybook and preview setup: register Highcharts, the modules the DBA charts need, and the DBA theme.
// Apps do the same once at startup. Requires `highcharts` (12.2+) to be installed.
import Highcharts from 'highcharts'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/funnel'
import 'highcharts/modules/pareto'
import 'highcharts/modules/pattern-fill'
import { initDbaCharts } from './highcharts'

let done = false
export function setupCharts(): void {
  if (done) return
  initDbaCharts(Highcharts)
  done = true
}
