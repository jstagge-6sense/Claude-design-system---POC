import { forwardRef, useId, useMemo, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { SkeletonBlock, SkeletonLoader } from '../SkeletonLoader'
import styles from './DataMetric.module.css'

export type TrendDirection = 'up' | 'down' | 'neutral'
export type TrendTone = 'positive' | 'negative' | 'neutral'

export interface DataMetricTrendLabels {
  up: string
  down: string
  neutral: string
  /** Appended (visually hidden) when `trendTone` is set explicitly, so sentiment is never color alone. */
  favorable: string
  unfavorable: string
}
const DEFAULT_LABELS: DataMetricTrendLabels = { up: 'Up', down: 'Down', neutral: 'No change', favorable: 'favorable', unfavorable: 'unfavorable' }

export interface DataMetricProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the metric measures. Required: a metric without a label is not shown. */
  label: ReactNode
  /** Plain-text label for the loading and error announcements. Defaults to `label` when it is a string. */
  labelText?: string
  /** Raw value. Numbers are formatted with Intl.NumberFormat, strings are shown as-is. */
  value?: number | string
  /** BCP 47 locale for number formatting. Defaults to the runtime locale. */
  locale?: string
  /** Intl.NumberFormat options, for example `{ style: 'currency', currency: 'USD', notation: 'compact' }`. */
  format?: Intl.NumberFormatOptions
  /** Pre-formatted value that replaces the formatted `value`. */
  formattedValue?: ReactNode
  /** Direction of change. Shown as an icon and as text. */
  trend?: TrendDirection
  /** Size of the change as a percentage, for example 12 for 12%. Sign is ignored: use `trend` for direction. */
  trendValue?: number
  /** Whether the change is good or bad for this metric (churn going down is positive). Defaults from `trend`. */
  trendTone?: TrendTone
  /** Comparison context such as "vs last period" or "vs target of 1,500". */
  comparison?: ReactNode
  /** Numeric series for the inline sparkline. Needs at least two points. */
  sparkline?: number[]
  /** Text alternative for the sparkline. A summary is generated when omitted. */
  sparklineLabel?: string
  /** Dense layout for dashboards. */
  size?: 'default' | 'compact'
  /** Replaces content with a skeleton that matches the layout. */
  loading?: boolean
  /** Error state. Pass a string for a specific message. */
  error?: boolean | string
  /** Shows a Retry button in the error state. */
  onRetry?: () => void
  /** Announce value and trend changes politely (real-time metrics). */
  live?: boolean
  /** Localized words for trend text. */
  trendLabels?: Partial<DataMetricTrendLabels>
}

const SPARK_W = 96
const SPARK_H = 32
const PAD = 2

function sparkPoints(data: number[]): string {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  return data
    .map((d, i) => {
      const x = PAD + (i / (data.length - 1)) * (SPARK_W - PAD * 2)
      const y = SPARK_H - PAD - ((d - min) / span) * (SPARK_H - PAD * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export const DataMetric = forwardRef<HTMLDivElement, DataMetricProps>(function DataMetric(
  {
    label, labelText, value, locale, format, formattedValue, trend, trendValue, trendTone, comparison, sparkline,
    sparklineLabel, size = 'default', loading = false, error = false, onRetry, live = false, trendLabels, className, ...rest
  },
  ref,
) {
  const uid = useId()
  const labelId = `${uid}-label`
  const valueId = `${uid}-value`
  const trendId = `${uid}-trend`
  const words = { ...DEFAULT_LABELS, ...trendLabels }
  const plainLabel = labelText ?? (typeof label === 'string' ? label : 'metric')

  const nf = useMemo(() => new Intl.NumberFormat(locale, format), [locale, format])
  const pf = useMemo(() => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }), [locale])
  const shown: ReactNode = formattedValue ?? (typeof value === 'number' ? nf.format(value) : value)

  const tone: TrendTone = trendTone ?? (trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral')
  const trendText = trend
    ? [words[trend], trendValue != null && trend !== 'neutral' ? pf.format(Math.abs(trendValue) / 100) : null].filter(Boolean).join(' ')
    : null
  const sentiment = trendTone && trend && trendTone !== 'neutral' ? (trendTone === 'positive' ? words.favorable : words.unfavorable) : null

  const hasSpark = Array.isArray(sparkline) && sparkline.length >= 2
  const sparkAlt = hasSpark
    ? sparklineLabel ?? `Trend over ${sparkline.length} periods, from ${nf.format(sparkline[0])} to ${nf.format(sparkline[sparkline.length - 1])}.`
    : undefined

  const rootProps = { ref, className: cx(styles.root, className), 'data-size': size, ...rest }

  if (loading) {
    return (
      <div {...rootProps} data-loading="true">
        <SkeletonLoader
          variant="custom"
          label={`Loading ${plainLabel}`}
          placeholder={
            <>
              <SkeletonBlock width="40%" height="var(--component-skeletonLoader-all-shape-heightText)" />
              <SkeletonBlock width="60%" height={size === 'compact' ? 'var(--component-skeletonLoader-all-shape-heightText)' : 'var(--component-skeletonLoader-all-shape-heightBlock)'} />
              <SkeletonBlock width="50%" height="var(--component-skeletonLoader-all-shape-heightText)" />
            </>
          }
        />
      </div>
    )
  }

  if (error) {
    const message = typeof error === 'string' ? error : `We couldn't load ${plainLabel}.`
    return (
      <div {...rootProps} data-error="true">
        <div className={styles.label}>{label}</div>
        <div className={styles.error} role="alert">
          <span className={styles.errorIcon} aria-hidden="true"><Icon name="error" /></span>
          <span>{message}{onRetry ? ' Try again.' : ''}</span>
        </div>
        {onRetry ? (
          <div>
            <Button priority="tertiary" size="small" icon={<Icon name="refresh" />} onClick={onRetry} aria-label={`Retry loading ${plainLabel}`}>Retry</Button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div {...rootProps} role="group" aria-labelledby={labelId} aria-describedby={[valueId, trend ? trendId : null].filter(Boolean).join(' ')} data-tone={tone}>
      <div id={labelId} className={styles.label}>{label}</div>
      <div className={styles.live} aria-live={live ? 'polite' : undefined} aria-atomic={live ? true : undefined}>
        <div className={styles.row}>
          <div id={valueId} className={styles.value}>{shown}</div>
          {hasSpark ? (
            <div className={styles.sparkWrap}>
              <svg className={styles.spark} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <polyline points={sparkPoints(sparkline)} fill="none" />
              </svg>
              <VisuallyHidden>{sparkAlt}</VisuallyHidden>
            </div>
          ) : null}
        </div>
        {trend || comparison ? (
          <div className={styles.meta}>
            {trend ? (
              <span id={trendId} className={styles.trend}>
                <span className={styles.trendIcon} aria-hidden="true">
                  <Icon name={trend === 'up' ? 'trendUp' : trend === 'down' ? 'trendDown' : 'dash'} />
                </span>
                <span>{trendText}</span>
                {sentiment ? <VisuallyHidden>, {sentiment}</VisuallyHidden> : null}
              </span>
            ) : null}
            {comparison ? <span className={styles.comparison}>{comparison}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
})
