import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Where a panel opens relative to its anchor: below by default, above when there is no room below
 * and more room above. Measures when it opens and on resize or scroll.
 */
export function usePanelPlacement(open: boolean, anchorRef: RefObject<HTMLElement | null>, panelRef: RefObject<HTMLElement | null>): 'bottom' | 'top' {
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  useIsoLayoutEffect(() => {
    if (!open) { setPlacement('bottom'); return }
    const measure = () => {
      const a = anchorRef.current, p = panelRef.current
      if (!a || !p) return
      const r = a.getBoundingClientRect()
      const below = window.innerHeight - r.bottom
      const above = r.top
      setPlacement(below < p.offsetHeight && above > below ? 'top' : 'bottom')
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true) }
  }, [open, anchorRef, panelRef])
  return placement
}
