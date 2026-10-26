import { useLayoutEffect, useRef, useState } from 'react'

/** Reads a CSS time custom property (for example `--core-motion-progress-duration`) in ms. Returns 0 when it is missing or unparsable. */
function readMs(name: string): number {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') return 0
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const m = /^(-?\d*\.?\d+)(ms|s)$/.exec(raw)
  if (!m) return 0
  return m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1])
}

/**
 * Counts a displayed integer from its previous value (0 on first mount) up to `target`, over the duration of a motion token.
 * Under reduced motion the token is 0ms, so the number jumps straight to the target. Visual only: keep the real value in aria-valuenow.
 */
export function useCountUp(target: number, durationVar = '--core-motion-progress-duration'): number {
  const [shown, setShown] = useState(target)
  const current = useRef<number | null>(null)
  useLayoutEffect(() => {
    const from = current.current ?? 0
    const ms = readMs(durationVar)
    if (ms <= 0 || from === target || typeof requestAnimationFrame === 'undefined') {
      current.current = target
      setShown(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    setShown(from)
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = Math.round(from + (target - from) * eased)
      current.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(tick)
      else current.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationVar])
  return shown
}
