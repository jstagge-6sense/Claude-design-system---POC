import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type KeyboardEvent } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import styles from './ProgressSteps.module.css'

export type StepStatus = 'completed' | 'active' | 'upcoming' | 'error' | 'disabled'

export interface ProgressStep {
  id: string
  /** Step name. Always visible text: steps are never icon-only. */
  label: string
  description?: string
  /** Override the derived status. By default steps before `current` are completed, `current` is active, the rest upcoming. */
  status?: StepStatus
  /** Shown under the label when the status is error: what happened and what to do. */
  errorMessage?: string
  /** Appends "(optional)" to the label. */
  optional?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
}

export interface ProgressStepsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  steps: ProgressStep[]
  /** Index of the active step (0-based). Controlled. */
  current?: number
  defaultCurrent?: number
  onCurrentChange?: (index: number) => void
  /** Called when a person goes back to (or, in non-linear mode, jumps to) a step. */
  onStepClick?: (index: number, step: ProgressStep) => void
  /** horizontal: desktop workflows. vertical: long processes, mobile, sidebars. */
  orientation?: 'horizontal' | 'vertical'
  /** linear: complete in order, only earlier steps are clickable. nonLinear: any available step is clickable (rare). */
  mode?: 'linear' | 'nonLinear'
  /** Numbers only, for limited space. The active step's text is shown below, the others keep a hidden label. */
  compact?: boolean
  /** Accessible name of the list. */
  'aria-label'?: string
}

const STATUS_TEXT: Record<StepStatus, string> = {
  completed: 'completed',
  active: 'current step',
  upcoming: 'not started',
  error: 'has an error',
  disabled: 'not available',
}

export const ProgressSteps = forwardRef<HTMLDivElement, ProgressStepsProps>(function ProgressSteps(
  { steps, current: currentProp, defaultCurrent = 0, onCurrentChange, onStepClick, orientation = 'horizontal', mode = 'linear', compact = false, className, onKeyDown, 'aria-label': ariaLabel = 'Progress', ...rest },
  ref,
) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production' && steps.length > 7) {
    console.warn('ProgressSteps: more than 7 steps. Group related steps or split the flow.')
  }
  const rootRef = useRef<HTMLDivElement>(null)
  const baseId = useId()
  const [currentRaw, setCurrent] = useControllableState<number>(currentProp, defaultCurrent, onCurrentChange)
  const current = Math.min(Math.max(0, currentRaw), Math.max(0, steps.length - 1))
  const [message, setMessage] = useState('')
  const first = useRef(true)

  // Announce step changes. Not on first render, so the page does not read the whole stepper on load.
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const s = steps[current]
    if (s) setMessage(`Step ${current + 1} of ${steps.length}: ${s.label}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const statusOf = (s: ProgressStep, i: number): StepStatus => s.status ?? (i < current ? 'completed' : i === current ? 'active' : 'upcoming')
  const interactive = (s: ProgressStep, i: number): boolean => {
    const st = statusOf(s, i)
    if (st === 'disabled' || st === 'active') return false
    if (mode === 'nonLinear') return true
    // Linear: only steps already reached can be revisited. Future steps stay non-interactive.
    return i < current || st === 'completed' || (st === 'error' && i <= current)
  }
  const go = (i: number) => { setCurrent(i); onStepClick?.(i, steps[i]) }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button[data-step]') ?? [])
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    const vertical = orientation === 'vertical'
    const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const prev = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    let n = -1
    if (e.key === next) n = Math.min(buttons.length - 1, i + 1)
    else if (e.key === prev) n = Math.max(0, i - 1)
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = buttons.length - 1
    if (n < 0) return
    e.preventDefault()
    buttons[n].focus()
  }

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      className={cx(styles.root, className)}
      data-orientation={orientation}
      data-compact={compact || undefined}
      data-mode={mode}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <ol className={styles.list} role="list" aria-label={ariaLabel}>
        {steps.map((s, i) => {
          const status = statusOf(s, i)
          const canClick = interactive(s, i)
          const showText = !compact || status === 'active'
          const errorId = `${baseId}-error-${s.id}`
          const marker = (
            <span className={styles.marker} aria-hidden="true">
              {status === 'completed' ? <Icon name="check" /> : status === 'error' ? <Icon name="error" /> : <span className={styles.number}>{i + 1}</span>}
            </span>
          )
          const text = (
            <span className={styles.text}>
              <span className={styles.label}>{s.label}{s.optional ? <span className={styles.optional}> (optional)</span> : null}</span>
              {s.description && !compact ? <span className={styles.description}>{s.description}</span> : null}
            </span>
          )
          const hint = <VisuallyHidden>{`, ${STATUS_TEXT[status]}`}</VisuallyHidden>
          const content = (
            <>
              {marker}
              {showText ? text : <VisuallyHidden>{s.label}</VisuallyHidden>}
              {hint}
            </>
          )
          return (
            <li
              key={s.id}
              className={styles.item}
              data-status={status}
              data-last={i === steps.length - 1 || undefined}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <div className={styles.body}>
                {canClick ? (
                  <button
                    type="button"
                    className={styles.step}
                    data-step={s.id}
                    data-state={s['data-state']}
                    aria-describedby={status === 'error' && s.errorMessage ? errorId : undefined}
                    onClick={() => go(i)}
                  >
                    {content}
                  </button>
                ) : (
                  <span className={styles.step} data-state={s['data-state']} aria-describedby={status === 'error' && s.errorMessage ? errorId : undefined}>{content}</span>
                )}
                {status === 'error' && s.errorMessage ? (
                  <p id={errorId} className={styles.message}>
                    <span className={styles.messageIcon} aria-hidden="true"><Icon name="error" /></span>
                    <span>{s.errorMessage}</span>
                  </p>
                ) : null}
              </div>
              {i < steps.length - 1 ? <span className={styles.connector} data-filled={status === 'completed' || undefined} aria-hidden="true" /> : null}
            </li>
          )
        })}
      </ol>
      {compact ? <p className={styles.counter} aria-hidden="true">{`Step ${current + 1} of ${steps.length}`}</p> : null}
      <VisuallyHidden role="status" aria-live="polite">{message}</VisuallyHidden>
    </div>
  )
})
