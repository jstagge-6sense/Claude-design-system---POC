import { forwardRef, useEffect, useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import styles from './Breadcrumb.module.css'

export interface BreadcrumbItem {
  /** Descriptive text. Each link must make sense out of context. */
  label: string
  /** Destination for parent levels. The last item is the current page and is never a link. */
  href?: string
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  /** Optional leading icon slot (INSTANCE_SWAP). */
  icon?: ReactNode
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Path from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[]
  /** Show a home icon for the first item. Its label stays available to assistive tech. */
  homeIcon?: boolean
  /** Truncated variant. Collapses the middle items behind an ellipsis button when the path is long. */
  truncate?: boolean
  /** How many trailing items stay visible when truncated, including the current page. Default 2. */
  tailCount?: number
  /** Controlled expansion of the truncated items. */
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Responsive variant. Below the container width breakpoint, show only the parent and the current page. Default true. */
  responsive?: boolean
  /** Accessible label for the ellipsis button. */
  expandLabel?: string
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  {
    items, homeIcon = false, truncate = false, tailCount = 2, expanded, defaultExpanded = false, onExpandedChange,
    responsive = true, expandLabel = 'Show hidden levels', className, 'aria-label': ariaLabel = 'Breadcrumb', ...rest
  },
  ref,
) {
  const [open, setOpen] = useControllableState<boolean>(expanded, defaultExpanded, onExpandedChange)
  const firstRevealed = useRef<HTMLAnchorElement>(null)
  const fromUser = useRef(false)
  const tail = Math.max(1, tailCount)
  // Collapse only when at least two levels would hide. Hiding one level behind a button saves nothing.
  const hiddenCount = items.length - 1 - tail
  const collapsed = truncate && !open && hiddenCount >= 2

  useEffect(() => {
    if (open && fromUser.current) { fromUser.current = false; firstRevealed.current?.focus() }
  }, [open])

  const lastIndex = items.length - 1
  const rows: Array<{ kind: 'item'; index: number } | { kind: 'ellipsis' }> = []
  items.forEach((_, i) => {
    if (collapsed && i >= 1 && i < items.length - tail) {
      if (i === 1) rows.push({ kind: 'ellipsis' })
      return
    }
    rows.push({ kind: 'item', index: i })
  })
  const firstRevealedIndex = truncate && open && hiddenCount >= 2 ? 1 : -1

  const separator = <span className={styles.separator} aria-hidden="true"><Icon name="chevronRight" /></span>

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx(styles.root, className)} data-responsive={responsive || undefined} {...rest}>
      <ol className={styles.list}>
        {rows.map((row, n) => {
          if (row.kind === 'ellipsis') {
            return (
              <li key="ellipsis" className={styles.item}>
                {separator}
                <button
                  type="button"
                  className={styles.link}
                  aria-label={expandLabel}
                  aria-expanded={false}
                  onClick={() => { fromUser.current = true; setOpen(true) }}
                >
                  <Icon name="more" />
                </button>
              </li>
            )
          }
          const item = items[row.index]
          const isCurrent = row.index === lastIndex
          const isHome = homeIcon && row.index === 0
          const iconNode = isHome ? <Icon name="home" /> : item.icon
          const content = (
            <>
              {iconNode ? <span className={styles.icon} aria-hidden="true">{iconNode}</span> : null}
              {isHome ? <VisuallyHidden>{item.label}</VisuallyHidden> : <span className={styles.text}>{item.label}</span>}
            </>
          )
          return (
            <li key={`${row.index}-${item.label}`} className={styles.item}>
              {n > 0 ? separator : null}
              {isCurrent ? (
                <span className={styles.current} aria-current="page">{content}</span>
              ) : (
                <a
                  ref={row.index === firstRevealedIndex ? firstRevealed : undefined}
                  className={styles.link}
                  href={item.href ?? '#'}
                  onClick={item.onClick}
                  data-state={item['data-state']}
                >
                  {content}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
})
