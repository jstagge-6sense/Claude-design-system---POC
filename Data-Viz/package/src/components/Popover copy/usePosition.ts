import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

export type PopoverSide = 'top' | 'bottom' | 'start' | 'end'
export type PopoverAlign = 'start' | 'center' | 'end'

export interface UsePositionOptions {
  /** The element the floating element is placed against. */
  anchorRef: RefObject<HTMLElement | null>
  /** The positioned wrapper. It must be `position: absolute`. Its padding on the anchor side is the gap. */
  floatingRef: RefObject<HTMLElement | null>
  open: boolean
  /** Preferred side. Flips to the opposite side, then to the side with most room, when it does not fit. */
  side?: PopoverSide
  align?: PopoverAlign
  /** Make the floating element at least as wide as the anchor (select panels). */
  matchWidth?: boolean
  /** Minimum space kept between the floating element and the viewport edge, in px. */
  viewportPadding?: number
}
export interface PositionResult {
  /** The side actually used after flipping. */
  side: PopoverSide
  /** Distance in px from the inline-start (or block-start) edge of the floating element to the anchor center. For arrows. */
  arrowOffset: number
}

const PHYSICAL = { top: 'top', bottom: 'bottom' } as const
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Convert viewport coordinates to coordinates inside the floating element's containing block. */
function originOf(el: HTMLElement) {
  const parent = el.offsetParent as HTMLElement | null
  if (!parent || parent === document.documentElement || (parent === document.body && getComputedStyle(parent).position === 'static')) {
    return { left: -window.scrollX, top: -window.scrollY }
  }
  const r = parent.getBoundingClientRect()
  return { left: r.left + parent.clientLeft - parent.scrollLeft, top: r.top + parent.clientTop - parent.scrollTop }
}

/**
 * Position a floating element against an anchor. Writes `left`, `top` and `data-ready` straight to the element
 * (no re-render per scroll) and returns the resolved side plus the arrow offset.
 */
export function usePosition({ anchorRef, floatingRef, open, side = 'bottom', align = 'center', matchWidth = false, viewportPadding = 4 }: UsePositionOptions): PositionResult {
  const [result, setResult] = useState<PositionResult>({ side, arrowOffset: 0 })

  const update = useCallback(() => {
    const anchor = anchorRef.current
    const floating = floatingRef.current
    if (!anchor || !floating) return
    if (matchWidth) floating.style.minInlineSize = `${anchor.getBoundingClientRect().width}px`
    const a = anchor.getBoundingClientRect()
    const w = floating.offsetWidth
    const h = floating.offsetHeight
    const vw = document.documentElement.clientWidth || window.innerWidth
    const vh = document.documentElement.clientHeight || window.innerHeight
    const rtl = getComputedStyle(floating).direction === 'rtl'
    const physical = (s: PopoverSide): 'top' | 'bottom' | 'left' | 'right' => (s === 'top' || s === 'bottom' ? PHYSICAL[s] : (s === 'start') === rtl ? 'right' : 'left')
    const room = {
      top: a.top, bottom: vh - a.bottom, left: a.left, right: vw - a.right,
    }
    const need = (p: 'top' | 'bottom' | 'left' | 'right') => (p === 'top' || p === 'bottom' ? h : w)
    const fits = (s: PopoverSide) => room[physical(s)] >= need(physical(s)) + viewportPadding
    const opposite: Record<PopoverSide, PopoverSide> = { top: 'bottom', bottom: 'top', start: 'end', end: 'start' }
    let used: PopoverSide = side
    if (!fits(side)) {
      if (fits(opposite[side])) used = opposite[side]
      else {
        const all: PopoverSide[] = ['top', 'bottom', 'start', 'end']
        used = all.reduce((best, s) => (room[physical(s)] - need(physical(s)) > room[physical(best)] - need(physical(best)) ? s : best), side)
      }
    }
    const p = physical(used)
    let x = 0
    let y = 0
    if (p === 'top' || p === 'bottom') {
      y = p === 'top' ? a.top - h : a.bottom
      x = align === 'center' ? a.left + a.width / 2 - w / 2 : (align === 'start') !== rtl ? a.left : a.right - w
      x = Math.max(viewportPadding, Math.min(x, vw - w - viewportPadding))
    } else {
      x = p === 'left' ? a.left - w : a.right
      y = align === 'center' ? a.top + a.height / 2 - h / 2 : align === 'start' ? a.top : a.bottom - h
      y = Math.max(viewportPadding, Math.min(y, vh - h - viewportPadding))
    }
    const o = originOf(floating)
    floating.style.left = `${x - o.left}px`
    floating.style.top = `${y - o.top}px`
    floating.setAttribute('data-ready', '')
    const centerX = a.left + a.width / 2 - x
    const arrowOffset = p === 'top' || p === 'bottom' ? (rtl ? w - centerX : centerX) : a.top + a.height / 2 - y
    setResult((prev) => (prev.side === used && Math.abs(prev.arrowOffset - arrowOffset) < 0.5 ? prev : { side: used, arrowOffset }))
  }, [anchorRef, floatingRef, side, align, matchWidth, viewportPadding])

  const updateRef = useRef(update)
  updateRef.current = update

  useIsoLayoutEffect(() => {
    if (!open) return
    updateRef.current()
    const on = () => updateRef.current()
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    const RO = typeof ResizeObserver !== 'undefined' ? ResizeObserver : undefined
    const ro = RO ? new RO(on) : undefined
    if (ro) {
      if (floatingRef.current) ro.observe(floatingRef.current)
      if (anchorRef.current) ro.observe(anchorRef.current)
    }
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
      ro?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, side, align, matchWidth])

  return result
}
