import { useEffect, useId, useRef, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { cx } from '../../primitives/cx'
import { useClickOutside } from '../../primitives/hooks'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import styles from './MiniMenu.module.css'
import { usePanelPlacement } from '../TimePicker/usePanelPlacement'

/**
 * Minimal internal disclosure menu used by the Top Bar (profile, app switcher), Page Header (overflow actions)
 * and WYSIWYG Toolbar (More). It is NOT the shared Menu component: it renders in place, has no submenus and
 * no portal. Roles, arrow keys, Home/End, type-ahead, Escape and focus return follow the ARIA menu button pattern.
 */
export interface MiniMenuItem {
  id: string
  label: string
  /** Leading icon slot. */
  icon?: ReactNode
  /** Renders a link (role="menuitem") instead of a button. */
  href?: string
  onSelect?: () => void
  disabled?: boolean
  tone?: 'default' | 'destructive'
  /** Makes the item a toggle (role="menuitemcheckbox"). */
  checked?: boolean
  /** Draw a separator above this item. */
  separatorBefore?: boolean
}

export interface MiniMenuTriggerProps {
  ref: RefObject<HTMLButtonElement>
  id: string
  'aria-haspopup': 'menu'
  'aria-expanded': boolean
  'aria-controls': string | undefined
  onClick: (e: MouseEvent<HTMLElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void
}

export interface MiniMenuProps {
  /** Accessible name of the menu. */
  label: string
  items: MiniMenuItem[]
  /** Render prop for the trigger button. Spread the given props onto a real button. */
  trigger: (props: MiniMenuTriggerProps, state: { open: boolean }) => ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Static content above the items (for example the signed-in name). */
  header?: ReactNode
  /** list: one column. grid: tiles (app switcher). */
  layout?: 'list' | 'grid'
  /** Which edge of the trigger the panel lines up with. */
  align?: 'start' | 'end'
  className?: string
}

const enabled = (menu: HTMLElement | null) => Array.from(menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])

export function MiniMenu({ label, items, trigger, open: openProp, defaultOpen = false, onOpenChange, header, layout = 'list', align = 'end', className }: MiniMenuProps) {
  const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const placement = usePanelPlacement(open, rootRef, panelRef, { align })
  const focusOnOpen = useRef<'first' | 'last' | null>(null)
  const typed = useRef({ text: '', at: 0 })
  const baseId = useId()
  const menuId = `${baseId}-menu`

  useClickOutside([rootRef], () => setOpen(false), open)

  // Move focus into the menu only when a person opened it, never for a menu that renders open.
  useEffect(() => {
    if (!open || !focusOnOpen.current) return
    const list = enabled(menuRef.current)
    ;(focusOnOpen.current === 'last' ? list[list.length - 1] : list[0])?.focus()
    focusOnOpen.current = null
  }, [open])

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      focusOnOpen.current = e.key === 'ArrowUp' ? 'last' : 'first'
      if (open) { const l = enabled(menuRef.current); (e.key === 'ArrowUp' ? l[l.length - 1] : l[0])?.focus(); focusOnOpen.current = null } else setOpen(true)
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      close(true)
    }
  }

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = enabled(menuRef.current)
    const i = list.indexOf(document.activeElement as HTMLElement)
    const rtl = menuRef.current ? getComputedStyle(menuRef.current).direction === 'rtl' : false
    const grid = layout === 'grid'
    const next = e.key === 'ArrowDown' || (grid && e.key === (rtl ? 'ArrowLeft' : 'ArrowRight'))
    const prev = e.key === 'ArrowUp' || (grid && e.key === (rtl ? 'ArrowRight' : 'ArrowLeft'))
    if (next) { e.preventDefault(); list[(i + 1) % list.length]?.focus() }
    else if (prev) { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus() }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true) }
    else if (e.key === 'Tab') { setOpen(false) }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Type-ahead: jump to the next item that starts with what was typed.
      const now = Date.now()
      typed.current.text = now - typed.current.at > 600 ? e.key.toLowerCase() : typed.current.text + e.key.toLowerCase()
      typed.current.at = now
      const from = typed.current.text.length === 1 ? i + 1 : i
      const hit = [...list.slice(from), ...list.slice(0, from)].find((el) => (el.textContent ?? '').trim().toLowerCase().startsWith(typed.current.text))
      hit?.focus()
    }
  }

  const select = (item: MiniMenuItem) => (e: MouseEvent<HTMLElement>) => {
    if (item.disabled) { e.preventDefault(); return }
    item.onSelect?.()
    close(true)
  }

  return (
    <div ref={rootRef} className={cx(styles.root, className)}>
      {trigger(
        {
          ref: triggerRef,
          id: `${baseId}-trigger`,
          'aria-haspopup': 'menu',
          'aria-expanded': open,
          'aria-controls': open ? menuId : undefined,
          onClick: () => { focusOnOpen.current = open ? null : 'first'; setOpen(!open) },
          onKeyDown: onTriggerKeyDown,
        },
        { open },
      )}
      {open ? (
        <div ref={panelRef} className={styles.panel} data-align={align} data-layout={layout} data-placement={placement}>
          {header ? <div className={styles.header}>{header}</div> : null}
          <div ref={menuRef} id={menuId} role="menu" aria-label={label} className={styles.menu} data-layout={layout} onKeyDown={onMenuKeyDown}>
            {items.map((item) => {
              const role = item.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'
              const props = {
                role,
                tabIndex: -1,
                className: styles.item,
                'data-tone': item.tone === 'destructive' ? 'destructive' : undefined,
                'data-separator': item.separatorBefore || undefined,
                'aria-disabled': item.disabled || undefined,
                'aria-checked': item.checked !== undefined ? item.checked : undefined,
                onClick: select(item),
              }
              const inner = (
                <>
                  {item.icon ? <span className={styles.icon} aria-hidden="true">{item.icon}</span> : null}
                  <span className={styles.text}>{item.label}</span>
                  {item.checked ? <span className={styles.check} aria-hidden="true"><Icon name="check" /></span> : null}
                </>
              )
              return item.href && !item.disabled
                ? <a key={item.id} href={item.href} {...props}>{inner}</a>
                : <button key={item.id} type="button" {...props}>{inner}</button>
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
