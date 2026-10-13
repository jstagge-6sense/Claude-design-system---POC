import { forwardRef, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { Icon, type IconName } from '../../icons'
import { MiniMenu } from '../TopBar/MiniMenu'
import styles from './WysiwygToolbar.module.css'

export type ToolId =
  | 'bold' | 'italic' | 'underline' | 'code'
  | 'link' | 'attachment'
  | 'bulletList' | 'numberedList'
  | 'alignLeft' | 'alignCenter' | 'alignRight'
  | 'outdent' | 'indent'

interface ToolDef {
  id: ToolId
  label: string
  /** Shortcut hint shown in the tooltip only. The editor owns the shortcut itself. */
  hint?: string
  icon: ReactNode
  group: 'style' | 'insert' | 'lists' | 'align' | 'indent'
  /** Core formatting is never hidden behind More. Extended tools can collapse. */
  core: boolean
  /** Toggles a format (aria-pressed). Actions such as attachment do not. */
  toggle: boolean
}

/** Local icon: not in the shared set. Mirrors the shared `indent` icon. */
function OutdentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ inlineSize: '100%', blockSize: '100%' }}>
      <path d="M21 6H11" /><path d="M21 12H11" /><path d="M21 18H11" /><path d="m7 8-4 4 4 4" />
    </svg>
  )
}
const i = (name: IconName) => <Icon name={name} size="100%" />

export const TOOLS: ToolDef[] = [
  { id: 'bold', label: 'Bold', hint: 'Ctrl+B', icon: i('bold'), group: 'style', core: true, toggle: true },
  { id: 'italic', label: 'Italic', hint: 'Ctrl+I', icon: i('italic'), group: 'style', core: true, toggle: true },
  { id: 'underline', label: 'Underline', hint: 'Ctrl+U', icon: i('underline'), group: 'style', core: false, toggle: true },
  { id: 'code', label: 'Code', icon: i('code'), group: 'style', core: false, toggle: true },
  { id: 'link', label: 'Insert link', hint: 'Ctrl+K', icon: i('link'), group: 'insert', core: true, toggle: true },
  { id: 'attachment', label: 'Attach file', icon: i('attachment'), group: 'insert', core: false, toggle: false },
  { id: 'bulletList', label: 'Bulleted list', icon: i('listBullet'), group: 'lists', core: true, toggle: true },
  { id: 'numberedList', label: 'Numbered list', icon: i('listNumber'), group: 'lists', core: true, toggle: true },
  { id: 'alignLeft', label: 'Align left', icon: i('alignLeft'), group: 'align', core: false, toggle: true },
  { id: 'alignCenter', label: 'Align center', icon: i('alignCenter'), group: 'align', core: false, toggle: true },
  { id: 'alignRight', label: 'Align right', icon: i('alignRight'), group: 'align', core: false, toggle: true },
  { id: 'outdent', label: 'Decrease indent', icon: <OutdentIcon />, group: 'indent', core: false, toggle: false },
  { id: 'indent', label: 'Increase indent', icon: i('indent'), group: 'indent', core: false, toggle: false },
]

/** Which tools each variant shows. Minimal is bold, italic, link and a list. Floating is the quick set for a text selection. */
export const VARIANT_TOOLS: Record<'full' | 'minimal' | 'floating', ToolId[]> = {
  full: TOOLS.map((t) => t.id),
  minimal: ['bold', 'italic', 'link', 'bulletList'],
  floating: ['bold', 'italic', 'underline', 'code', 'link', 'bulletList', 'numberedList'],
}

export interface WysiwygToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'onSelect'> {
  /** `id` of the editor this toolbar formats. Required: a toolbar is never disconnected from its editor. */
  controls: string
  /** Accessible name of the toolbar. */
  label?: string
  variant?: 'full' | 'minimal' | 'floating'
  /** Tools to show. Defaults to the variant's set. */
  tools?: ToolId[]
  /** Formats currently applied at the cursor or selection. Rendered as aria-pressed. */
  active?: ToolId[]
  onToolClick?: (tool: ToolId) => void
  /** Disable the whole toolbar. */
  disabled?: boolean
  /** Disable individual tools. */
  disabledTools?: ToolId[]
  /** Extended tools collapse behind More: auto (narrow containers), always, or never. Core formatting never collapses. */
  overflow?: 'auto' | 'always' | 'never'
  /** Floating variant: whether it is shown (when text is selected). */
  visible?: boolean
  /** Floating variant: where to place it, in px or any CSS length, relative to the positioned parent. */
  position?: { top: number | string; left: number | string }
  /** Render the More menu open, for docs and previews. */
  defaultMoreOpen?: boolean
  moreLabel?: string
  /** Force a visual state on a tool, for docs and previews. Do not use in product code. */
  forcedStates?: Partial<Record<ToolId, 'hover' | 'pressed' | 'focus'>>
}

const GROUP_ORDER: ToolDef['group'][] = ['style', 'insert', 'lists', 'align', 'indent']

