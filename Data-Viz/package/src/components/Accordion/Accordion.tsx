import {
  Children, Fragment, createContext, forwardRef, isValidElement, useCallback, useContext, useEffect, useId, useMemo,
  type HTMLAttributes, type ReactElement, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { SkeletonLoader } from '../SkeletonLoader'
import styles from './Accordion.module.css'

interface AccordionContextValue {
  baseId: string
  headingLevel: 2 | 3 | 4 | 5 | 6
  checkbox: boolean
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
  isChecked: (value: string) => boolean
  setChecked: (value: string, checked: boolean) => void
}
const AccordionContext = createContext<AccordionContextValue | null>(null)

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** multiple (default): any number of panels can be open. single: opening one closes the others. */
  type?: 'single' | 'multiple'
  /** Single only: allow closing the open panel. Defaults to true. */
  collapsible?: boolean
  /** Open item values (controlled). */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Adds a selection checkbox to every item, for filter sets. */
  checkbox?: boolean
  /** Checked item values (controlled). Only with `checkbox`. */
  checkedValues?: string[]
  defaultCheckedValues?: string[]
  onCheckedChange?: (values: string[]) => void
  /** Shows an expand all and collapse all control. Multiple only. */
  expandAll?: boolean
  /** Heading level for item headers. Pick the level that fits the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** AccordionItem elements. Items must be direct children so expand all can find them. */
  children?: ReactNode
}

/** Flatten fragments so items inside <>...</> are still found by expand all. */
function flatten(children: ReactNode): ReactElement[] {
  return Children.toArray(children).flatMap((c) => (isValidElement(c) ? (c.type === Fragment ? flatten((c.props as { children?: ReactNode }).children) : [c]) : []))
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    type = 'multiple', collapsible = true, value, defaultValue, onValueChange, checkbox = false, checkedValues, defaultCheckedValues,
    onCheckedChange, expandAll = false, headingLevel = 3, className, children, ...rest
  },
  ref,
) {
  const baseId = useId()
  const parent = useContext(AccordionContext)
  const [open, setOpen] = useControllableState<string[]>(value, defaultValue ?? [], onValueChange)
  const [checked, setCheckedValues] = useControllableState<string[]>(checkedValues, defaultCheckedValues ?? [], onCheckedChange)

  useEffect(() => {
    if (parent && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn('Accordion: accordions must not be nested. Rethink the information architecture or use sections inside the panel.')
    }
  }, [parent])
  useEffect(() => {
    if (expandAll && type === 'single' && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn('Accordion: expand all is only available for type="multiple".')
    }
  }, [expandAll, type])

  const toggle = useCallback((v: string) => {
    const isOpen = open.includes(v)
    if (type === 'single') {
      if (isOpen) { if (collapsible) setOpen([]) } else setOpen([v])
    } else {
      setOpen(isOpen ? open.filter((x) => x !== v) : [...open, v])
    }
  }, [open, type, collapsible, setOpen])

  const ctx = useMemo<AccordionContextValue>(() => ({
    baseId,
    headingLevel,
    checkbox,
    isOpen: (v) => open.includes(v),
    toggle,
    isChecked: (v) => checked.includes(v),
    setChecked: (v, on) => setCheckedValues(on ? [...checked.filter((x) => x !== v), v] : checked.filter((x) => x !== v)),
  }), [baseId, headingLevel, checkbox, open, toggle, checked, setCheckedValues])

  const enabled = flatten(children)
    .map((c) => c.props as AccordionItemProps)
    .filter((p) => typeof p.value === 'string' && !p.disabled)
    .map((p) => p.value)
  const allOpen = enabled.length > 0 && enabled.every((v) => open.includes(v))

  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      {expandAll && type === 'multiple' ? (
        <div className={styles.toolbar}>
          <Button
            priority="tertiary" size="small"
            icon={<Icon name={allOpen ? 'chevronUp' : 'chevronDown'} />}
            onClick={() => setOpen(allOpen ? open.filter((v) => !enabled.includes(v)) : Array.from(new Set([...open, ...enabled])))}
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </Button>
        </div>
      ) : null}
      <AccordionContext.Provider value={ctx}>
        <div className={styles.group}>{children}</div>
      </AccordionContext.Provider>
    </div>
  )
})

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Unique value within the accordion. */
  value: string
  /** Header text. Keep it short and descriptive. */
  title: ReactNode
  /** Plain-text title for the checkbox name when `title` is not a string. */
  titleText?: string
  /** Secondary line under the title. */
  description?: ReactNode
  /** Slot before the expand indicator, for a count or badge. */
  meta?: ReactNode
  /** Not expandable and not interactive. Stays focusable and says why through aria-disabled. */
  disabled?: boolean
  /** Shows a skeleton in the panel while async content loads. */
  loading?: boolean
  /** Overrides the accordion `checkbox` setting for this item. */
  checkbox?: boolean
  /** Partial selection for the checkbox (a group with some children selected). */
  indeterminate?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
  children?: ReactNode
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, title, titleText, description, meta, disabled = false, loading = false, checkbox, indeterminate = false, className, children, ...rest },
  ref,
) {
  const ctx = useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionItem must be rendered inside an Accordion.')
  const open = ctx.isOpen(value) && !disabled
  const triggerId = `${ctx.baseId}-${value}-trigger`
  const panelId = `${ctx.baseId}-${value}-panel`
  const Heading = `h${ctx.headingLevel}` as 'h3'
  const showCheckbox = checkbox ?? ctx.checkbox
  const plain = titleText ?? (typeof title === 'string' ? title : value)

  return (
    <div ref={ref} className={cx(styles.item, className)} data-open={open || undefined} data-disabled={disabled || undefined} {...rest}>
      <Heading className={styles.heading}>
        {showCheckbox ? (
          <span className={styles.check}>
            <Checkbox
              label={<VisuallyHidden>Select {plain}</VisuallyHidden>}
              checked={ctx.isChecked(value)}
              indeterminate={indeterminate}
              disabled={disabled}
              onChange={(e) => ctx.setChecked(value, e.target.checked)}
            />
          </span>
        ) : null}
        <button
          type="button"
          id={triggerId}
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          aria-disabled={disabled || undefined}
          onClick={() => { if (!disabled) ctx.toggle(value) }}
        >
          <span className={styles.text}>
            <span className={styles.title}>{title}</span>
            {description ? <span className={styles.description}>{description}</span> : null}
          </span>
          {meta ? <span className={styles.meta}>{meta}</span> : null}
          <span className={styles.indicator} aria-hidden="true"><Icon name="chevronDown" /></span>
        </button>
      </Heading>
      <div id={panelId} role="region" aria-labelledby={triggerId} aria-busy={loading || undefined} className={styles.panel} hidden={!open}>
        <div className={styles.panelInner}>
          {loading ? <SkeletonLoader variant="text" lines={3} label={`Loading ${plain}`} /> : children}
        </div>
      </div>
    </div>
  )
})
