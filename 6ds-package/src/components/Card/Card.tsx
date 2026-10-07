import {
  Children, createContext, forwardRef, isValidElement, useContext, useEffect, useId,
  type AnchorHTMLAttributes, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { DataMetric, type DataMetricProps } from '../DataMetric'
import { SkeletonBlock, SkeletonLoader } from '../SkeletonLoader'
import styles from './Card.module.css'

const CardContext = createContext(false)

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> {
  /** basic: content container. metric: composes DataMetric as the body. */
  variant?: 'basic' | 'metric'
  /** Dense layout for lists and grids. */
  compact?: boolean
  /** Card title. Rendered as a heading. When the card is clickable, the title is the one accessible name. */
  title?: ReactNode
  /** Heading level for the title. Pick the level that fits the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  subtitle?: ReactNode
  /** Slot at the end of the header, for example a menu or badge. Sits above the clickable layer. */
  headerAction?: ReactNode
  /** Image or chart area above the header. */
  media?: ReactNode
  /** Props for the DataMetric body when `variant="metric"`. */
  metric?: DataMetricProps
  /** Left side of the footer, for example metadata. */
  footer?: ReactNode
  /** Right side of the footer: action buttons. */
  actions?: ReactNode
  /** Makes the whole card a link. */
  href?: string
  /** Props for the link when `href` is set, for example `target` or `rel`. */
  linkProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>
  /** Makes the whole card a button when there is no `href`. */
  onClick?: (event: MouseEvent<HTMLElement>) => void
  /** Accessible name for a clickable card that has no `title`. */
  linkLabel?: string
  /** Selected in a multi-select context. Shown with a border change and a check mark, not color alone. */
  selected?: boolean
  /** Skeleton that matches the layout. */
  loading?: boolean
  /** Shows a toggle that reveals `details`. */
  expandable?: boolean
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Content revealed when expanded. */
  details?: ReactNode
  /** Accessible name for the expand toggle. State is announced through aria-expanded. */
  expandLabel?: string
  /** Body content. */
  children?: ReactNode
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'basic', compact = false, title, headingLevel = 3, subtitle, headerAction, media, metric, footer, actions,
    href, linkProps, onClick, linkLabel, selected = false, loading = false, expandable = false, expanded, defaultExpanded = false,
    onExpandedChange, details, expandLabel = 'Details', className, children, ...rest
  },
  ref,
) {
  const uid = useId()
  const nested = useContext(CardContext)
  const [open, setOpen] = useControllableState<boolean>(expanded, defaultExpanded, onExpandedChange)
  const interactive = Boolean(href || onClick)
  const Heading = `h${headingLevel}` as 'h2'

  useEffect(() => {
    if (nested && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn('Card: cards must not be nested inside other cards. Use a section, list or Divider inside the card instead.')
    }
  }, [nested])
  useEffect(() => {
    if (interactive && !title && !linkLabel && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn('Card: a clickable card needs a `title` or `linkLabel` so it has one accessible name.')
    }
  }, [interactive, title, linkLabel])

  const name = title ?? (linkLabel ? <VisuallyHidden>{linkLabel}</VisuallyHidden> : null)
  const stretch = href
    ? <a {...linkProps} href={href} className={cx(styles.stretch, linkProps?.className)} aria-current={selected ? 'true' : undefined} onClick={onClick}>{name}</a>
    : onClick
      ? <button type="button" className={styles.stretch} aria-pressed={selected} onClick={onClick}>{name}</button>
      : null
  const hasHeader = Boolean(title || subtitle || headerAction || stretch)
  const hasFooter = Boolean(footer || actions)
  const detailsId = `${uid}-details`
  const metricBody = variant === 'metric' && metric ? <DataMetric {...metric} /> : null

  const rootProps = {
    ref,
    className: cx(styles.root, className),
    'data-compact': compact || undefined,
    'data-interactive': interactive || undefined,
    'data-selected': selected || undefined,
    'data-expanded': expandable && open ? true : undefined,
    'data-variant': variant,
    ...rest,
  }

  return (
    <CardContext.Provider value>
      {loading ? (
        <div {...rootProps} data-loading="true">
          <SkeletonLoader
            variant="custom"
            label={typeof title === 'string' ? `Loading ${title}` : 'Loading card'}
            className={styles.skeleton}
            placeholder={
              <>
                {media ? <SkeletonBlock height="var(--component-skeletonLoader-all-shape-heightBlock)" /> : null}
                {hasHeader ? <SkeletonBlock width="55%" height="var(--component-skeletonLoader-all-shape-heightBlock)" /> : null}
                {variant === 'metric' ? (
                  <>
                    <SkeletonBlock width="35%" height="var(--component-skeletonLoader-all-shape-heightText)" />
                    <SkeletonBlock width="50%" height="var(--component-skeletonLoader-all-shape-heightBlock)" />
                  </>
                ) : (
                  <>
                    <SkeletonBlock height="var(--component-skeletonLoader-all-shape-heightText)" />
                    <SkeletonBlock width="80%" height="var(--component-skeletonLoader-all-shape-heightText)" />
                  </>
                )}
                {hasFooter ? <SkeletonBlock width="40%" height="var(--component-skeletonLoader-all-shape-heightBlock)" /> : null}
              </>
            }
          />
        </div>
      ) : (
        <div {...rootProps}>
          {media ? <div className={styles.media}>{media}</div> : null}
          <div className={styles.content}>
            {hasHeader ? (
              <div className={styles.header}>
                <div className={styles.headings}>
                  {stretch || title ? <Heading className={styles.title}>{stretch ?? title}</Heading> : null}
                  {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
                </div>
                {selected ? (
                  <span className={styles.mark}>
                    <Icon name="check" />
                    {!interactive ? <VisuallyHidden>Selected</VisuallyHidden> : null}
                  </span>
                ) : null}
                {expandable ? (
                  <span className={styles.above}>
                    <Button
                      priority="tertiary" size="small" iconOnly icon={<Icon name={open ? 'chevronUp' : 'chevronDown'} />}
                      aria-label={expandLabel} aria-expanded={open} aria-controls={detailsId}
                      onClick={() => setOpen(!open)}
                    />
                  </span>
                ) : null}
                {headerAction ? <div className={styles.above}>{headerAction}</div> : null}
              </div>
            ) : null}
            {metricBody ?? (children != null ? <div className={styles.body}>{children}</div> : null)}
            {expandable ? (
              <div id={detailsId} className={cx(styles.details, styles.above)} hidden={!open}>{details}</div>
            ) : null}
            {hasFooter ? (
              <div className={cx(styles.footer, styles.above)}>
                {footer ? <div className={styles.footerMeta}>{footer}</div> : null}
                {actions ? <div className={styles.actions}>{actions}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </CardContext.Provider>
  )
})

/* ---- CardGrid: list or landmark semantics for a group of cards ---- */

export interface CardGridProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** list: a list of cards (default). region: a labelled landmark, for cards that act as navigation. */
  semantics?: 'list' | 'region'
  /** Accessible name for the group. Required. */
  label: string
  compact?: boolean
  /** Minimum card width before the grid wraps, as a CSS length. */
  minItemWidth?: string
  children?: ReactNode
}

export const CardGrid = forwardRef<HTMLElement, CardGridProps>(function CardGrid(
  { semantics = 'list', label, compact = false, minItemWidth, className, style, children, ...rest },
  ref,
) {
  const merged = { ...(minItemWidth ? { ['--_min' as string]: minItemWidth } : null), ...style } as CSSProperties
  const items = Children.toArray(children).filter(isValidElement)
  if (semantics === 'region') {
    return (
      <section ref={ref} aria-label={label} className={cx(styles.grid, className)} data-compact={compact || undefined} style={merged} {...rest}>
        {items}
      </section>
    )
  }
  return (
    <ul ref={ref as React.Ref<HTMLUListElement>} role="list" aria-label={label} className={cx(styles.grid, styles.list, className)} data-compact={compact || undefined} style={merged} {...(rest as HTMLAttributes<HTMLUListElement>)}>
      {items.map((child, i) => <li key={child.key ?? i} className={styles.cell}>{child}</li>)}
    </ul>
  )
})
