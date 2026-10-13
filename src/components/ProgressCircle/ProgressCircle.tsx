import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import { useCountUp } from '../../primitives/useCountUp'
import type { ProgressState } from '../ProgressBar'
import styles from './ProgressCircle.module.css'

export interface ProgressCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What is progressing. Used as the accessible name. */
  label: string
  /** 0 to 100. */
  value: number
  /** small: compact for dashboard cards. medium: standard. large: prominent feature display. */
  size?: 'small' | 'medium' | 'large'
  /** default, complete or error. Complete is inferred when value reaches 100. */
  state?: ProgressState
  /** Replace the center content: a value, a fraction like "12 of 20", or an icon. Defaults to the percentage. */
  centerLabel?: ReactNode
  /** Plain-text version of the center label for assistive tech, for example "12 of 20 tasks". */
  valueText?: string
  /** Hide the center label entirely (ring only). Not recommended: the number is the second cue besides color. */
  hideLabel?: boolean
}

const clamp = (n: number) => Math.min(100, Math.max(0, n))

export const ProgressCircle = forwardRef<HTMLDivElement, ProgressCircleProps>(function ProgressCircle(
  { label, value, size = 'medium', state, centerLabel, valueText, hideLabel = false, className, ...rest },
  ref,
) {
  const pct = Math.round(clamp(value))
  const resolved: ProgressState = state ?? (pct === 100 ? 'complete' : 'default')
  const counted = useCountUp(pct)
  const center = centerLabel ?? (resolved === 'complete' ? <Icon name="check" /> : resolved === 'error' ? <Icon name="error" /> : `${counted}%`)
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={resolved === 'complete' ? 100 : pct}
      aria-valuetext={valueText ?? (resolved === 'complete' ? `${pct}%, complete` : resolved === 'error' ? `${pct}%, error` : `${pct}%`)}
      aria-invalid={resolved === 'error' || undefined}
      className={cx(styles.root, className)}
      data-size={size}
      data-state-kind={resolved}
      {...rest}
    >
      <svg className={styles.svg} aria-hidden="true" focusable="false">
        <circle className={styles.track} cx="50%" cy="50%" r="45%" fill="none" />
        <circle
          className={styles.arc}
          cx="50%" cy="50%" r="45%" fill="none"
          pathLength={100}
          strokeDasharray={`${resolved === 'complete' ? 100 : pct} 100`}
        />
      </svg>
      {hideLabel ? null : <span className={styles.center} aria-hidden="true">{center}</span>}
    </div>
  )
})
