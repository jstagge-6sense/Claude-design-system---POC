import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Portal } from '../../primitives/Portal'
import { useControllableState } from '../../primitives/useControllableState'
import { usePrefersReducedMotion } from '../../primitives/hooks'
import { Icon } from '../../icons'
import { Button, type ButtonProps } from '../Button'
import { Spinner } from '../Spinner'
import { focusableIn, useExitTransition, useOverlayLayer } from '../Dialog/overlay'
import styles from './Drawer.module.css'

export type DrawerDismissReason = 'close' | 'escape' | 'overlay'

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onDismiss?: (reason: DrawerDismissReason) => void
  /** Required. Names the drawer for assistive tech and is announced on open. */
  title: ReactNode
  /** Optional lead icon slot in the header. Decorative. */
  icon?: ReactNode
  /** Header actions slot, placed before the close button. */
  headerActions?: ReactNode
  /** Small: quick details. Medium: standard forms and detail views. Large: complex editing. */
  size?: 'small' | 'medium' | 'large'
  /** Edge it slides from. Logical, so `start` is the left edge in LTR and the right edge in RTL. */
  side?: 'start' | 'end'
  /**
   * overlay (default): floats above the page, with an optional scrim.
   * push: sits in the layout and squeezes the content beside it. Place it as a sibling of the content inside a flex row
   * (`display: flex`). Always non-modal, rendered in place, no scrim, no focus trap and no scroll lock.
   */
  behavior?: 'overlay' | 'push'
  /** Content area is loading. The body stays mounted and is marked `aria-busy`. */
  loading?: boolean
  loadingLabel?: string
  /**
   * Modal: scrim, body scroll lock and a focus trap, and a click on the scrim closes it.
   * Not modal: the page behind stays interactive and scrollable.
   */
  modal?: boolean
  /** Defaults to `modal`. */
  trapFocus?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  closeLabel?: string
  /** Footer actions. Primary and secondary sit at the trailing end, tertiary at the leading end. */
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  tertiaryAction?: ReactNode
  /** Replaces the footer entirely. */
  footer?: ReactNode
  portal?: boolean
  container?: Element | null
  /** Move focus in on open and back to the trigger on close. */
  autoFocus?: boolean
  /** Lock body scroll. Defaults to `modal`. Turn off only for in-place docs. */
  lockScroll?: boolean
  /** Forced state for docs and previews. */
  closeButtonProps?: Partial<ButtonProps>
  children?: ReactNode
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(props, ref) {
  const { open, defaultOpen = false, onOpenChange, portal: portalProp = true, container, behavior = 'overlay' } = props
  const portal = behavior === 'push' ? false : portalProp
  const [isOpen, setOpen] = useControllableState<boolean>(open, defaultOpen, onOpenChange)
  const reduced = usePrefersReducedMotion()
  const { mounted, closing } = useExitTransition(isOpen, reduced, 320)
  if (!mounted) return null
  const layer = <DrawerLayer {...props} portal={portal} ref={ref} isOpen={isOpen} closing={closing} setOpen={setOpen} />
  return portal ? <Portal container={container}>{layer}</Portal> : layer
})

interface LayerProps extends DrawerProps {
  isOpen: boolean
  closing: boolean
  setOpen: (o: boolean) => void
}

const DrawerLayer = forwardRef<HTMLDivElement, LayerProps>(function DrawerLayer(
  {
    isOpen, closing, setOpen, onDismiss, title, icon, headerActions, size = 'medium', side = 'end', behavior = 'overlay', loading = false,
    loadingLabel = 'Loading', modal = true, trapFocus, closeOnOverlayClick = true, closeOnEscape = true,
    closeLabel = 'Close drawer', primaryAction, secondaryAction, tertiaryAction, footer, portal = true, autoFocus = true,
    lockScroll, closeButtonProps, children, className, container: _c, open: _o, defaultOpen: _d, onOpenChange: _oc, ...rest
  },
  ref,
) {
  const push = behavior === 'push'
  if (push) modal = false
  const titleId = useId()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  const dismiss = (reason: DrawerDismissReason) => {
    onDismiss?.(reason)
    setOpen(false)
  }

  useOverlayLayer(surfaceRef, {
    active: isOpen && !closing, kind: 'drawer', trap: trapFocus ?? modal, lockScroll: lockScroll ?? modal, autoFocus,
    onEscape: () => { if (closeOnEscape) dismiss('escape') },
    initialFocus: () => (bodyRef.current ? focusableIn(bodyRef.current)[0] : undefined) ?? titleRef.current,
  })

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const measure = () => setScrollable(el.scrollHeight > el.clientHeight + 1)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, loading])

  const hasFooter = Boolean(footer || primaryAction || secondaryAction || tertiaryAction)

  return (
    <div
      ref={ref}
      className={cx(styles.root, className)}
      data-inline={!portal || undefined}
      data-modal={modal || undefined}
      data-side={side}
      data-push={push || undefined}
      data-phase={closing ? 'closing' : 'open'}
      {...rest}
    >
      {modal ? <div className={styles.scrim} aria-hidden="true" onClick={() => { if (closeOnOverlayClick) dismiss('overlay') }} /> : null}
      <div
        ref={surfaceRef}
        role="dialog"
        aria-modal={modal ? 'true' : 'false'}
        aria-labelledby={titleId}
        aria-busy={loading || undefined}
        className={styles.surface}
        data-size={size}
      >
        <div className={styles.header}>
          {icon ? <span className={styles.leadIcon} aria-hidden="true">{icon}</span> : null}
          <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.title}>{title}</h2>
          {headerActions ? <div className={styles.headerActions}>{headerActions}</div> : null}
          <Button
            priority="tertiary"
            size="small"
            iconOnly
            icon={<Icon name="close" />}
            aria-label={closeLabel}
            onClick={() => dismiss('close')}
            {...closeButtonProps}
          />
        </div>
        <div
          ref={bodyRef}
          className={styles.body}
          tabIndex={scrollable ? 0 : undefined}
          role={scrollable ? 'region' : undefined}
          aria-labelledby={scrollable ? titleId : undefined}
          data-loading={loading || undefined}
        >
          <div className={styles.content}>{children}</div>
          {loading ? <Spinner overlay size="medium" label={loadingLabel} /> : null}
        </div>
        {hasFooter ? (
          <div className={styles.footer}>
            {footer ?? (
              <>
                {tertiaryAction ? <div className={styles.tertiary}>{tertiaryAction}</div> : null}
                {secondaryAction}
                {primaryAction}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
})
