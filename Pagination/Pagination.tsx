import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Spinner } from '../Spinner'
import { SkeletonBlock } from '../SkeletonLoader'
import { Select } from '../Select'
import styles from './Pagination.module.css'

export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i)

/**
 * Page numbers with ellipsis truncation, for example 1 2 3 ... 98 99 100 with boundaryCount 3.
 * The list always has the same number of slots, so the control does not jump while paging.
 */
export function getPageItems(page: number, count: number, siblingCount = 1, boundaryCount = 1): PaginationItem[] {
  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)
  const siblingsStart = Math.max(Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2)
  const siblingsEnd = Math.min(Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2), endPages.length > 0 ? endPages[0] - 2 : count - 1)
  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2 ? (['start-ellipsis'] as const) : boundaryCount + 1 < count - boundaryCount ? [boundaryCount + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1 ? (['end-ellipsis'] as const) : count - boundaryCount > boundaryCount ? [count - boundaryCount] : []),
    ...endPages,
  ]
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  /** Current page, 1-based. Controlled. */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Total number of results across all pages. */
  total: number
  pageSize?: number
  /** Show a page-size select. Called with the new size. The page returns to 1. */
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  /** default: numbered pages with previous and next. mini: previous, "Page X of Y" and next, for tight spaces. */
  variant?: 'default' | 'mini'
  /** Page numbers shown on each side of the current page. */
  siblingCount?: number
  /** Page numbers always shown at the start and the end. */
  boundaryCount?: number
  /** Show "Showing 1 to 20 of 500 results". Defaults to true, except in the mini variant. */
  showResultCount?: boolean
  /** Noun for the result count. */
  resultLabel?: string
  /** A page is loading. Controls stay visible but inactive, and the count shows a placeholder. */
  loading?: boolean
  /** Render the page-size list in place instead of document.body (docs frames). */
  portal?: boolean
  /** Force visual states on controls for docs and previews, keyed by page number, "prev" or "next". Do not use in product code. */
  pageStates?: Partial<Record<number | 'prev' | 'next', 'hover' | 'pressed' | 'focus'>>
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page: pageProp, defaultPage = 1, onPageChange, total, pageSize = 20, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100], variant = 'default', siblingCount = 1, boundaryCount = 1,
    showResultCount, resultLabel = 'results', loading = false, portal = true, pageStates, className, ...rest
  },
  ref,
) {
  const uid = useId()
  const mini = variant === 'mini'
  const count = Math.max(1, Math.ceil(total / pageSize))
  const [raw, setPage] = useControllableState<number>(pageProp, defaultPage, onPageChange)
  const page = Math.min(Math.max(1, raw), count)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const [announce, setAnnounce] = useState('')
  const last = useRef(page)
  const showCount = showResultCount ?? !mini

  // Announce page changes politely. Not on first render.
  useEffect(() => {
    if (last.current === page) return
    last.current = page
    setAnnounce(`Page ${page} of ${count}. Showing ${from} to ${to} of ${total} ${resultLabel}.`)
  }, [page, count, from, to, total, resultLabel])

  const go = (next: number) => {
    if (loading || next < 1 || next > count || next === page) return
    setPage(next)
  }
  const atStart = page <= 1
  const atEnd = page >= count
  const items = getPageItems(page, count, siblingCount, boundaryCount)
  const countId = `${uid}-count`

  const nav = (kind: 'prev' | 'next') => {
    const disabled = kind === 'prev' ? atStart : atEnd
    return (
      <li>
        <button
          type="button"
          className={styles.page}
          aria-label={kind === 'prev' ? 'Previous page' : 'Next page'}
          aria-disabled={disabled || loading || undefined}
          data-state={pageStates?.[kind]}
          onClick={() => go(kind === 'prev' ? page - 1 : page + 1)}
        >
          <span className={styles.icon} aria-hidden="true"><Icon name={kind === 'prev' ? 'chevronLeft' : 'chevronRight'} /></span>
        </button>
      </li>
    )
  }

  return (
    <nav
      ref={ref}
      aria-label="Pagination"
      aria-busy={loading || undefined}
      aria-describedby={showCount ? countId : undefined}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-loading={loading || undefined}
      {...rest}
    >
      {showCount ? (
        <p id={countId} className={styles.count}>
          {loading ? (
            <>
              <SkeletonBlock width="14rem" height="1em" />
              <VisuallyHidden>Loading results</VisuallyHidden>
            </>
          ) : `Showing ${from} to ${to} of ${total} ${resultLabel}`}
        </p>
      ) : null}
      {onPageSizeChange && !mini ? (
        <div className={styles.size}>
          <Select
            label="Results per page"
            hideLabel
            size="small"
            portal={portal}
            items={pageSizeOptions.map((n) => ({ value: String(n), label: `${n} per page` }))}
            value={String(pageSize)}
            onValueChange={(v) => { onPageSizeChange(Number(v)); setPage(1) }}
          />
        </div>
      ) : null}
      <div className={styles.container}>
        <ul className={styles.list}>
          {nav('prev')}
          {mini ? (
            <li className={styles.status}>Page {page} of {count}</li>
          ) : items.map((item) => (
            typeof item === 'number' ? (
              <li key={item}>
                <button
                  type="button"
                  className={styles.page}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  aria-disabled={(loading && item !== page) || undefined}
                  data-state={pageStates?.[item]}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} className={styles.ellipsis} aria-hidden="true">…</li>
            )
          ))}
          {nav('next')}
        </ul>
        {loading ? <span className={styles.spinner}><Spinner size="small" accessibleLabel="Loading page" /></span> : null}
      </div>
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
    </nav>
  )
})
