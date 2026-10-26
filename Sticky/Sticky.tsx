import { forwardRef, useEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes, type RefObject } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useStuck, type StickyEdge } from './useStuck'
import styles from './Sticky.module.css'

export interface StickyProps extends HTMLAttributes<HTMLDivElement> {
  /** top: page header, toolbar, table header. bottom: action bars. start: first column or side rail. */
  edge?: StickyEdge
  /** Distance in px from the edge of the scroll container, for example to sit under another sticky element. */
  offset?: number
  /** Scroll container the element sticks within. Omit for the viewport. */
  root?: RefObject<HTMLElement | null>
  /** Called when the element becomes stuck or unstuck. */
  onStuckChange?: (stuck: boolean) => void
  /** Force the stuck look for docs and previews. Do not use in product code. */
  'data-stuck'?: boolean
}

/**
 * Pins its content to an edge while the page or a scroll container scrolls, and shows a visible boundary while stuck.
 * Rule: sticky elements must not cover more than 20% of the viewport height. In development this warns when they do.
 * On mobile, collapse or hide sticky content (for example hide a toolbar until scroll-up) instead of pinning it.
 */
export const Sticky = forwardRef<HTMLDivElement, StickyProps>(function Sticky(
  { edge = 'top', offset = 0, root, onStuckChange, className, style, children, 'data-stuck': forcedStuck, ...rest },
  ref,
) {
  const { ref: stuckRef, stuck: observed } = useStuck<HTMLDivElement>({ edge, offset, root })
  const own = useRef<HTMLDivElement>(null)
  const stuck = forcedStuck ?? observed
  const merged = useMemo(() => mergeRefs(ref, own, stuckRef), [ref, stuckRef])
  const last = useRef(false)

  useEffect(() => {
    if (last.current !== stuck) { last.current = stuck; onStuckChange?.(stuck) }
  }, [stuck, onStuckChange])

  useEffect(() => {
    if ((typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') || edge === 'start') return
    const h = own.current?.getBoundingClientRect().height ?? 0
    const vh = (root?.current?.clientHeight ?? window.innerHeight) || 0
    if (vh > 0 && h > vh * 0.2) console.warn(`Sticky: the element covers ${Math.round((h / vh) * 100)}% of the viewport height. Keep sticky elements under 20%.`)
  })

  const vars = { '--_offset': `${offset}px` } as CSSProperties
  return (
    <div
      ref={merged}
      className={cx(styles.root, className)}
      data-edge={edge}
      data-stuck={stuck || undefined}
      style={{ ...vars, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
})
