import { useEffect, useRef, useState, type RefObject } from 'react'

/** True when the user asks for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

/** Call `handler` on Escape while `active`. Overlays should only handle Escape when they are topmost. */
export function useEscapeKey(handler: (e: KeyboardEvent) => void, active = true) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    if (!active) return
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') ref.current(e) }
    document.addEventListener('keydown', on)
    return () => document.removeEventListener('keydown', on)
  }, [active])
}

/** Call `handler` when a pointer goes down outside every given element. */
export function useClickOutside(refs: Array<RefObject<HTMLElement | null>>, handler: (e: MouseEvent | TouchEvent) => void, active = true) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    if (!active) return
    const on = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (refs.some((r) => r.current && r.current.contains(t))) return
      ref.current(e)
    }
    document.addEventListener('mousedown', on)
    document.addEventListener('touchstart', on)
    return () => { document.removeEventListener('mousedown', on); document.removeEventListener('touchstart', on) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
/** Trap Tab focus inside `ref` while active; return focus to the previously focused element on cleanup. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active = true, opts: { initialFocus?: RefObject<HTMLElement | null> } = {}) {
  useEffect(() => {
    if (!active || !ref.current) return
    const node = ref.current
    const previous = document.activeElement as HTMLElement | null
    const items = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('aria-hidden'))
    const first = opts.initialFocus?.current ?? items()[0] ?? node
    if (first === node && !node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1')
    first.focus()
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = items()
      if (!list.length) { e.preventDefault(); return }
      const a = list[0], z = list[list.length - 1]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    node.addEventListener('keydown', on)
    return () => { node.removeEventListener('keydown', on); previous?.focus?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}

/** Lock body scroll while active. */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [active])
}
