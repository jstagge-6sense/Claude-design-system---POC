// Shared overlay behavior for Dialog and Drawer (and used by nothing else). Not part of the public API.
import { useEffect, useRef, useState, type RefObject } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Layers that currently listen for Escape. Only the topmost one reacts. */
const escapeStack: symbol[] = []
/** Count of open modal layers per kind, for the "do not stack" development warning. */
const openModals: Record<string, number> = {}

export const isDev = () => typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

export const focusableIn = (node: HTMLElement): HTMLElement[] =>
  Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('aria-hidden') && !el.closest('[hidden],[inert]'),
  )

/**
 * Keeps an element mounted while its exit transition plays.
 * With reduced motion the exit is skipped (instant show and hide).
 */
export function useExitTransition(open: boolean, reduced: boolean, ms = 200) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); return }
    if (!mounted) return
    if (reduced) { setMounted(false); setClosing(false); return }
    setClosing(true)
    const t = setTimeout(() => { setMounted(false); setClosing(false) }, ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced])
  return { mounted: mounted || open, closing: closing && !open }
}

export interface OverlayLayerOptions {
  /** True while the layer is open (not closing). */
  active: boolean
  kind: 'dialog' | 'drawer' | 'panel'
  trap: boolean
  lockScroll: boolean
  autoFocus: boolean
  /** Element to focus first. Falls back to the first focusable element, then the container. */
  initialFocus?: () => HTMLElement | null | undefined
  onEscape?: () => void
}

/**
 * Focus in, optional Tab trap, focus return, Escape (topmost only), optional scroll lock and a
 * development warning when two modal layers of the same kind are open.
 */
export function useOverlayLayer(ref: RefObject<HTMLElement | null>, opts: OverlayLayerOptions) {
  const latest = useRef(opts)
  latest.current = opts
  const { active, kind, trap, lockScroll } = opts

  useEffect(() => {
    const node = ref.current
    if (!active || !node) return
    const o = latest.current
    const trigger = document.activeElement as HTMLElement | null
    if (o.autoFocus) {
      const target = o.initialFocus?.() ?? focusableIn(node)[0] ?? node
      if (target === node && !node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: false })
    }
    const onKey = (e: KeyboardEvent) => {
      if (!latest.current.trap || e.key !== 'Tab') return
      const list = focusableIn(node)
      if (!list.length) { e.preventDefault(); node.focus(); return }
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (e.shiftKey && (current === first || current === node)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && current === last) { e.preventDefault(); first.focus() }
      else if (!node.contains(current)) { e.preventDefault(); first.focus() }
    }
    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('keydown', onKey)
      // Focus must never disappear: return it to the trigger if it is still in the document.
      if (o.autoFocus && trigger && trigger !== document.body && document.contains(trigger)) trigger.focus?.()
    }
  }, [active, ref])

  useEffect(() => {
    if (!active) return
    const id = Symbol(kind)
    escapeStack.push(id)
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || escapeStack[escapeStack.length - 1] !== id) return
      if (e.defaultPrevented) return
      latest.current.onEscape?.()
    }
    document.addEventListener('keydown', on)
    return () => {
      document.removeEventListener('keydown', on)
      const i = escapeStack.indexOf(id)
      if (i >= 0) escapeStack.splice(i, 1)
    }
  }, [active, kind])

  useEffect(() => {
    if (!active || !lockScroll) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [active, lockScroll])

  useEffect(() => {
    if (!active || !trap) return
    if (isDev() && kind !== 'panel' && (openModals[kind] ?? 0) > 0) {
      console.warn(`${kind === 'dialog' ? 'Dialog' : 'Drawer'}: another ${kind} is already open. Do not stack ${kind}s. Replace the content or navigate instead.`)
    }
    openModals[kind] = (openModals[kind] ?? 0) + 1
    return () => { openModals[kind] = Math.max(0, (openModals[kind] ?? 1) - 1) }
  }, [active, trap, kind])
}
