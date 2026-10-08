import {
  Children, cloneElement, forwardRef, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState,
  type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { useClickOutside, useEscapeKey } from '../../primitives/hooks'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Button, type ButtonProps } from '../Button'
import { Input } from '../Input'
import { usePosition, type PopoverAlign, type PopoverSide } from '../Popover/usePosition'
import { MenuList, filterEntries, flattenItems, type MenuEntry, type MenuItemData, type MenuListHandle } from './MenuList'
import styles from './Menu.module.css'

export const CREATE_VALUE = '__create__'
const TABBABLE = 'a[href],button:not([disabled]):not([aria-disabled="true"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Props handed to a render-function trigger. Spread them on the control that opens the menu. */
export interface MenuTriggerRenderProps {
  id: string
  'aria-haspopup': 'menu' | 'listbox'
  'aria-expanded': boolean
  'aria-controls': string | undefined
  onClick: (e: MouseEvent<HTMLElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void
  open: boolean
}
export interface MenuContext { query: string; close: () => void }

export interface MenuProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onSelect' | 'children' | 'defaultValue'> {
  /** The control that opens the menu: a Button, an icon-only Button, a split-button chevron, or a render function. */
  trigger: ReactElement | ((props: MenuTriggerRenderProps) => ReactNode)
  items: MenuEntry[]
  /** action: items run commands (role menu). single and multi: items are options (role listbox). */
  mode?: 'action' | 'single' | 'multi'
  /** Accessible name of the menu or listbox. */
  label: string
  /** Selected values (selection modes). */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Action mode: an item was chosen. */
  onAction?: (value: string, item: MenuItemData) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Adds a filter field and highlights matching text. */
  searchable?: boolean
  searchLabel?: string
  searchPlaceholder?: string
  query?: string
  onQueryChange?: (query: string) => void
  /** Adds a "Create ..." option while the query has no exact match. */
  onCreate?: (query: string) => void
  createLabel?: (query: string) => string
  loading?: boolean
  emptyMessage?: ReactNode
  side?: PopoverSide
  align?: PopoverAlign
  /** Make the panel at least as wide as the trigger. */
  matchTriggerWidth?: boolean
  /** Close after an item is chosen. Defaults to true, except in multi mode. */
  closeOnSelect?: boolean
  /** Render into document.body (default). Pass false to render in place, for example inside a docs frame. */
  portal?: boolean
  /** Position against this element instead of the trigger wrapper (split buttons). */
  anchorRef?: RefObject<HTMLElement | null>
  /** Content above the list (select all, counts). Receives the current query and a close function. */
  header?: ReactNode | ((ctx: MenuContext) => ReactNode)
  /** Content below the list. */
  footer?: ReactNode | ((ctx: MenuContext) => ReactNode)
  /** Class for the panel, for width tweaks. */
  panelClassName?: string
  /** Docs only: value of an item whose submenu renders open on mount. */
  defaultOpenSubmenu?: string
}

/** A secondary Button whose chevron flips when the menu is open. Use it as the default trigger. */
export const MenuTrigger = forwardRef<HTMLButtonElement, ButtonProps>(function MenuTrigger({ priority = 'secondary', ...rest }, ref) {
  const open = rest['aria-expanded'] === true || rest['aria-expanded'] === 'true'
  return <Button ref={ref} priority={priority} trailingIcon={<Icon name={open ? 'chevronUp' : 'chevronDown'} />} data-state={open && !rest['data-state'] ? 'pressed' : rest['data-state']} {...rest} />
})

