import { forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import styles from './ButtonGroup.module.css'

export interface ButtonGroupItem {
  value: string
  /** Segment text. Omit only for an icon-only segment, which then needs `aria-label`. */
  label?: ReactNode
  /** Leading icon slot (INSTANCE_SWAP). */
  icon?: ReactNode
  /** Disable one segment. The others stay usable. */
  disabled?: boolean
  'aria-label'?: string
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
}

export interface ButtonGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  /** Describes the purpose of the group. Required. */
  'aria-label': string
  /** 2 to 5 segments. Beyond 5, use Tabs or another pattern. */
  items: ButtonGroupItem[]
  /** action: each segment runs a command. selection: segments choose a state. One component, two modes. */
  mode?: 'action' | 'selection'
  /** Selection mode only. */
  selectionMode?: 'single' | 'multi'
  /** Selected values in selection mode. Single select holds at most one. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Action mode: a segment was activated. */
  onAction?: (value: string) => void
  size?: 'small' | 'medium' | 'large'
  /** Stack the segments vertically. */
  stack?: boolean
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { items, mode = 'action', selectionMode = 'single', value, defaultValue = [], onValueChange, onAction, size = 'medium', stack = false, className, onKeyDown, ...rest },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useControllableState<string[]>(value, defaultValue, onValueChange)
  const selecting = mode === 'selection'
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    if (items.length < 2 || items.length > 5) console.warn('ButtonGroup: use 2 to 5 segments. Beyond 5, use Tabs or another pattern.')
    if (items.some((i) => !i.label && !i['aria-label'])) console.warn('ButtonGroup: an icon-only segment needs an aria-label.')
  }

  // One tab stop for the whole group. Arrow keys move inside it.
  const firstEnabled = items.find((i) => !i.disabled)?.value
  const initial = (selecting ? items.find((i) => !i.disabled && selected.includes(i.value))?.value : undefined) ?? firstEnabled
  const [focused, setFocused] = useState<string | undefined>(initial)
  const tabStop = items.some((i) => i.value === focused && !i.disabled) ? focused : initial

  const activate = (item: ButtonGroupItem) => {
    if (item.disabled) return
    if (!selecting) { onAction?.(item.value); return }
    if (selectionMode === 'multi') setSelected(selected.includes(item.value) ? selected.filter((v) => v !== item.value) : [...selected, item.value])
    else if (!selected.includes(item.value)) setSelected([item.value])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('button:not([aria-disabled="true"])') ?? [])
    const idx = buttons.indexOf(e.target as HTMLButtonElement)
    if (idx < 0) return
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    const next = stack ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const prev = stack ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    let to = -1
    if (e.key === next) to = (idx + 1) % buttons.length
    else if (e.key === prev) to = (idx - 1 + buttons.length) % buttons.length
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = buttons.length - 1
    if (to < 0) return
    e.preventDefault()
    buttons[to].focus()
  }

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      role="group"
      className={cx(styles.group, className)}
      data-stack={stack || undefined}
      data-size={size}
      data-mode={mode}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {items.map((item) => {
        const isSelected = selecting && selected.includes(item.value)
        return (
          <button
            key={item.value}
            type="button"
            className={styles.segment}
            aria-label={item['aria-label']}
            aria-pressed={selecting ? isSelected : undefined}
            aria-disabled={item.disabled || undefined}
            tabIndex={item.value === tabStop ? 0 : -1}
            data-selected={isSelected || undefined}
            data-state={item['data-state']}
            onFocus={() => setFocused(item.value)}
            onClick={() => activate(item)}
          >
            {item.icon ? <span className={styles.icon} aria-hidden="true">{item.icon}</span> : null}
            {item.label != null ? <span className={styles.label}>{item.label}</span> : null}
          </button>
        )
      })}
    </div>
  )
})
