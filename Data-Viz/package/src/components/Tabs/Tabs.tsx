import {
  createContext, forwardRef, useCallback, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { Spinner } from '../Spinner'
import styles from './Tabs.module.css'

type Variant = 'standard' | 'filled' | 'compact' | 'vertical'

interface TabsContextValue {
  baseId: string
  value: string | undefined
  setValue: (v: string) => void
  variant: Variant
  orientation: 'horizontal' | 'vertical'
  activation: 'automatic' | 'manual'
  lazy: boolean
  scrollable: boolean
  announce: (message: string) => void
}
const TabsContext = createContext<TabsContextValue | null>(null)
const useTabs = (part: string) => {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error(`${part} must be used inside <Tabs>`)
  return ctx
}
const safe = (v: string) => v.replace(/\s+/g, '-')
const tabId = (ctx: TabsContextValue, v: string) => `${ctx.baseId}-tab-${safe(v)}`
const panelId = (ctx: TabsContextValue, v: string) => `${ctx.baseId}-panel-${safe(v)}`

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected tab. */
  value?: string
  /** Uncontrolled initial tab. Falls back to the first enabled tab. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** standard: underline. filled: grouped container with a filled selected tab. compact: dense underline. vertical: side-mounted, rare. */
  variant?: Variant
  /** automatic selects on arrow focus. manual selects with Enter or Space. */
  activation?: 'automatic' | 'manual'
  /** Mount a panel only when its tab is first selected. A panel can override this. */
  lazy?: boolean
  /** Many tabs: scroll horizontally with scroll buttons. Tabs never wrap. Ignored for the vertical variant. */
  scrollable?: boolean
  children?: ReactNode
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, variant = 'standard', activation = 'automatic', lazy = false, scrollable = false, className, children, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined)
  const baseId = useId()
  const [message, setMessage] = useState('')
  const orientation = variant === 'vertical' ? 'vertical' : 'horizontal'
  const announce = useCallback((m: string) => setMessage(m), [])
  const ctx: TabsContextValue = {
    baseId, value: current, setValue: (v) => setCurrent(v), variant, orientation, activation, lazy,
    scrollable: scrollable && orientation === 'horizontal', announce,
  }
  return (
    <div ref={ref} className={cx(styles.root, className)} data-variant={variant} data-orientation={orientation} data-scrollable={scrollable && orientation === 'horizontal' ? true : undefined} {...rest}>
      <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>
      <VisuallyHidden role="status" aria-live="polite">{message}</VisuallyHidden>
    </div>
  )
})

