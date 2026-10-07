import { useCallback, useEffect, useState, type RefObject } from 'react'

export type StickyEdge = 'top' | 'bottom' | 'start'

export interface UseStuckOptions {
  /** Edge the element sticks to. `start` is the inline start edge (left in LTR, right in RTL). */
  edge?: StickyEdge
  /** Distance in px from the scroll container edge. Must match the offset applied to the sticky element. */
  offset?: number
  /** Scroll container. Omit to use the viewport. */
  root?: RefObject<HTMLElement | null>
  /** Turn observation off (for example when the element is not sticky). */
  enabled?: boolean
}

/**
 * Reports whether a `position: sticky` element is currently stuck.
 * The element must use an inset of `offset - 1px` on its edge. At that inset it sits 1px outside the
 * observer root only while stuck, so its intersection ratio drops below 1. One element, no sentinel.
 * Returns a callback `ref` for the sticky element and `stuck`.
 */
export function useStuck<T extends HTMLElement = HTMLElement>({ edge = 'top', offset = 0, root, enabled = true }: UseStuckOptions = {}) {
  const [node, setNode] = useState<T | null>(null)
  const [stuck, setStuck] = useState(false)
  const ref = useCallback((el: T | null) => setNode(el), [])

  useEffect(() => {
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') { setStuck(false); return }
    const rtl = edge === 'start' && getComputedStyle(node).direction === 'rtl'
    const margin =
      edge === 'top' ? `-${offset}px 0px 0px 0px`
      : edge === 'bottom' ? `0px 0px -${offset}px 0px`
      : rtl ? `0px -${offset}px 0px 0px` : `0px 0px 0px -${offset}px`
    const io = new IntersectionObserver(
      ([entry]) => setStuck(entry.intersectionRatio < 1),
      { root: root?.current ?? null, rootMargin: margin, threshold: [1] },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [node, edge, offset, root, enabled])

  return { ref, stuck }
}
