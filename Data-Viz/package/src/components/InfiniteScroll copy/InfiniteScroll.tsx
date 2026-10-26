import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { Spinner } from '../Spinner'
import { SkeletonLoader, SkeletonText } from '../SkeletonLoader'
import styles from './InfiniteScroll.module.css'

export type InfiniteScrollStatus = 'idle' | 'loading' | 'loaded' | 'end' | 'error'

export interface InfiniteScrollProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onError'> {
  /** The items loaded so far. Render them as a list. This component adds the loading, end and error handling around them. */
  children: ReactNode
  /** Fetch the next batch. Called by the scroll sentinel, the Load more button and Retry. */
  onLoadMore: () => void
  /** A batch is being fetched. */
  loading?: boolean
  /** More items exist. Set to false at the end of the content. */
  hasMore?: boolean
  /** The last fetch failed. A string replaces the default message. */
  error?: string | boolean
  /** Items loaded so far. Used for the count and the announcements. */
  count?: number
  /** Total items when known, for "Showing 40 of 200". */
  total?: number
  /** Force a status for docs and previews. Normally derived from loading, hasMore and error. */
  status?: InfiniteScrollStatus
  /** Load automatically when the sentinel nears the viewport. Load more always stays available. */
  autoLoad?: boolean
  /** How far before the end the next batch starts loading. Default is 200px below the scroll area. */
  rootMargin?: string
  /** Return the scrolling ancestor to observe against. Defaults to the viewport. */
  getScrollParent?: () => Element | null
  /** Custom placeholder for the slots that are loading. */
  skeleton?: ReactNode
  /** Number of placeholder rows in the default skeleton. */
  skeletonCount?: number
  /** Content pinned at the end of the scroll area so it stays reachable while the list keeps growing. */
  footer?: ReactNode
  /** What the items are called, for announcements. */
  itemLabel?: string
  loadMoreLabel?: string
  retryLabel?: string
  endLabel?: string
}

const DEFAULT_ERROR = "Couldn't load more items. Check your connection, then try again."
const isDev = () => typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'

/**
 * Loads more content as the user scrolls. Always offers a Load more button as the keyboard alternative,
 * announces new content politely and never moves focus on its own.
 */