export interface TabListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Accessible name for the tab list. Pass this or aria-labelledby. */
  'aria-label'?: string
  children?: ReactNode
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList({ className, children, onKeyDown, ...rest }, ref) {
  const ctx = useTabs('TabList')
  const listRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const scrollable = ctx.scrollable
  const [edges, setEdges] = useState({ start: false, end: false })

  // With no selection, select the first enabled tab so one tab is always in the tab order.
  useEffect(() => {
    if (ctx.value !== undefined) return
    const first = listRef.current?.querySelector<HTMLElement>('[role="tab"]:not([aria-disabled="true"])')
    if (first?.dataset.value) ctx.setValue(first.dataset.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.value])

  // Scroll buttons appear only when the tabs overflow.
  useEffect(() => {
    const el = scrollerRef.current
    if (!scrollable || !el) return
    const update = () => {
      const left = Math.abs(el.scrollLeft)
      setEdges({ start: left > 1, end: left + el.clientWidth < el.scrollWidth - 1 })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(el)
    if (listRef.current) ro?.observe(listRef.current)
    return () => { el.removeEventListener('scroll', update); ro?.disconnect() }
  }, [scrollable])

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.75, behavior: 'smooth' })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const tabs = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
    const i = tabs.indexOf(document.activeElement as HTMLElement)
    if (i < 0 || tabs.length === 0) return
    const rtl = getComputedStyle(listRef.current as Element).direction === 'rtl'
    const vertical = ctx.orientation === 'vertical'
    const nextKey = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const prevKey = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    let n = -1
    if (e.key === nextKey) n = (i + 1) % tabs.length
    else if (e.key === prevKey) n = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = tabs.length - 1
    else return
    e.preventDefault()
    tabs[n].focus()
    // Disabled tabs can be focused to read why they are unavailable, but never selected.
    if (ctx.activation === 'automatic' && tabs[n].getAttribute('aria-disabled') !== 'true' && tabs[n].dataset.value) ctx.setValue(tabs[n].dataset.value)
  }

  const list = (
    <div
      ref={mergeRefs(ref, listRef)}
      role="tablist"
      aria-orientation={ctx.orientation}
      className={cx(styles.list, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  )
  if (!scrollable) return list
  return (
    <div className={styles.scrollWrap}>
      {edges.start ? <Button priority="tertiary" size="small" iconOnly icon={<Icon name="chevronLeft" />} aria-label="Scroll tabs toward the start" onClick={() => scrollBy(-1)} /> : null}
      <div ref={scrollerRef} className={styles.scroller}>{list}</div>
      {edges.end ? <Button priority="tertiary" size="small" iconOnly icon={<Icon name="chevronRight" />} aria-label="Scroll tabs toward the end" onClick={() => scrollBy(1)} /> : null}
    </div>
  )
})

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'role'> {
  /** Ties the tab to its TabPanel. */
  value: string
  /** Leading icon slot (INSTANCE_SWAP). */
  icon?: ReactNode
  /** Count or status shown after the label, for example 12. */
  badge?: ReactNode
  /** Disabled tabs stay focusable so people can read why. They use aria-disabled and never select. */
  disabled?: boolean
  /** Why the tab is unavailable. Read to assistive tech and shown as a tooltip. */
  disabledReason?: string
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, icon, badge, disabled = false, disabledReason, className, children, onClick, onFocus, ...rest },
  ref,
) {
  const ctx = useTabs('Tab')
  const selected = ctx.value === value
  const reasonId = disabled && disabledReason ? `${tabId(ctx, value)}-reason` : undefined
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId(ctx, value)}
      data-value={value}
      aria-selected={selected}
      aria-controls={panelId(ctx, value)}
      aria-disabled={disabled || undefined}
      aria-describedby={reasonId}
      title={disabled ? disabledReason : undefined}
      tabIndex={selected ? 0 : -1}
      className={cx(styles.tab, className)}
      data-selected={selected || undefined}
      onClick={(e) => {
        if (disabled) { e.preventDefault(); return }
        onClick?.(e)
        if (!e.defaultPrevented) ctx.setValue(value)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        e.currentTarget.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
      }}
      {...rest}
    >
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.label}>{children}</span>
      {badge != null ? <span className={styles.badge}>{badge}</span> : null}
      {reasonId ? <VisuallyHidden id={reasonId} aria-hidden="true">{disabledReason}</VisuallyHidden> : null}
    </button>
  )
})

export interface TabPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Matches the value of its Tab. */
  value: string
  /** Mount children only after the tab is first selected. Overrides Tabs `lazy`. */
  lazy?: boolean
  /** Shows a spinner in place of the content and sets aria-busy. */
  loading?: boolean
  /** Text announced when lazy content finishes loading. Defaults to "[tab name] content loaded". */
  loadedMessage?: string
  children?: ReactNode
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, lazy, loading = false, loadedMessage, className, children, ...rest },
  ref,
) {
  const ctx = useTabs('TabPanel')
  const selected = ctx.value === value
  const isLazy = lazy ?? ctx.lazy
  const [visited, setVisited] = useState(selected)
  const announced = useRef(false)
  useEffect(() => { if (selected) setVisited(true) }, [selected])
  const ready = visited && !loading
  useEffect(() => {
    if (!isLazy || !ready || announced.current) return
    announced.current = true
    const name = document.getElementById(tabId(ctx, value))?.textContent?.trim() ?? value
    ctx.announce(loadedMessage ?? `${name} content loaded`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLazy, ready])
  const mountContent = !isLazy || visited
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId(ctx, value)}
      aria-labelledby={tabId(ctx, value)}
      aria-busy={loading || undefined}
      tabIndex={0}
      hidden={!selected}
      className={cx(styles.panel, className)}
      {...rest}
    >
      {mountContent ? (loading ? <Spinner size="medium" label="Loading" /> : children) : null}
    </div>
  )
})