export const WysiwygToolbar = forwardRef<HTMLDivElement, WysiwygToolbarProps>(function WysiwygToolbar(
  {
    controls, label = 'Text formatting', variant = 'full', tools, active = [], onToolClick, disabled = false, disabledTools = [], overflow = 'auto', visible = true,
    position, defaultMoreOpen = false, moreLabel = 'More formatting', forcedStates, className, style, onKeyDown, onFocus, ...rest
  },
  ref,
) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production' && !controls) {
    console.warn('WysiwygToolbar: pass `controls` (the editor id). A toolbar must always be connected to its editor.')
  }
  const rootRef = useRef<HTMLDivElement>(null)
  const ids = tools ?? VARIANT_TOOLS[variant]
  const shown = TOOLS.filter((t) => ids.includes(t.id))
  const canCollapse = overflow !== 'never' && variant !== 'floating' && shown.some((t) => !t.core)
  const [stop, setStop] = useState<string>(shown[0]?.id ?? 'more')

  const tabbables = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[data-tool]') ?? []).filter((el) => {
    for (let n: HTMLElement | null = el; n && n !== rootRef.current; n = n.parentElement) if (getComputedStyle(n).display === 'none') return false
    return true
  })

  // Keep one visible tool in the tab order when the container resizes and hides the current one.
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const list = tabbables()
      if (list.length && !list.some((t) => t.dataset.tool === stop)) setStop(list[0].dataset.tool ?? 'more')
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if ((e.target as HTMLElement).closest('[role="menu"]')) return
    const list = tabbables()
    const idx = list.indexOf(document.activeElement as HTMLElement)
    if (idx < 0) return
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false
    let n = -1
    if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = (idx + 1) % list.length
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) n = (idx - 1 + list.length) % list.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = list.length - 1
    if (n < 0) return
    e.preventDefault()
    list[n].focus()
  }
  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    onFocus?.(e)
    const id = (e.target as HTMLElement).closest<HTMLElement>('[data-tool]')?.dataset.tool
    if (id) setStop(id)
  }

  if (variant === 'floating' && !visible) return null

  const isActive = (id: ToolId) => active.includes(id)
  const isOff = (id: ToolId) => disabled || disabledTools.includes(id)
  const press = (t: ToolDef) => { if (!isOff(t.id)) onToolClick?.(t.id) }

  const renderTool = (t: ToolDef) => (
    <button
      key={t.id}
      type="button"
      className={styles.tool}
      data-tool={t.id}
      data-state={forcedStates?.[t.id]}
      tabIndex={stop === t.id ? 0 : -1}
      aria-label={t.label}
      title={t.hint ? `${t.label} (${t.hint})` : t.label}
      aria-pressed={t.toggle ? isActive(t.id) : undefined}
      aria-disabled={isOff(t.id) || undefined}
      onClick={() => press(t)}
    >
      <span className={styles.icon} aria-hidden="true">{t.icon}</span>
    </button>
  )

  const groups = GROUP_ORDER.map((g) => ({ g, items: shown.filter((t) => t.group === g) })).filter((x) => x.items.length)
  const extendedTools = shown.filter((t) => !t.core)
  let seen = 0

  return (
    <div
      ref={mergeRefs(ref, rootRef)}
      role="toolbar"
      aria-label={label}
      aria-controls={controls}
      aria-orientation="horizontal"
      aria-disabled={disabled || undefined}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-overflow={canCollapse ? overflow : 'never'}
      style={variant === 'floating' && position ? ({ position: 'absolute', insetBlockStart: position.top, insetInlineStart: position.left, ...style } as CSSProperties) : style}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...rest}
    >
      {groups.map(({ g, items }) => {
        const core = items.filter((t) => t.core)
        const ext = items.filter((t) => !t.core)
        const divided = seen > 0
        seen += 1
        return (
          <div key={g} className={styles.groupWrap} role="group" aria-label={g === 'style' ? 'Text style' : g === 'insert' ? 'Insert' : g === 'lists' ? 'Lists' : g === 'align' ? 'Alignment' : 'Indentation'} data-divided={divided || undefined} data-extended={core.length === 0 ? true : undefined}>
            {core.map(renderTool)}
            {ext.length ? <span className={styles.extended}>{ext.map(renderTool)}</span> : null}
          </div>
        )
      })}
      {canCollapse ? (
        <div className={styles.more} data-divided>
          <MiniMenu
            label={moreLabel}
            defaultOpen={defaultMoreOpen}
            align="end"
            items={extendedTools.map((t) => ({
              id: t.id,
              label: t.label,
              icon: <span className={styles.menuIcon}>{t.icon}</span>,
              checked: t.toggle ? isActive(t.id) : undefined,
              disabled: isOff(t.id),
              onSelect: () => onToolClick?.(t.id),
            }))}
            trigger={(p, s) => (
              <button
                type="button"
                className={styles.tool}
                data-tool="more"
                data-open={s.open || undefined}
                tabIndex={stop === 'more' ? 0 : -1}
                aria-label={moreLabel}
                aria-disabled={disabled || undefined}
                {...p}
                onClick={disabled ? undefined : p.onClick}
                onKeyDown={disabled ? undefined : p.onKeyDown}
              >
                <span className={styles.icon} aria-hidden="true"><Icon name="more" size="100%" /></span>
              </button>
            )}
          />
        </div>
      ) : null}
    </div>
  )
})
