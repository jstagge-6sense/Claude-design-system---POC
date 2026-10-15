import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface PanelPlacementOptions {
  /** Which edge of the anchor the panel lines up with. Default 'start'. */
  align?: 'start' | 'end'
  /** Make the panel at least as wide as the anchor (listboxes). */
  matchWidth?: boolean
  /** Minimum space kept between the panel and the viewport edge, in px. Default 8. */
  viewportPadding?: number
}

/**
 * Where a panel opens relative to its anchor: below by default, above when there is no room below
 * and more room above. The panel is `position: fixed` and placed from the anchor's viewport rect, so an
 * ancestor with `overflow: hidden | auto | clip` cannot cut it off. Left/top (or bottom) are written straight
 * to the element. The panel's own CSS supplies `position: fixed`, `inset: auto` and the gap (margin) from the anchor.
 * Measures when it opens and on resize, scroll (any ancestor) and size changes.
 */
export function usePanelPlacement(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  { align = 'start', matchWidth = false, viewportPadding = 8 }: PanelPlacementOptions = {},
): 'bottom' | 'top' {
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  useIsoLayoutEffect(() => {
    if (!open) { setPlacement('bottom'); return }
    const measure = () => {
      const a = anchorRef.current, p = panelRef.current
      if (!a || !p) return
      const r = a.getBoundingClientRect()
      const vw = document.documentElement.clientWidth || window.innerWidth
      const vh = document.documentElement.clientHeight || window.innerHeight
      if (matchWidth) p.style.minInlineSize = `${r.width}px`
      const w = p.offsetWidth, h = p.offsetHeight
      const rtl = getComputedStyle(p).direction === 'rtl'
      const below = vh - r.bottom
      const above = r.top
      const next: 'bottom' | 'top' = below < h && above > below ? 'top' : 'bottom'
      const lineUpLeft = (align === 'start') !== rtl
      let x = lineUpLeft ? r.left : r.right - w
      x = Math.max(viewportPadding, Math.min(x, vw - w - viewportPadding))
      p.style.left = `${x}px`
      p.style.insetInlineStart = ''
      if (next === 'top') { p.style.bottom = `${vh - r.top}px`; p.style.top = 'auto' }
      else { p.style.top = `${r.bottom}px`; p.style.bottom = 'auto' }
      setPlacement((prev) => (prev === next ? prev : next))
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined
    if (ro) { if (panelRef.current) ro.observe(panelRef.current); if (anchorRef.current) ro.observe(anchorRef.current) }
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); ro?.disconnect() }
  }, [open, align, matchWidth, viewportPadding, anchorRef, panelRef])
  return placement
}
