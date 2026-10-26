import { forwardRef, useRef, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { Menu, type MenuEntry, type MenuItemData } from '../Menu'
import styles from './SplitButton.module.css'

export interface SplitButtonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'children'> {
  /** Label of the primary action. Verb plus noun. */
  children: ReactNode
  /** Primary or secondary only. Split buttons are not available as tertiary or icon-only. */
  priority?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  /** Related alternative actions in the menu. Keep it to about 5. */
  items: MenuEntry[]
  /** Primary action. Runs independently of the menu. */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  /** An alternative action was chosen in the menu. */
  onAction?: (value: string, item: MenuItemData) => void
  /** Leading icon slot for the primary section. */
  icon?: ReactNode
  /** Disables both sections. */
  disabled?: boolean
  /** Why the split button is unavailable. Announced to assistive tech when disabled. */
  unavailableReason?: string
  /** Replaces the primary label with a spinner. */
  loading?: boolean
  /** Accessible name of the chevron section. Defaults to "More options". */
  triggerLabel?: string
  /** Accessible name of the menu. Defaults to "More actions". */
  menuLabel?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Render the menu in place instead of document.body (docs frames). */
  portal?: boolean
  /** Force a visual state on the primary section for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
  /** Force a visual state on the chevron section for docs and previews. Do not use in product code. */
  'data-trigger-state'?: 'hover' | 'pressed' | 'focus'
}

export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
  {
    children, priority = 'primary', size = 'medium', items, onClick, onAction, icon, disabled = false, unavailableReason, loading = false, triggerLabel = 'More options',
    menuLabel = 'More actions', open, defaultOpen, onOpenChange, portal = true, className, id, 'data-state': primaryState, 'data-trigger-state': triggerState, onKeyDown, ...rest
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Arrow keys move between the two sections. Reading direction decides which arrow goes where.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    const toTrigger = rtl ? 'ArrowLeft' : 'ArrowRight'
    const toPrimary = rtl ? 'ArrowRight' : 'ArrowLeft'
    if (e.target === primaryRef.current && e.key === toTrigger) { e.preventDefault(); triggerRef.current?.focus() }
    else if (e.target === triggerRef.current && e.key === toPrimary) { e.preventDefault(); primaryRef.current?.focus() }
  }

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      id={id}
      role="group"
      className={cx(styles.container, className)}
      data-priority={priority}
      data-disabled={disabled || undefined}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <Button
        ref={primaryRef}
        className={styles.primary}
        priority={priority}
        size={size}
        icon={icon}
        loading={loading}
        disabled={disabled}
        unavailableReason={unavailableReason}
        id={id ? `${id}-primary` : undefined}
        data-state={primaryState}
        onClick={onClick}
      >
        {children}
      </Button>
      <Menu
        className={styles.menu}
        label={menuLabel}
        items={items}
        mode="action"
        onAction={onAction}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        anchorRef={rootRef}
        align="end"
        portal={portal}
        trigger={(p) => (
          <Button
            ref={triggerRef}
            className={styles.trigger}
            priority={priority}
            size={size}
            icon={<Icon name={p.open ? 'chevronUp' : 'chevronDown'} />}
            aria-label={triggerLabel}
            aria-haspopup={p['aria-haspopup']}
            aria-expanded={p['aria-expanded']}
            aria-controls={p['aria-controls']}
            disabled={disabled}
            id={p.id}
            data-state={p.open ? 'pressed' : triggerState}
            onClick={p.onClick}
            onKeyDown={disabled ? undefined : p.onKeyDown}
          />
        )}
      />
    </div>
  )
})
