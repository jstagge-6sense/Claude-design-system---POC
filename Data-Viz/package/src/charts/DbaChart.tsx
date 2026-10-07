import { forwardRef, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import type Highcharts from 'highcharts'
import { cx } from '../primitives/cx'
import { getHighcharts, type ChartOptions } from './highcharts'
import styles from './Charts.module.css'

/** Props shared by every DBA chart. */
export interface DbaChartBaseProps {
  /** Chart title. Required: a chart without a title is not shown. */
  title: string
  /** Text alternative read by screen readers: what the chart shows and the main takeaway. Required (WCAG). */
  description: string
  subtitle?: string
  /**
   * Chart height: a number (px) for a fixed height, or any CSS length ('60vh', '100%') to fill that space. With '100%' the
   * parent must have a height. Width is always 100% of the parent and the chart reflows when the parent resizes. Default 320.
   */
  height?: number | string
  /** Shows a loading placeholder. */
  loading?: boolean
  /** Shows an error message instead of the chart. Pass a string for a specific message. */
  error?: boolean | string
  /** Shown when there is no data. */
  emptyMessage?: ReactNode
  /** BCP 47 locale for number formatting. */
  locale?: string
  className?: string
  style?: CSSProperties
  /**
   * Escape hatch merged last into the Highcharts options. Using it means the chart deviates from the DBA
   * framework: flag the need to the DBA team instead of leaving one-off code in a product.
   */
  highchartsOptions?: ChartOptions
}

export interface DbaChartProps extends Pick<DbaChartBaseProps, 'title' | 'description' | 'subtitle' | 'height' | 'loading' | 'error' | 'emptyMessage' | 'className' | 'style' | 'highchartsOptions'> {
  /** Chart-type options built by a preset. */
  options: ChartOptions
  /** True when there is no data to plot. */
  isEmpty?: boolean
}

/**
 * Base renderer for every DBA chart. Merges title, description and height into the preset options, creates the
 * Highcharts chart, updates it when options change, reflows on container resize and destroys it on unmount.
 */
export const DbaChart = forwardRef<HTMLElement, DbaChartProps>(function DbaChart(
  { options, title, description, subtitle, height = 320, loading, error, emptyMessage = 'No data to show.', isEmpty, className, style, highchartsOptions },
  ref,
) {
  const host = useRef<HTMLDivElement>(null)
  const chart = useRef<Highcharts.Chart | null>(null)
  const state: 'loading' | 'error' | 'empty' | 'ready' = loading ? 'loading' : error ? 'error' : isEmpty ? 'empty' : 'ready'

  useEffect(() => {
    if (state !== 'ready' || !host.current) return
    const hc = getHighcharts()
    const full: ChartOptions = hc.merge(
      {
        title: { text: title },
        subtitle: { text: subtitle },
        accessibility: { description },
        // a number fixes the height; anything else (CSS length) makes the chart fill its container (chart.height: null)
        chart: { height: typeof height === 'number' ? height : null },
      },
      options,
      highchartsOptions ?? {},
    )
    if (chart.current) chart.current.update(full, true, true)
    else chart.current = hc.chart(host.current, full)
  }, [state, options, title, subtitle, description, height, highchartsOptions])

  useEffect(() => {
    if (state !== 'ready' || !host.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => chart.current?.reflow())
    ro.observe(host.current)
    return () => ro.disconnect()
  }, [state])

  useEffect(() => {
    if (state !== 'ready' && chart.current) {
      chart.current.destroy()
      chart.current = null
    }
  }, [state])

  useEffect(
    () => () => {
      chart.current?.destroy()
      chart.current = null
    },
    [],
  )

  const message = state === 'error' ? (typeof error === 'string' ? error : `We couldn't load ${title}. Try again.`) : state === 'empty' ? emptyMessage : null
  const cssHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <figure ref={ref} className={cx(styles.root, className)} style={{ ...style, ['--_chart-height' as string]: cssHeight }} data-state={state} data-fill={typeof height === 'number' ? undefined : ''} aria-busy={state === 'loading' || undefined}>
      {state === 'ready' ? (
        <div ref={host} className={styles.host} style={typeof height === 'number' ? undefined : { height: cssHeight }} />
      ) : state === 'loading' ? (
        <div className={styles.placeholder} role="status" aria-label={`Loading ${title}`}>
          <span className={styles.shimmer} aria-hidden="true" />
        </div>
      ) : (
        <div className={styles.placeholder} role={state === 'error' ? 'alert' : undefined}>
          <span className={styles.heading}>{title}</span>
          <span>{message}</span>
        </div>
      )}
    </figure>
  )
})
