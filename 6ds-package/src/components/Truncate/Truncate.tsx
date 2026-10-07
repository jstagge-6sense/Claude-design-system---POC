import { forwardRef, useId, useState, type CSSProperties, type ElementType, type HTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import styles from './Truncate.module.css'

export interface TruncateProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The full text. Always reachable: it stays in the DOM (or in a hidden copy) and in `title`. */
  children: string
  /** Lines to show before cutting with an ellipsis. 1 is single-line. */
  lines?: number
  /** Middle truncation for file paths, URLs and ids: shows the start and the last `endChars` characters. Single-line only. */
  middle?: boolean
  /** Characters kept at the end for middle truncation. */
  endChars?: number
  /** Adds a "Show more" and "Show less" toggle, so the full text is reachable by touch and keyboard, not only on hover. */
  expandable?: boolean
  /** Controlled expanded state. */
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Labels for the toggle. */
  showMoreLabel?: string
  showLessLabel?: string
  /** Element to render. */
  as?: ElementType
}

export const Truncate = forwardRef<HTMLElement, TruncateProps>(function Truncate(
  {
    children, lines = 1, middle = false, endChars = 10, expandable = false, expanded: expandedProp, onExpandedChange,
    showMoreLabel = 'Show more', showLessLabel = 'Show less', as, className, style, title, ...rest
  },
  ref,
) {
  const Tag = (as ?? 'span') as ElementType
  const [inner, setInner] = useState(false)
  const isControlled = expandedProp !== undefined
  const expanded = isControlled ? expandedProp : inner
  const bodyId = useId()
  const toggle = () => {
    const next = !expanded
    if (!isControlled) setInner(next)
    onExpandedChange?.(next)
  }
  const clamp = Math.max(1, Math.floor(lines))
  const useMiddle = middle && clamp === 1 && !expanded
  const mode = expanded ? 'expanded' : useMiddle ? 'middle' : clamp > 1 ? 'multi' : 'single'
  const text = children
  const cut = Math.min(Math.max(1, endChars), Math.max(0, text.length - 1))
  const vars = { '--_lines': clamp } as CSSProperties

  return (
    <Tag
      ref={ref}
      className={cx(styles.root, className)}
      data-mode={mode}
      title={title ?? text}
      style={{ ...vars, ...style }}
      {...rest}
    >
      <span id={bodyId} className={styles.body}>
        {useMiddle ? (
          <>
            <span className={styles.start} aria-hidden="true">{text.slice(0, text.length - cut)}</span>
            <span className={styles.end} aria-hidden="true">{text.slice(text.length - cut)}</span>
            <VisuallyHidden>{text}</VisuallyHidden>
          </>
        ) : text}
      </span>
      {expandable ? (
        <button type="button" className={styles.toggle} aria-expanded={expanded} aria-controls={bodyId} onClick={toggle}>
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      ) : null}
    </Tag>
  )
})
