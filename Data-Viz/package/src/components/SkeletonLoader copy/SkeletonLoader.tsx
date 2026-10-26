import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import styles from './SkeletonLoader.module.css'

/* ---- Composable shapes. Decorative: hidden from assistive tech. Put them inside a SkeletonLoader (variant="custom") or any container that carries aria-busy. ---- */

export interface SkeletonBlockProps extends HTMLAttributes<HTMLSpanElement> {
  /** CSS width, for example "100%" or "8rem". Defaults to the full width. */
  width?: string | number
  /** CSS height. Defaults to the block height token. */
  height?: string | number
  /** circle is for avatars, rect for images and cards. */
  shape?: 'rect' | 'circle'
}
export const SkeletonBlock = forwardRef<HTMLSpanElement, SkeletonBlockProps>(function SkeletonBlock(
  { width, height, shape = 'rect', className, style, ...rest },
  ref,
) {
  const dim: CSSProperties = { ...(width != null ? { inlineSize: width } : null), ...(height != null ? { blockSize: height } : null), ...style }
  return <span ref={ref} aria-hidden="true" className={cx(styles.shape, styles.block, className)} data-shape={shape} style={dim} {...rest} />
})

export interface SkeletonTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Number of lines. The last line is shorter so it reads like a paragraph. */
  lines?: number
}
export const SkeletonText = forwardRef<HTMLSpanElement, SkeletonTextProps>(function SkeletonText(
  { lines = 3, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} aria-hidden="true" className={cx(styles.text, className)} {...rest}>
      {Array.from({ length: Math.max(1, lines) }, (_, i) => (
        <span key={i} className={cx(styles.shape, styles.line)} data-last={i === lines - 1 && lines > 1 ? true : undefined} />
      ))}
    </span>
  )
})

/* ---- Container ---- */

export interface SkeletonLoaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** text: lines. card: card shape with media and text. table: rows and columns. custom: your own layout from SkeletonBlock and SkeletonText. */
  variant?: 'text' | 'card' | 'table' | 'custom'
  /** Lines for text and card variants. */
  lines?: number
  /** Rows and columns for the table variant. */
  rows?: number
  columns?: number
  /** Accessible name while loading. */
  label?: string
  /** Set to false to swap in `children` (the loaded content) with a short fade. */
  loading?: boolean
  /** custom: the placeholder layout. Other variants: the loaded content shown when loading is false. */
  children?: ReactNode
  /** Loaded content for custom, when the placeholder layout is passed as `placeholder`. */
  placeholder?: ReactNode
  /** Announced politely when content replaces the skeleton. */
  loadedLabel?: string
}

export const SkeletonLoader = forwardRef<HTMLDivElement, SkeletonLoaderProps>(function SkeletonLoader(
  { variant = 'text', lines = 3, rows = 4, columns = 3, label = 'Loading content', loading = true, loadedLabel = 'Content loaded', placeholder, className, children, ...rest },
  ref,
) {
  if (!loading) {
    return (
      <div ref={ref} className={cx(styles.loaded, className)} aria-busy="false" {...rest}>
        <VisuallyHidden role="status">{loadedLabel}</VisuallyHidden>
        {children}
      </div>
    )
  }
  // For custom, children is the placeholder unless `placeholder` is given (then children is the loaded content).
  const layout = variant === 'custom' ? (placeholder ?? children) : null
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={cx(styles.root, className)}
      data-variant={variant}
      {...rest}
    >
      {variant === 'text' ? <SkeletonText lines={lines} /> : null}
      {variant === 'card' ? (
        <>
          <SkeletonBlock height="var(--component-skeletonLoader-all-shape-heightBlock)" />
          <SkeletonText lines={Math.min(lines, 3)} />
        </>
      ) : null}
      {variant === 'table' ? (
        <div className={styles.table} aria-hidden="true">
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className={styles.row} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }, (_, c) => <span key={c} className={cx(styles.shape, styles.cell)} />)}
            </div>
          ))}
        </div>
      ) : null}
      {variant === 'custom' ? layout : null}
    </div>
  )
})
