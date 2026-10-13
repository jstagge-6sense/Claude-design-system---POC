import { forwardRef, useId, type HTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { Button } from '../Button'
import { Icon } from '../../icons'
import { isDev } from '../Dialog/overlay'
import { Banner, resolveBannerPriority, type BannerProps, type BannerSeverity } from './Banner'
import { useState } from 'react'
import styles from './BannerStack.module.css'

export interface BannerStackItem extends Omit<BannerProps, 'onDismiss'> {
  id: string
}

export interface BannerStackProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BannerStackItem[]
  /** Banners visible while collapsed. The rest sit behind a count control. */
  maxVisible?: number
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Called when a dismissible banner is closed. */
  onDismiss?: (id: string) => void
  /** Accessible name of the group. */
  label?: string
}

/** Most urgent first. Matches the feedback priority: error, warning, success, info. */
const RANK: Record<BannerSeverity, number> = { error: 0, warning: 1, success: 2, info: 3 }

/**
 * Orders banners by priority, enforces one P1 at a time (extra P1s render as P2), and collapses
 * the lower-priority banners behind a count.
 */
export const BannerStack = forwardRef<HTMLElement, BannerStackProps>(function BannerStack(
  { items, maxVisible = 1, expanded, defaultExpanded = false, onExpandedChange, onDismiss, label = 'Notifications', className, ...rest },
  ref,
) {
  const [open, setOpen] = useControllableState<boolean>(expanded, defaultExpanded, onExpandedChange)
  const [gone, setGone] = useState<string[]>([])
  const listId = useId()

  let seenP1 = false
  const normalized = items
    .filter((i) => !gone.includes(i.id))
    .map((item, index) => {
      const p = resolveBannerPriority(item.severity ?? 'info', item.priority)
      if (p === 'P1') {
        if (seenP1) {
          if (isDev()) console.warn(`BannerStack: only one P1 banner at a time. "${item.id}" is rendered as P2.`)
          return { item: { ...item, priority: 'P2' as const }, index }
        }
        seenP1 = true
      }
      return { item, index }
    })
    .sort((a, b) => {
      const sa = RANK[a.item.severity ?? 'info']
      const sb = RANK[b.item.severity ?? 'info']
      if (sa !== sb) return sa - sb
      const pa = resolveBannerPriority(a.item.severity ?? 'info', a.item.priority)
      const pb = resolveBannerPriority(b.item.severity ?? 'info', b.item.priority)
      return (pa ?? '').localeCompare(pb ?? '') || a.index - b.index
    })
    .map((x) => x.item)

  const visible = open ? normalized : normalized.slice(0, maxVisible)
  const hidden = normalized.length - maxVisible
  const collapsible = hidden > 0

  return (
    <section ref={ref} aria-label={label} className={cx(styles.root, className)} {...rest}>
      <div id={listId} className={styles.list}>
        {visible.map(({ id, ...banner }) => (
          <Banner
            key={id}
            {...banner}
            onDismiss={() => { setGone((g) => [...g, id]); onDismiss?.(id) }}
          />
        ))}
      </div>
      {collapsible ? (
        <Button
          className={styles.toggle}
          priority="tertiary"
          size="small"
          aria-expanded={open}
          aria-controls={listId}
          trailingIcon={<Icon name={open ? 'chevronUp' : 'chevronDown'} />}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Show fewer notifications' : `Show ${hidden} more ${hidden === 1 ? 'notification' : 'notifications'}`}
        </Button>
      ) : null}
    </section>
  )
})