export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>(function InfiniteScroll(
  {
    children, onLoadMore, loading = false, hasMore = true, error, count, total, status, autoLoad = true, rootMargin = '0px 0px 200px 0px', getScrollParent,
    skeleton, skeletonCount = 3, footer, itemLabel = 'items', loadMoreLabel = 'Load more', retryLabel = 'Try again', endLabel = 'You have reached the end',
    className, ...rest
  },
  ref,
) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLButtonElement>(null)
  const endRef = useRef<HTMLParagraphElement>(null)
  const userAction = useRef(false)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore
  const wasLoading = useRef(false)
  const countAtStart = useRef(count ?? 0)
  const [justLoaded, setJustLoaded] = useState(false)
  const [announce, setAnnounce] = useState('')

  const derived: InfiniteScrollStatus = error ? 'error' : loading ? 'loading' : hasMore ? 'idle' : 'end'
  const phase: InfiniteScrollStatus = status ?? (derived === 'idle' && justLoaded ? 'loaded' : derived)
  const canLoad = !error && !loading && hasMore
  const errorText = typeof error === 'string' ? error : DEFAULT_ERROR
  const n = (v: number) => v.toLocaleString()

  // Track a finished batch: show the loaded state briefly and announce it. Never move focus.
  useEffect(() => {
    if (loading && !wasLoading.current) countAtStart.current = count ?? 0
    if (!loading && wasLoading.current && !error) {
      const added = (count ?? 0) - countAtStart.current
      setJustLoaded(true)
      if (hasMore) setAnnounce(`${added > 0 ? `${n(added)} more ${itemLabel}` : `More ${itemLabel}`} loaded.${total != null && count != null ? ` Showing ${n(count)} of ${n(total)}.` : ''}`)
      const t = setTimeout(() => setJustLoaded(false), 1500)
      wasLoading.current = loading
      return () => clearTimeout(t)
    }
    wasLoading.current = loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])
  useEffect(() => {
    if (phase === 'end') setAnnounce(`${endLabel}.${count != null ? ` ${n(count)} ${itemLabel} loaded.` : ''}`)
    else if (phase === 'error') setAnnounce(errorText)
    else if (phase === 'loading') setAnnounce(`Loading more ${itemLabel}.`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'end', phase === 'error', phase === 'loading'])

  // Auto load: observe the sentinel. Recreated after every batch so a sentinel that is still visible loads the next one.
  useEffect(() => {
    if (!autoLoad || !canLoad || status || typeof IntersectionObserver === 'undefined') return
    const node = sentinelRef.current
    if (!node) return
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) onLoadMoreRef.current() },
      { root: getScrollParent?.() ?? null, rootMargin, threshold: 0 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [autoLoad, canLoad, status, count, rootMargin, getScrollParent])

  // Small datasets should use a plain list or pagination.
  const warned = useRef(false)
  useEffect(() => {
    if (!isDev() || warned.current) return
    const known = total ?? (phase === 'end' ? count : undefined)
    if (known != null && known < 50) {
      warned.current = true
      console.warn(`InfiniteScroll: only ${known} items. Infinite scroll is for 50 or more. Use a plain list or pagination instead.`)
    }
  }, [total, count, phase])

  // When the control the user just used disappears (Retry, or the last Load more), give focus to the nearest stable element.
  // Only when focus was lost. Never steals focus from somewhere else.
  useEffect(() => {
    if (!userAction.current) return
    const lost = !document.activeElement || document.activeElement === document.body
    if (lost) (phase === 'end' ? endRef.current : loadMoreRef.current)?.focus()
    if (phase !== 'loading') userAction.current = false
  }, [phase])

  const loadNow = () => { userAction.current = true; onLoadMoreRef.current() }
  const countText = count != null ? (total != null ? `Showing ${n(count)} of ${n(total)}` : `Showing ${n(count)}`) : null

  return (
    <div ref={ref} className={cx(styles.root, className)} data-status={phase} aria-busy={phase === 'loading' || undefined} {...rest}>
      <div className={styles.content}>{children}</div>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <div className={styles.status}>
        {phase === 'loading' ? (
          <>
            <div className={styles.skeleton} aria-hidden="true">
              {skeleton ?? (
                <SkeletonLoader variant="custom" label={`Loading more ${itemLabel}`}>
                  {Array.from({ length: Math.max(1, skeletonCount) }, (_, i) => <SkeletonText key={i} lines={2} />)}
                </SkeletonLoader>
              )}
            </div>
            <Spinner size="small" accessibleLabel={`Loading more ${itemLabel}`} />
          </>
        ) : null}
        {phase === 'error' ? (
          <div className={styles.errorRow} role="group" aria-label="Loading failed">
            <span className={styles.errorText}>
              <span className={styles.icon} aria-hidden="true"><Icon name="error" /></span>
              <span>{errorText}</span>
            </span>
            <Button ref={loadMoreRef} size="small" priority="secondary" icon={<Icon name="refresh" />} onClick={loadNow}>{retryLabel}</Button>
          </div>
        ) : null}
        {phase === 'end' ? (
          <p ref={endRef} tabIndex={-1} className={styles.end}>
            <span className={styles.icon} aria-hidden="true"><Icon name="check" /></span>
            {endLabel}
          </p>
        ) : null}
        {phase === 'idle' || phase === 'loaded' || phase === 'loading' ? (
          <Button
            ref={loadMoreRef}
            size="small"
            priority="secondary"
            disabled={phase === 'loading'}
            unavailableReason={phase === 'loading' ? `Loading more ${itemLabel}.` : undefined}
            onClick={loadNow}
          >
            {loadMoreLabel}
          </Button>
        ) : null}
        {countText ? <p className={styles.count}>{countText}</p> : null}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
    </div>
  )
})
