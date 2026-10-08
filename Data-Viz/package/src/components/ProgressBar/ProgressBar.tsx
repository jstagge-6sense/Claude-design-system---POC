import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import styles from './ProgressBar.module.css'

export type ProgressState = 'default' | 'complete' | 'error'

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What is progressing. Shown above the bar and used as the accessible name. */
  label: string
  /** 0 to 100. Leave undefined for indeterminate. Never invent a percentage: if it cannot be measured, omit it. */
  value?: number
  /** default, complete or error. Complete is inferred when value reaches 100. */
  state?: ProgressState
  /** Show the numeric percentage next to the label. */
  showValue?: boolean
  /** Contextual message about what is happening now, or what went wrong when state is error. */
  statusText?: ReactNode
  /** Multi-step: number of tasks in one action. With `steps`, `value` is the 0 to 100 progress inside the current step. */
  steps?: number
  /** Multi-step: the step in progress, starting at 1. */
  currentStep?: number
}

const clamp = (n: number) => Math.min(100, Math.max(0, n))

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { label, value, state, showValue = false, statusText: statusIn, steps, currentStep = 1, className, ...rest },
  ref,
) {
  const labelId = useId()
  const statusId = useId()
  const stepped = steps != null && steps > 1
  const step = stepped ? Math.min(Math.max(1, currentStep), steps) : 1
  const within = value == null ? undefined : clamp(value)
  // Overall percentage. For steps: completed steps plus the share of the current one.
  const overall = within == null ? undefined
    : stepped ? Math.round((((step - 1) + within / 100) / steps) * 100)
      : Math.round(within)
  const resolved: ProgressState = state ?? (overall === 100 ? 'complete' : 'default')
  const statusText: ReactNode = statusIn ?? (resolved === 'complete' ? 'Complete' : resolved === 'error' ? 'Something went wrong' : undefined)
  const indeterminate = overall == null && resolved === 'default'
  const fill = resolved === 'complete' ? 100 : overall ?? 0
  const stepText = stepped ? `Step ${step} of ${steps}` : undefined
  const valueText = [overall != null ? `${overall}%` : undefined, stepText, typeof statusText === 'string' ? statusText : undefined].filter(Boolean).join(', ') || undefined

  return (
    <div ref={ref} className={cx(styles.root, className)} data-state-kind={resolved} data-indeterminate={indeterminate || undefined} {...rest}>
      <div className={styles.header}>
        <span id={labelId} className={styles.label}>{label}</span>
        {showValue && overall != null ? <span className={styles.value}>{resolved === 'complete' ? 100 : overall}%</span> : null}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-describedby={statusText || stepText ? statusId : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : fill}
        aria-valuetext={indeterminate ? (valueText ?? 'In progress') : valueText}
        aria-invalid={resolved === 'error' || undefined}
        className={styles.track}
        data-steps={stepped ? steps : undefined}
      >
        {stepped
          ? Array.from({ length: steps }, (_, i) => {
              const pct = resolved === 'complete' || i < step - 1 ? 100 : i === step - 1 ? (within ?? 0) : 0
              return <span key={i} className={styles.segment}><span className={styles.fill} style={{ inlineSize: `${pct}%` }} /></span>
            })
          : <span className={styles.fill} style={indeterminate ? undefined : { inlineSize: `${fill}%` }} />}
      </div>
      {statusText || stepText ? (
        <div id={statusId} className={styles.status} aria-live="polite">
          {resolved === 'complete' ? <span className={styles.icon} aria-hidden="true"><Icon name="success" /></span> : null}
          {resolved === 'error' ? <span className={styles.icon} aria-hidden="true"><Icon name="error" /></span> : null}
          <span>{stepText && statusText ? <>{stepText}: {statusText}</> : (statusText ?? stepText)}</span>
        </div>
      ) : null}
    </div>
  )
})
