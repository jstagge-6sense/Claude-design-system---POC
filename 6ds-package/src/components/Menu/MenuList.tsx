import {
  forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState,
  type HTMLAttributes, type KeyboardEvent, type LiHTMLAttributes, type ReactNode, type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import { Spinner } from '../Spinner'
import { usePosition } from '../Popover/usePosition'
import styles from './MenuList.module.css'

/* ---------------------------------------------------------------- data model */

export interface MenuItemData {
  value: string
  label: string
  description?: string
  /** Leading icon slot. */
  icon?: ReactNode
  /** Keyboard shortcut hint, for example "Cmd+D". Text only. */
  shortcut?: string
  disabled?: boolean
  /** Destructive action (Delete, Remove). Red label. */
  destructive?: boolean
  /** One level of submenu. Action mode only. */
  items?: MenuEntry[]
}
export interface MenuGroupData { type: 'group'; label: string; items: MenuItemData[] }
export interface MenuDividerData { type: 'divider' }
export type MenuEntry = MenuItemData | MenuGroupData | MenuDividerData

export const isGroup = (e: MenuEntry): e is MenuGroupData => 'type' in e && e.type === 'group'
export const isDivider = (e: MenuEntry): e is MenuDividerData => 'type' in e && e.type === 'divider'
export const isItem = (e: MenuEntry): e is MenuItemData => !('type' in e)

/** Every selectable item in order, groups unwrapped. Submenu items are not included. */
export function flattenItems(entries: MenuEntry[]): MenuItemData[] {
  return entries.flatMap((e) => (isGroup(e) ? e.items : isItem(e) ? [e] : []))
}

/** Keep items whose label or description contains the query. Empty groups and doubled dividers are dropped. */
export function filterEntries(entries: MenuEntry[], query: string): MenuEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries
  const hit = (i: MenuItemData) => i.label.toLowerCase().includes(q) || (i.description?.toLowerCase().includes(q) ?? false)
  const out: MenuEntry[] = []
  for (const e of entries) {
    if (isGroup(e)) { const items = e.items.filter(hit); if (items.length) out.push({ ...e, items }) }
    else if (isItem(e)) { if (hit(e)) out.push(e) }
    else if (out.length && !isDivider(out[out.length - 1])) out.push(e)
  }
  while (out.length && isDivider(out[out.length - 1])) out.pop()
  return out
}

/** Wrap the matching part of a label so it can be shown bold with a tint. */
export function highlight(text: string, query?: string): ReactNode {
  const q = query?.trim()
  if (!q) return text
  const at = text.toLowerCase().indexOf(q.toLowerCase())
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <mark className={styles.match}>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  )
}

/* ---------------------------------------------------------------- MenuItem */

export interface MenuItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  selected?: boolean
  /** none: an action. single: radio behavior with a check mark. multi: checkbox behavior. */
  selection?: 'none' | 'single' | 'multi'
  /** Filter text to highlight inside the label. */
  query?: string
  /** The item opens a submenu. */
  submenu?: boolean
  expanded?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
}

export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(function MenuItem(
  { label, description, icon, shortcut, disabled = false, destructive = false, selected = false, selection = 'none', query, submenu = false, expanded, className, role, ...rest },
  ref,
) {
  const isOption = selection !== 'none'
  return (
    <li
      ref={ref}
      role={role ?? (isOption ? 'option' : 'menuitem')}
      tabIndex={-1}
      aria-selected={isOption ? selected : undefined}
      aria-disabled={disabled || undefined}
      aria-haspopup={submenu ? 'menu' : undefined}
      aria-expanded={submenu ? !!expanded : undefined}
      className={cx(styles.item, className)}
      data-menu-item=""
      data-text={label.toLowerCase()}
      data-selection={selection}
      data-selected={(selected && selection === 'single') || undefined}
      data-destructive={destructive || undefined}
      data-open={expanded || undefined}
      {...rest}
    >
      {selection === 'multi' ? (
        <span className={styles.check} data-checked={selected || undefined} aria-hidden="true">{selected ? <Icon name="check" /> : null}</span>
      ) : null}
      {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
      <span className={styles.text}>
        <span className={styles.label}>{highlight(label, query)}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
      {shortcut ? <span className={styles.shortcut} aria-hidden="true">{shortcut}</span> : null}
      {selection === 'single' && selected ? <span className={styles.tick} aria-hidden="true"><Icon name="check" /></span> : null}
      {submenu ? <span className={styles.tick} aria-hidden="true"><Icon name="chevronRight" /></span> : null}
    </li>
  )
})

/* ---------------------------------------------------------------- MenuList */

export interface MenuListHandle {
  /** Move focus to an item. */
  focus: (target?: 'first' | 'last' | 'selected') => void
}

export interface MenuListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  items: MenuEntry[]
  /** action: role menu. single and multi: role listbox. */
  mode?: 'action' | 'single' | 'multi'
  /** Selected values in selection modes. */
  value?: string[]
  /** An item was activated with click, Enter or Space. */
  onSelect: (item: MenuItemData) => void
  /** Text to highlight in labels. Filtering is done by the caller (see `filterEntries`). */
  query?: string
  loading?: boolean
  loadingLabel?: string
  emptyMessage?: ReactNode
  /** Accessible name of the menu or listbox. */
  label?: string
  listId?: string
  /** ArrowUp on the first item. Use it to move back to a search field. */
  onNavigateOut?: () => void
  /** A printable key was pressed on an item. Use it to route typing into a search field instead of type-ahead. */
  onType?: (char: string) => void
  /** Submenu only: left arrow or Escape was pressed. */
  onExit?: () => void
  /** Render submenus in place instead of document.body. */
  portal?: boolean
  /** Docs only: value of an item whose submenu renders open on mount. */
  defaultOpenSubmenu?: string
  depth?: 0 | 1
}

