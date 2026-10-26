import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { Portal } from '../../primitives/Portal'
import { useControllableState } from '../../primitives/useControllableState'
import { usePrefersReducedMotion } from '../../primitives/hooks'
import { Icon } from '../../icons'
import { Button, type ButtonProps } from '../Button'
import { isDev, useExitTransition, useOverlayLayer } from './overlay'
import styles from './Dialog.module.css'

export type DialogDismissReason = 'close' | 'cancel' | 'escape' | 'overlay'

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** Controlled open state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called with the dismiss path (close X, Cancel, Escape, overlay click) before `onOpenChange(false)`. */
  onDismiss?: (reason: DialogDismissReason) => void
  /** Required. States the decision: "Delete segment?", "Rename list". Names the dialog for assistive tech. */
  title: ReactNode
  /** Context under the title. Becomes `aria-describedby`. */
  description?: ReactNode
  /** confirmation: message and two actions. form: short form. information: read-only content. */
  complexity?: 'confirmation' | 'form' | 'information'
  /** Widths use min and max, never fixed pixels. */
  size?: 'small' | 'medium' | 'large'
  /** Destructive confirmation: red confirm button, warning icon, and `role="alertdialog"` for confirmations. */
  destructive?: boolean
  /** Verb + noun: "Delete segment", "Save changes". Omit for an information dialog with only Close. */
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  /** Action in progress. Spinner in the confirm button. Cancel, close, Escape and overlay click are blocked. */
  confirming?: boolean
  confirmDisabled?: boolean
  /** Replaces the default footer buttons. Put the primary action last (trailing end). */
  actions?: ReactNode
  /** Overlay click dismisses. Default: true, except for form dialogs (avoids losing input). */
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  /** Accessible name of the close X. */
  closeLabel?: string
  /** Render into document.body (default) or in place for docs and previews. */
  portal?: boolean
  container?: Element | null
  /** Tab is trapped inside while open. Turn off only for in-place docs. */
  trapFocus?: boolean
  /** Body scroll is locked while open. Turn off only for in-place docs. */
  lockScroll?: boolean
  /** Move focus in on open and back to the trigger on close. */
  autoFocus?: boolean
  /** Forced states for docs and previews. Do not use in product code. */
  closeButtonProps?: Partial<ButtonProps>
  cancelButtonProps?: Partial<ButtonProps>
  confirmButtonProps?: Partial<ButtonProps>
  children?: ReactNode
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(props, ref) {
  const { open, defaultOpen = false, onOpenChange, portal = true, container } = props
  const [isOpen, setOpen] = useControllableState<boolean>(open, defaultOpen, onOpenChange)
  const reduced = usePrefersReducedMotion()
  const { mounted, closing } = useExitTransition(isOpen, reduced)
  if (!mounted) return null
  const layer = <DialogLayer {...props} ref={ref} isOpen={isOpen} closing={closing} setOpen={setOpen} />
  return portal ? <Portal container={container}>{layer}</Portal> : layer
})

interface LayerProps extends DialogProps {
  isOpen: boolean
  closing: boolean
  setOpen: (o: boolean) => void
}

const DialogLayer = forwardRef<HTMLDivElement, LayerProps>(function DialogLayer(
  {
    isOpen, closing, setOpen, onDismiss, title, description, complexity = 'confirmation', size = 'medium', destructive = false,
    confirmLabel, cancelLabel, onConfirm, confirming = false, confirmDisabled = false, actions,
    closeOnOverlayClick, closeOnEscape = true, closeLabel = 'Close dialog', portal = true, trapFocus = true, lockScroll = true,
    autoFocus = true, closeButtonProps, cancelButtonProps, confirmButtonProps, children, className, container: _c,
    open: _o, defaultOpen: _d, onOpenChange: _oc, ...rest
  },
  ref,
) {
  const titleId = useId()
  const descId = useId()
  const bodyId = useId()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [scrollable, setScrollable] = useState(false)

  const alert = complexity === 'confirmation' && destructive
  const overlayDismiss = closeOnOverlayClick ?? complexity !== 'form'
  const cancelText = cancelLabel ?? (complexity === 'information' && !confirmLabel ? 'Close' : 'Cancel')

  const dismiss = (reason: DialogDismissReason) => {
    if (confirming) return
    onDismiss?.(reason)
    setOpen(false)
  }

  useOverlayLayer(surfaceRef, {
    active: isOpen && !closing, kind: 'dialog', trap: trapFocus, lockScroll, autoFocus,
    onEscape: () => { if (closeOnEscape) dismiss('escape') },
    initialFocus: () => {
      if (alert) return cancelRef.current
      if (complexity === 'form') {
        const field = bodyRef.current?.querySelector<HTMLElement>('input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href]')
        if (field) return field
      }
      return closeRef.current
    },
  })

  // A scrolling body must be reachable by keyboard.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const measure = () => setScrollable(el.scrollHeight > el.clientHeight + 1)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, description])

  if (isDev() && !confirmLabel && !actions && complexity !== 'information') {
    console.warn('Dialog: confirmation and form dialogs need a confirmLabel (verb + noun) or custom actions.')
  }

  const describedBy = description ? descId : complexity === 'confirmation' ? bodyId : undefined
  const showFooter = Boolean(actions || confirmLabel || cancelText)

  return (
    <div
      ref={ref}
      className={cx(styles.root, className)}
      data-inline={!portal || undefined}
      data-phase={closing ? 'closing' : 'open'}
      {...rest}
    >
      <div className={styles.scrim} aria-hidden="true" onClick={() => { if (overlayDismiss) dismiss('overlay') }} />
      <div
        ref={surfaceRef}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        aria-busy={confirming || undefined}
        className={styles.surface}
        data-size={size}
        data-complexity={complexity}
        data-destructive={destructive || undefined}
      >
        <div className={styles.header}>
          {destructive ? <span className={styles.leadIcon} aria-hidden="true"><Icon name="warning" /></span> : null}
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <Button
            ref={closeRef}
            className={styles.close}
            priority="tertiary"
            size="small"
            iconOnly
            icon={<Icon name="close" />}
            aria-label={closeLabel}
            disabled={confirming}
            onClick={() => dismiss('close')}
            {...closeButtonProps}
          />
        </div>
        <div ref={bodyRef} id={bodyId} className={styles.body} tabIndex={scrollable ? 0 : undefined} role={scrollable ? 'region' : undefined} aria-labelledby={scrollable ? titleId : undefined}>
          {description ? <p id={descId} className={styles.description}>{description}</p> : null}
          {children}
        </div>
        {showFooter ? (
          <div className={styles.footer}>
            {actions ?? (
              <>
                <Button
                  ref={cancelRef}
                  priority={complexity === 'information' && !confirmLabel ? 'primary' : 'secondary'}
                  disabled={confirming}
                  onClick={() => dismiss('cancel')}
                  {...cancelButtonProps}
                >
                  {cancelText}
                </Button>
                {confirmLabel ? (
                  <Button
                    priority={destructive ? 'destructive' : 'primary'}
                    loading={confirming}
                    disabled={confirmDisabled}
                    onClick={() => onConfirm?.()}
                    {...confirmButtonProps}
                  >
                    {confirmLabel}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
})