export const Menu = forwardRef<HTMLSpanElement, MenuProps>(function Menu(
  {
    trigger, items, mode = 'action', label, value: valueProp, defaultValue = [], onValueChange, onAction, open: openProp, defaultOpen = false, onOpenChange,
    searchable = false, searchLabel = 'Search options', searchPlaceholder = 'Search', query: queryProp, onQueryChange, onCreate, createLabel = (q) => `Create “${q}”`,
    loading = false, emptyMessage, side = 'bottom', align = 'start', matchTriggerWidth = false, closeOnSelect, portal = true, defaultOpenSubmenu, anchorRef, header, footer, panelClassName, className, id: idProp, ...rest
  },
  ref,
) {
  const uid = useId()
  const triggerId = idProp ?? `${uid}-trigger`
  const listId = `${uid}-list`
  const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange)
  const [selected, setSelected] = useControllableState<string[]>(valueProp, defaultValue, onValueChange)
  const [query, setQuery] = useControllableState<string>(queryProp, '', onQueryChange)
  const rootRef = useRef<HTMLSpanElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listHandle = useRef<MenuListHandle>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const intent = useRef<'first' | 'last'>('first')
  const anchor = anchorRef ?? rootRef
  const pos = usePosition({ anchorRef: anchor, floatingRef, open, side, align, matchWidth: matchTriggerWidth })
  const shouldClose = closeOnSelect ?? mode !== 'multi'

  const triggerEl = () => rootRef.current?.querySelector<HTMLElement>(TABBABLE) ?? null
  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    setQuery('')
    if (restoreFocus) triggerEl()?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOpen, setQuery])

  useEscapeKey(() => close(true), open)
  useClickOutside([rootRef, panelRef, ...(anchorRef ? [anchorRef] : [])], () => close(false), open)

  // Filter, then offer "Create" when nothing matches exactly.
  const shown = useMemo<MenuEntry[]>(() => {
    const base = searchable && query ? filterEntries(items, query) : items
    const q = query.trim()
    if (searchable && onCreate && q && !flattenItems(items).some((i) => i.label.toLowerCase() === q.toLowerCase())) {
      const create: MenuItemData = { value: CREATE_VALUE, label: createLabel(q), icon: <Icon name="plus" /> }
      return base.length ? [...base, { type: 'divider' }, create] : [create]
    }
    return base
  }, [items, searchable, query, onCreate, createLabel])
  const resultCount = flattenItems(shown).filter((i) => i.value !== CREATE_VALUE).length

  // Focus moves in when the menu opens. A menu that renders open on mount (docs) does not steal focus.
  const openedOnMount = useRef(open)
  useEffect(() => {
    if (!open) return
    if (openedOnMount.current) { openedOnMount.current = false; return }
    if (searchable) searchRef.current?.querySelector('input')?.focus({ preventScroll: true })
    else listHandle.current?.focus(mode === 'action' ? intent.current : 'selected')
    intent.current = 'first'
  }, [open, searchable, mode])

  const choose = (item: MenuItemData) => {
    if (item.disabled) return
    if (item.value === CREATE_VALUE) { onCreate?.(query.trim()); close(true); return }
    if (mode === 'action') onAction?.(item.value, item)
    else if (mode === 'single') setSelected([item.value])
    else setSelected(selected.includes(item.value) ? selected.filter((v) => v !== item.value) : [...selected, item.value])
    if (shouldClose) close(true)
  }

  const toggleOpen = () => { if (open) close(false); else setOpen(true) }
  const triggerProps: MenuTriggerRenderProps = {
    id: triggerId,
    'aria-haspopup': mode === 'action' ? 'menu' : 'listbox',
    'aria-expanded': open,
    'aria-controls': open ? listId : undefined,
    open,
    onClick: (e) => { if (!e.defaultPrevented) { intent.current = 'first'; toggleOpen() } },
    onKeyDown: (e) => {
      if (e.defaultPrevented) return
      if (e.key === 'ArrowDown') { e.preventDefault(); intent.current = 'first'; setOpen(true) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); intent.current = 'last'; setOpen(true) }
    },
  }
  let triggerNode: ReactNode
  if (typeof trigger === 'function') triggerNode = trigger(triggerProps)
  else {
    const child = Children.only(trigger) as ReactElement<Record<string, unknown>>
    const cp = child.props
    triggerNode = isValidElement(child)
      ? cloneElement(child, {
        id: (cp.id as string | undefined) ?? triggerProps.id,
        'aria-haspopup': triggerProps['aria-haspopup'],
        'aria-expanded': open,
        'aria-controls': triggerProps['aria-controls'],
        onClick: (e: MouseEvent<HTMLElement>) => { (cp.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e); triggerProps.onClick(e) },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => { (cp.onKeyDown as ((e: KeyboardEvent<HTMLElement>) => void) | undefined)?.(e); triggerProps.onKeyDown(e) },
      })
      : child
  }

  // Tab leaves the panel: close and hand focus back to the trigger so the browser continues from there.
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return
    const active = document.activeElement as HTMLElement | null
    const tabbables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(TABBABLE))
    const dir = e.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING
    const hasNext = active ? tabbables.some((t) => t !== active && (active.compareDocumentPosition(t) & dir)) : false
    if (!hasNext) close(true)
  }

  const onSearchKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); listHandle.current?.focus('first') }
    else if (e.key === 'Enter') {
      const first = flattenItems(shown).find((i) => !i.disabled)
      if (first) { e.preventDefault(); choose(first) }
    }
  }
  const ctx: MenuContext = { query, close: () => close(true) }
  const slot = (s: MenuProps['header']) => (typeof s === 'function' ? s(ctx) : s)

  const typeIntoSearch = (char: string) => {
    setQuery(query + char)
    searchRef.current?.querySelector('input')?.focus({ preventScroll: true })
  }

  const panel = open ? (
    <div ref={floatingRef} className={styles.positioner} data-side={pos.side} data-match={matchTriggerWidth || undefined}>
      <div ref={panelRef} className={cx(styles.panel, panelClassName)} onKeyDown={onPanelKeyDown}>
        {searchable ? (
          <div ref={searchRef} className={styles.slot} onKeyDown={onSearchKeyDown}>
            <Input
              label={searchLabel}
              hideLabel
              size="small"
              placeholder={searchPlaceholder}
              leadingIcon={<Icon name="search" />}
              value={query}
              onValueChange={setQuery}
              clearable
              autoComplete="off"
              aria-controls={listId}
            />
          </div>
        ) : null}
        {header ? <div className={styles.slot}>{slot(header)}</div> : null}
        <MenuList
          ref={listHandle}
          listId={listId}
          label={label}
          items={shown}
          mode={mode}
          value={selected}
          query={searchable ? query : undefined}
          loading={loading}
          emptyMessage={emptyMessage ?? (query ? `No results for “${query}”.` : 'No options.')}
          onSelect={choose}
          onNavigateOut={searchable ? () => searchRef.current?.querySelector('input')?.focus() : undefined}
          onType={searchable ? typeIntoSearch : undefined}
          portal={portal}
          defaultOpenSubmenu={defaultOpenSubmenu}
        />
        {footer ? <div className={cx(styles.slot, styles.footer)}>{slot(footer)}</div> : null}
        <VisuallyHidden role="status" aria-live="polite">
          {loading ? 'Loading options.' : searchable && query ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'}.` : ''}
        </VisuallyHidden>
      </div>
    </div>
  ) : null

  return (
    <span ref={mergeRefs(ref, rootRef)} className={cx(styles.root, className)} data-open={open || undefined} {...rest}>
      {triggerNode}
      {panel && portal && typeof document !== 'undefined' ? createPortal(panel, document.body) : panel}
    </span>
  )
})