const TYPEAHEAD_MS = 600

export const MenuList = forwardRef<MenuListHandle, MenuListProps>(function MenuList(
  { items, mode = 'action', value = [], onSelect, query, loading = false, loadingLabel = 'Loading options', emptyMessage, label, listId, onNavigateOut, onType, onExit, portal = true, defaultOpenSubmenu, depth = 0, className, ...rest },
  ref,
) {
  const uid = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const subRef = useRef<MenuListHandle>(null)
  const subAnchor = useRef<HTMLElement | null>(null)
  const typed = useRef({ text: '', timer: undefined as ReturnType<typeof setTimeout> | undefined })
  const [openSub, setOpenSub] = useState<{ value: string; focus: boolean } | null>(null)
  const flat = useMemo(() => flattenItems(items), [items])
  const selection = mode === 'action' ? 'none' : mode
  const hasItems = flat.length > 0

  const enabled = () => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]:not([aria-disabled="true"])') ?? [])
  const byValue = (v: string) => Array.from(listRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? []).find((el) => el.dataset.value === v) ?? null
  const dataFor = (el: Element | null) => (el ? flat.find((i) => i.value === (el as HTMLElement).dataset.value) : undefined)

  useImperativeHandle(ref, () => ({
    focus(target = 'first') {
      const list = enabled()
      const el = target === 'last' ? list[list.length - 1] : target === 'selected' ? list.find((n) => n.getAttribute('aria-selected') === 'true') ?? list[0] : list[0]
      el?.focus({ preventScroll: true })
      el?.scrollIntoView?.({ block: 'nearest' })
    },
  }))

  useEffect(() => {
    if (!defaultOpenSubmenu) return
    const el = byValue(defaultOpenSubmenu)
    if (el) { subAnchor.current = el; setOpenSub({ value: defaultOpenSubmenu, focus: false }) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => { if (typed.current.timer) clearTimeout(typed.current.timer) }, [])
  // Close an open submenu when its item disappears (filtering) .
  useEffect(() => { if (openSub && !flat.some((i) => i.value === openSub.value)) setOpenSub(null) }, [flat, openSub])
  // Keyboard-opened submenus take focus once mounted.
  useEffect(() => { if (openSub?.focus) subRef.current?.focus('first') }, [openSub])

  const openSubmenu = (item: MenuItemData, focus: boolean) => {
    if (depth > 0 || !item.items?.length || item.disabled) return
    subAnchor.current = byValue(item.value)
    setOpenSub({ value: item.value, focus })
  }
  const closeSub = (restore: boolean) => {
    const value = openSub?.value
    setOpenSub(null)
    if (restore && value) byValue(value)?.focus()
  }

  const activate = (item: MenuItemData | undefined) => {
    if (!item || item.disabled) return
    if (item.items?.length) { openSubmenu(item, true); return }
    onSelect(item)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const list = enabled()
    const current = (e.target as HTMLElement).closest<HTMLElement>('[data-menu-item]')
    const idx = current ? list.indexOf(current) : -1
    const rtl = listRef.current ? getComputedStyle(listRef.current).direction === 'rtl' : false
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    const go = (i: number) => { const el = list[(i + list.length) % list.length]; el?.focus({ preventScroll: true }); el?.scrollIntoView?.({ block: 'nearest' }) }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); if (list.length) go(idx + 1); return
      case 'ArrowUp':
        e.preventDefault()
        if (idx <= 0 && onNavigateOut) onNavigateOut()
        else if (list.length) go(idx < 0 ? list.length - 1 : idx - 1)
        return
      case 'Home': e.preventDefault(); if (list.length) go(0); return
      case 'End': e.preventDefault(); if (list.length) go(list.length - 1); return
      case 'Enter': e.preventDefault(); activate(dataFor(current)); return
      case ' ':
        if (typed.current.text) break
        e.preventDefault(); activate(dataFor(current)); return
      case 'Escape':
        if (depth === 1) { e.preventDefault(); e.stopPropagation(); onExit?.(); return }
        if (openSub) { e.preventDefault(); e.stopPropagation(); closeSub(true) }
        return
      default:
        if (e.key === forward) {
          const d = dataFor(current)
          if (d?.items?.length) { e.preventDefault(); openSubmenu(d, true) }
          return
        }
        if (e.key === back && depth === 1) { e.preventDefault(); e.stopPropagation(); onExit?.(); return }
        if (e.key === back && openSub) { e.preventDefault(); closeSub(true); return }
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (onType) { onType(e.key); return }
      const t = typed.current
      if (t.timer) clearTimeout(t.timer)
      t.text += e.key.toLowerCase()
      t.timer = setTimeout(() => { t.text = '' }, TYPEAHEAD_MS)
      const start = t.text.length === 1 ? idx + 1 : Math.max(idx, 0)
      for (let n = 0; n < list.length; n++) {
        const el = list[(start + n) % list.length]
        if (el.dataset.text?.startsWith(t.text)) { el.focus({ preventScroll: true }); el.scrollIntoView?.({ block: 'nearest' }); break }
      }
    }
  }

  const renderItem = (item: MenuItemData) => (
    <MenuItem
      key={item.value}
      data-value={item.value}
      label={item.label}
      description={item.description}
      icon={item.icon}
      shortcut={item.shortcut}
      disabled={item.disabled}
      destructive={item.destructive}
      selection={selection}
      selected={selection !== 'none' && value.includes(item.value)}
      query={query}
      submenu={depth === 0 && !!item.items?.length}
      expanded={openSub?.value === item.value}
      onClick={() => { if (!item.disabled) activate(item) }}
      onMouseEnter={() => { if (depth === 0) { if (item.items?.length) openSubmenu(item, false); else if (openSub) setOpenSub(null) } }}
    />
  )

  const sub = openSub ? flat.find((i) => i.value === openSub.value) : undefined
  return (
    <div ref={rootRef} className={cx(styles.root, className)} {...rest}>
      <ul
        ref={listRef}
        id={listId}
        role={mode === 'action' ? 'menu' : 'listbox'}
        aria-label={label}
        aria-multiselectable={mode === 'multi' ? true : undefined}
        aria-busy={loading || undefined}
        className={styles.list}
        data-empty={!hasItems || undefined}
        onKeyDown={onKeyDown}
      >
        {!loading ? items.map((entry, i) => {
          if (isDivider(entry)) return <li key={`d${i}`} role="separator" className={styles.divider} />
          if (isGroup(entry)) {
            const gid = `${uid}-g${i}`
            return (
              <li key={`g${i}`} role="presentation" className={styles.groupItem}>
                <ul role="group" aria-labelledby={gid} className={styles.group}>
                  <li id={gid} role="presentation" className={styles.groupLabel}>{entry.label}</li>
                  {entry.items.map(renderItem)}
                </ul>
              </li>
            )
          }
          return renderItem(entry)
        }) : null}
      </ul>
      {loading ? (
        <div className={styles.state}><Spinner size="small" accessibleLabel={loadingLabel} /><span>{loadingLabel}</span></div>
      ) : !hasItems ? (
        <div className={styles.state}>{emptyMessage ?? 'No options'}</div>
      ) : null}
      {sub?.items ? (
        <SubMenu anchorRef={subAnchor} portal={portal}>
          <MenuList
            ref={subRef}
            depth={1}
            items={sub.items}
            mode="action"
            label={sub.label}
            onSelect={onSelect}
            onExit={() => closeSub(true)}
            portal={portal}
          />
        </SubMenu>
      ) : null}
    </div>
  )
})

/** Positioned panel for one level of submenu. It sits outside the scrolling list so it is never clipped. */
function SubMenu({ anchorRef, portal, children }: { anchorRef: RefObject<HTMLElement | null>; portal: boolean; children: ReactNode }) {
  const floatingRef = useRef<HTMLDivElement>(null)
  const pos = usePosition({ anchorRef, floatingRef, open: true, side: 'end', align: 'start' })
  const node = (
    <div ref={floatingRef} className={styles.subPositioner} data-side={pos.side}>
      <div className={styles.subPanel}>{children}</div>
    </div>
  )
  return portal && typeof document !== 'undefined' ? createPortal(node, document.body) : node
}
