import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import styles from './Divider.module.css'

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  orientation?: 'horizontal' | 'vertical'
  /** Centered text on a horizontal divider, such as "or" or a section name. */
  label?: ReactNode
  /** Indent the start edge so the line aligns with content, not the container edge. Horizontal only. */
  inset?: boolean
  /** Purely visual: hides the divider from assistive tech. Leave false when it separates meaningful groups. */
  decorative?: boolean
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = 'horizontal', label, inset = false, decorative = false, className, ...rest },
  ref,
) {
  const vertical = orientation === 'vertical'
  const hasLabel = label != null && label !== '' && !vertical
  return (
    <div
      ref={ref}
      className={cx(styles.root, className)}
      data-orientation={orientation}
      data-inset={inset && !vertical && !hasLabel ? true : undefined}
      data-labelled={hasLabel ? true : undefined}
      role={decorative ? undefined : 'separator'}
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative || !vertical ? undefined : 'vertical'}
      {...rest}
    >
      {hasLabel ? <span className={styles.label}>{label}</span> : null}
    </div>
  )
})
