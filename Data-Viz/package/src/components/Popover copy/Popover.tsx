import {
  Children, cloneElement, createContext, forwardRef, isValidElement, useCallback, useContext, useEffect, useId, useRef,
  type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useClickOutside, useEscapeKey } from '../../primitives/hooks'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { usePosition, type PopoverAlign, type PopoverSide } from './usePosition'
import styles from './Popover.module.css'

const NestContext = createContext(false)

/** Only one popover or tooltip is open at a time. The open one registers its closer here. */
let activeClose: { id: string; close: () => void } | null = null

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export interface PopoverProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content' | 'title' | 'children'> {
  /** simple: a tooltip (role="tooltip"), opens on hover and focus. rich: a dialog popover, opens on click. */
  mode?: 'simple' | 'rich'
  /** Surface content. Simple mode takes plain text only. */
  content: ReactNode
  /** Rich mode heading. Names the dialog through aria-labelledby. */
  title?: ReactNode
  /** Rich mode without a visible title needs a name for the dialog. */
  dialogLabel?: string
  /** The trigger. One element that forwards its props to a focusable DOM node (a Button, for example). */
  children: ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Preferred side. It flips to the opposite side, then to the side with room, when it does not fit. start and end follow reading direction. */
  side?: PopoverSide
  align?: PopoverAlign
  /** Show the arrow that points at the trigger. */
  arrow?: boolean
  /** Rich mode: show a close button. Use it for persistent content. */
  closeButton?: boolean
  closeLabel?: string
  /** Render into document.body (default). Pass false to render in place, for example inside a docs frame. */
  portal?: boolean
  /** Simple mode: delay in ms before a hover opens the tooltip. Focus opens it at once. */
  openDelay?: number
  /** Simple mode: delay in ms before leaving closes the tooltip. Lets the pointer reach the tooltip. */
  closeDelay?: number
  /** Docs only: allow this popover to stay open next to others. Never use it in product code. */
  exclusive?: boolean
}

export const Popover = forwardRef<HTMLSpanElement, PopoverProps>(function Popover(
  {
    mode = 'simple', content, title, dialogLabel, children, open: openProp, defaultOpen = false, onOpenChange, side = 'top', align = 'center',
    arrow = true, closeButton = false, closeLabel = 'Close', portal = true, openDelay = 200, closeDelay = 100, exclusive = true, className, ...rest
  },
  ref,
) {
  const nested = useContext(NestContext)
  const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange)
  const rich = mode === 'rich'
  const uid = useId()
  const surfaceId = `${uid}-surface`
  const titleId = `${uid}-title`
  const rootRef = useRef<HTMLSpanElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pos = usePosition({ anchorRef: rootRef, floatingRef, open: open && !nested, side, align })

  const triggerEl = () => rootRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? null
  const clear = () => { if (timer.current) clearTimeout(timer.current) }
  const close = useCallback((restoreFocus = false) => {
    clear()
    setOpen(false)
    if (restoreFocus) triggerEl()?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setOpen])
  const show = () => { clear(); setOpen(true) }

  // One at a time.
  useEffect(() => {
    if (!open || !exclusive) return
    if (activeClose && activeClose.id !== uid) activeClose.close()
    activeClose = { id: uid, close: () => setOpen(false) }
    return () => { if (activeClose?.id === uid) activeClose = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, exclusive, uid])

  useEffect(() => clear, [])
  useEscapeKey(() => close(rich), open)
  useClickOutside([rootRef, floatingRef], () => close(false), open && rich)

  // Rich mode: focus moves in on open. A popover that renders open on mount (docs) does not steal focus.
  const openedOnMount = useRef(open)
  useEffect(() => {
    if (!open || !rich || nested) return
    if (openedOnMount.current) { openedOnMount.current = false; return }
    const s = surfaceRef.current
    if (!s) return
    const first = s.querySelector<HTMLElement>(FOCUSABLE)
    if (first) first.focus({ preventScroll: true })
    else s.focus({ preventScroll: true })
  }, [open, rich, nested])

  if (nested) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') console.warn('Popover: never nest popovers. Rendering the trigger only.')
    return children
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    if (!isValidElement(Children.only(children))) console.warn('Popover: children must be a single trigger element.')
    if (rich && !title && !dialogLabel) console.warn('Popover: a rich popover needs a title or a dialogLabel.')
  }

  const child = Children.only(children) as ReactElement<Record<string, unknown>>
  const childProps = child.props
  const trigger = cloneElement(child, rich
    ? {
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? surfaceId : undefined,
        onClick: (e: MouseEvent<HTMLElement>) => {
          (childProps.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e)
          if (!e.defaultPrevented) setOpen(!open)
        },
      }
    : { 'aria-describedby': [childProps['aria-describedby'], open ? surfaceId : undefined].filter(Boolean).join(' ') || undefined })

  const simpleHandlers = rich ? {} : {
    onMouseEnter: () => { clear(); timer.current = setTimeout(() => setOpen(true), openDelay) },
    onMouseLeave: () => { clear(); timer.current = setTimeout(() => setOpen(false), closeDelay) },
    onFocus: show,
  }
  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const next = e.relatedTarget as Node | null
    if (!rich) { close(false); return }
    if (next && !rootRef.current?.contains(next) && !floatingRef.current?.contains(next)) close(false)
  }

  const arrowStyle = { '--_arrow-offset': `${pos.arrowOffset}px` } as CSSProperties
  const floating = open ? (
    <div
      ref={floatingRef}
      className={styles.positioner}
      data-side={pos.side}
      data-mode={mode}
      onMouseEnter={rich ? undefined : () => clear()}
      onMouseLeave={rich ? undefined : () => { clear(); timer.current = setTimeout(() => setOpen(false), closeDelay) }}
    >
      <div
        ref={surfaceRef}
        id={surfaceId}
        className={styles.surface}
        data-mode={mode}
        role={rich ? 'dialog' : 'tooltip'}
        aria-labelledby={rich && title ? titleId : undefined}
        aria-label={rich && !title ? dialogLabel : undefined}
        tabIndex={rich ? -1 : undefined}
      >
        <NestContext.Provider value>
          {rich ? (
            <>
              {title || closeButton ? (
                <div className={styles.header}>
                  {title ? <div id={titleId} className={styles.title}>{title}</div> : <span />}
                  {closeButton ? (
                    <Button priority="tertiary" size="small" iconOnly icon={<Icon name="close" />} aria-label={closeLabel} onClick={() => close(true)} />
                  ) : null}
                </div>
              ) : null}
              <div className={styles.body}>{content}</div>
            </>
          ) : (
            <span className={styles.label}>{content}</span>
          )}
        </NestContext.Provider>
        {arrow ? <span className={styles.arrow} style={arrowStyle} aria-hidden="true" /> : null}
      </div>
    </div>
  ) : null

  return (
    <span ref={mergeRefs(ref, rootRef)} className={cx(styles.root, className)} onBlur={handleBlur} {...simpleHandlers} {...rest}>
      {trigger}
      {floating && portal && typeof document !== 'undefined' ? createPortal(floating, document.body) : floating}
    </span>
  )
})
