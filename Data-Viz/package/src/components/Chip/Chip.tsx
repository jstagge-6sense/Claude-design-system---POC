import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Button } from '../Button'
import styles from './Chip.module.css'

export interface ChipProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange'> {
  /** dismissible: user can remove it. choice: user selects from a set (aria-pressed). viewOnly: non-interactive display. */
  variant?: 'dismissible' | 'choice' | 'viewOnly'
  /** Chip text. Always required: never icon-only or avatar-only. */
  children: ReactNode
  /** Leading icon or avatar (INSTANCE_SWAP). */
  leading?: ReactNode
  /** Sizes the leading slot. Icons are 16px, avatars are 24px. */
  leadingType?: 'icon' | 'avatar'
  /** Choice chips. Controlled selected state. */
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
  /** Dismissible chips. Called when the remove button is used. */
  onDismiss?: (e: MouseEvent<HTMLButtonElement>) => void
  /** Accessible name for the remove button. Defaults to "Remove [text]". Pass it when the children are not a string. */
  dismissLabel?: string
  disabled?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
}

export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(
  {
    variant = 'choice', children, leading, leadingType = 'icon', selected, defaultSelected = false, onSelectedChange,
    onDismiss, dismissLabel, disabled = false, className, onClick, ...rest
  },
  ref,
) {
  const [isSelected, setSelected] = useControllableState<boolean>(selected, defaultSelected, onSelectedChange)
  const text = typeof children === 'string' || typeof children === 'number' ? String(children) : undefined
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    if (variant === 'dismissible' && !dismissLabel && !text) console.warn('Chip: pass dismissLabel when children are not plain text so the remove button has a name.')
  }
  const choiceSelected = variant === 'choice' && isSelected
  // A selected choice chip shows a check in place of an icon. An avatar stays.
  const leadingNode = choiceSelected && leadingType === 'icon' ? <Icon name="check" /> : leading
  const hasAvatar = leadingNode != null && leadingType === 'avatar' && !(choiceSelected && leadingType === 'icon')
  const common = {
    className: cx(styles.root, className),
    'data-variant': variant,
    'data-selected': choiceSelected || undefined,
    'data-disabled': disabled || undefined,
    'data-avatar': hasAvatar || undefined,
  }
  const content = (
    <>
      {leadingNode != null ? <span className={styles.leading} data-type={leadingType} aria-hidden="true">{leadingNode}</span> : null}
      <span className={styles.label}>{children}</span>
    </>
  )

  if (variant === 'choice') {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-pressed={isSelected}
        disabled={disabled}
        onClick={(e) => { onClick?.(e as unknown as MouseEvent<HTMLElement>); if (!e.defaultPrevented) setSelected(!isSelected) }}
        {...common}
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    )
  }

  if (variant === 'dismissible') {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} onClick={onClick} {...common} {...rest}>
        {content}
        <button
          type="button"
          className={styles.dismiss}
          aria-label={dismissLabel ?? `Remove ${text ?? 'item'}`}
          disabled={disabled}
          onClick={onDismiss}
        >
          <Icon name="close" />
        </button>
      </span>
    )
  }

  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} onClick={onClick} {...common} {...rest}>
      {content}
    </span>
  )
})

export interface ChipGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Describes the set, for example "Selected industries". Required. */
  'aria-label': string
  children?: ReactNode
  /** Adds a Clear all action after the chips. Called when it is used. */
  onClearAll?: () => void
  /** Defaults to "Clear all". */
  clearAllLabel?: string
  /** Hide Clear all while keeping the handler, for example when the set is empty. Defaults to true when `onClearAll` is set. */
  showClearAll?: boolean
}

export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(
  { children, onClearAll, clearAllLabel = 'Clear all', showClearAll, className, ...rest },
  ref,
) {
  const showClear = (showClearAll ?? Boolean(onClearAll)) && Boolean(onClearAll)
  return (
    <div ref={ref} role="group" className={cx(styles.group, className)} {...rest}>
      {children}
      {showClear ? <Button priority="tertiary" size="small" onClick={onClearAll}>{clearAllLabel}</Button> : null}
    </div>
  )
})
