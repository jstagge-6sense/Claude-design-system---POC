import { forwardRef, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { FieldShell, describedBy, useFieldIds } from '../Input/Field'
import { NumberInput } from '../NumberInput'
import styles from './Slider.module.css'

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Visible label. Also the accessible name of the slider. */
  label: string
  helperText?: ReactNode
  error?: string
  disabled?: boolean
  min?: number
  max?: number
  /** Step size. Continuous sliders default to 1% of the range. Discrete sliders default to 1. */
  step?: number
  /** Discrete: snaps to steps and shows a tick for every step. Continuous (default): fine-grained, no ticks. */
  discrete?: boolean
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Called when a drag ends or a key press is released. Use it to apply expensive changes. */
  onValueCommit?: (value: number) => void
  /** Show the current value in a label above the thumb. */
  showValueLabel?: boolean
  /** Show a synced number input beside the track for precision. */
  withInput?: boolean
  /** Show min and max below the track. Default true. */
  showMinMax?: boolean
  /** Unit appended to the value text (%, px, days). */
  unit?: string
  /** Full control of the value text (labels, aria-valuetext). */
  formatValue?: (value: number) => string
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus' | 'pressed'
}

const decimalsOf = (n: number) => {
  const s = String(n)
  return s.includes('.') ? Math.min(6, s.split('.')[1].length) : 0
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label, helperText, error, disabled = false, min = 0, max = 100, step, discrete = false, value, defaultValue, onValueChange, onValueCommit,
    showValueLabel = false, withInput = false, showMinMax = true, unit, formatValue, className, id: idProp, 'data-state': forced, 'aria-describedby': describedByProp, ...rest
  },
  ref,
) {
  const ids = useFieldIds(idProp)
  const eff = step ?? (discrete ? 1 : (max - min) / 100)
  const dp = decimalsOf(eff)
  const snap = (v: number) => {
    const s = Math.round((v - min) / eff) * eff + min
    return Math.min(max, Math.max(min, Number(s.toFixed(dp))))
  }
  const [val, setVal] = useControllableState<number>(value, snap(defaultValue ?? min), onValueChange)
  const [dragging, setDragging] = useState(false)
  const [inputKey, setInputKey] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const current = Math.min(max, Math.max(min, val))
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100
  const fmt = (v: number) => (formatValue ? formatValue(v) : `${v.toFixed(dp)}${unit ? ` ${unit}` : ''}`)
  const isRtl = () => (trackRef.current ? getComputedStyle(trackRef.current).direction === 'rtl' : false)
  const pctOf = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * 100)
  const ticks = discrete && eff > 0 && (max - min) / eff <= 100 ? Array.from({ length: Math.round((max - min) / eff) + 1 }, (_, i) => Number((min + i * eff).toFixed(dp))) : []

  const commit = (v: number) => { const n = snap(v); if (n !== current) setVal(n); return n }
  const fromPointer = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect()
    if (!r || r.width === 0) return
    let ratio = (clientX - r.left) / r.width
    if (isRtl()) ratio = 1 - ratio
    commit(min + Math.min(1, Math.max(0, ratio)) * (max - min))
  }
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    thumbRef.current?.focus()
    fromPointer(e.clientX)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => { if (dragging) fromPointer(e.clientX) }
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setDragging(false)
    onValueCommit?.(current)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const rtl = isRtl()
    const big = Math.max(eff, snap(min + (max - min) / 10) - min)
    let next: number | undefined
    switch (e.key) {
      case 'ArrowRight': next = current + (rtl ? -eff : eff); break
      case 'ArrowLeft': next = current + (rtl ? eff : -eff); break
      case 'ArrowUp': next = current + eff; break
      case 'ArrowDown': next = current - eff; break
      case 'PageUp': next = current + big; break
      case 'PageDown': next = current - big; break
      case 'Home': next = min; break
      case 'End': next = max; break
      default: return
    }
    e.preventDefault()
    commit(next)
  }

  const readout = !showValueLabel && !withInput ? <span className={styles.readout} aria-hidden="true">{fmt(current)}</span> : null
  const style = { '--_p': `${pct}%` } as CSSProperties

  return (
    <FieldShell
      ref={ref}
      ids={ids}
      label={label}
      labelAs="span"
      labelAddon={readout}
      helperText={helperText}
      error={error}
      disabled={disabled}
      className={cx(styles.root, className)}
      data-state={forced}
      data-dragging={dragging || undefined}
      {...rest}
    >
      <div className={styles.row}>
        <div className={styles.main}>
          <div
            className={styles.hit}
            data-with-label={showValueLabel || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div ref={trackRef} className={styles.track} style={style}>
              <div className={styles.rail} />
              <div className={styles.fill} />
              {ticks.map((t) => <span key={t} className={styles.tick} style={{ '--_p': `${pctOf(t)}%` } as CSSProperties} aria-hidden="true" />)}
              <div
                ref={thumbRef}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                className={styles.thumb}
                aria-labelledby={ids.labelId}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={current}
                aria-valuetext={fmt(current)}
                aria-orientation="horizontal"
                aria-disabled={disabled || undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(ids, { helper: !!helperText, error: !!error }, describedByProp)}
                onKeyDown={onKeyDown}
                onKeyUp={(e) => { if (!disabled && ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) onValueCommit?.(current) }}
              >
                {showValueLabel ? <span className={styles.labelAnchor} aria-hidden="true"><span className={styles.valueLabel}>{fmt(current)}</span></span> : null}
              </div>
            </div>
          </div>
          {showMinMax ? <div className={styles.range} aria-hidden="true"><span>{fmt(min)}</span><span>{fmt(max)}</span></div> : null}
        </div>
        {withInput ? (
          <div className={styles.input}>
            <NumberInput
              key={inputKey}
              label={`${label} value`}
              hideLabel
              size="small"
              steppers={false}
              min={min}
              max={max}
              step={eff}
              value={current}
              disabled={disabled}
              onValueChange={(v) => { if (v === null) setInputKey((k) => k + 1); else { const n = snap(v); setVal(n); onValueCommit?.(n) } }}
            />
          </div>
        ) : null}
      </div>
    </FieldShell>
  )
})
