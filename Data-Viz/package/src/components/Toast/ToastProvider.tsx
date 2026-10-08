import {
  createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type HTMLAttributes, type ReactNode,
} from 'react'
import { cx } from '../../primitives/cx'
import { Portal } from '../../primitives/Portal'
import { usePrefersReducedMotion } from '../../primitives/hooks'
import { Toast, type ToastAction, type ToastSeverity } from './Toast'
import styles from './Toast.module.css'

export type ToastPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'

export interface ToastOptions {
  /** Stable id. Showing a toast with an existing id refreshes it. */
  id?: string
  severity?: ToastSeverity
  /** A string, or a function of the aggregate count: `(n) => `${n} workflows published``. */
  title: string | ((count: number) => string)
  description?: ReactNode
  action?: ToastAction
  /** Milliseconds. Default 5000, 8000 with an action. Errors are persistent. `null` is persistent. */
  duration?: number | null
  /** Same key while visible or queued: merge into one toast and bump the count. */
  aggregateKey?: string
  /** Show the close button. Default: only for errors and persistent toasts. */
  closable?: boolean
  onDismiss?: () => void
}

interface Entry {
  id: string
  opts: ToastOptions
  count: number
  /** Bumped when the toast is refreshed so its timer restarts. */
  nonce: number
  leaving: boolean
}

export interface ToastApi {
  toast: (opts: ToastOptions) => string
  info: (title: ToastOptions['title'], opts?: Omit<ToastOptions, 'title' | 'severity'>) => string
  success: (title: ToastOptions['title'], opts?: Omit<ToastOptions, 'title' | 'severity'>) => string
  warning: (title: ToastOptions['title'], opts?: Omit<ToastOptions, 'title' | 'severity'>) => string
  error: (title: ToastOptions['title'], opts?: Omit<ToastOptions, 'title' | 'severity'>) => string
  dismiss: (id: string) => void
  /** Dismiss everything, including queued toasts. Call on navigation. */
  dismissAll: () => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>.')
  return ctx
}

/** Error > Warning > Success > Info. */
const RANK: Record<ToastSeverity, number> = { error: 0, warning: 1, success: 2, info: 3 }
const EXIT_MS = 200
const DEFAULT_MS = 5000
const ACTION_MS = 8000
/** Auto-dismiss is extended when motion is reduced, because nothing animates to draw the eye. */
const REDUCED_FACTOR = 2

const sev = (e: Entry): ToastSeverity => e.opts.severity ?? 'info'
const titleOf = (e: Entry) => (typeof e.opts.title === 'function' ? e.opts.title(e.count) : e.opts.title)
const keyOf = (o: ToastOptions) => o.aggregateKey ?? (typeof o.title === 'string' ? `${o.severity ?? 'info'}:${o.title}` : undefined)

function durationOf(o: ToastOptions, reduced: boolean): number | null {
  if (o.duration !== undefined) return o.duration && o.duration > 0 ? o.duration * (reduced ? REDUCED_FACTOR : 1) : null
  if ((o.severity ?? 'info') === 'error') return null
  return (o.action ? ACTION_MS : DEFAULT_MS) * (reduced ? REDUCED_FACTOR : 1)
}

export interface ToastViewportProps extends HTMLAttributes<HTMLDivElement> {
  placement?: ToastPlacement
  /** Render into document.body (default) or in place inside a positioned frame. */
  portal?: boolean
  container?: Element | null
  /** Accessible name of the region. */
  label?: string
}

/** Fixed stack at a screen corner. z-index: toast tier (600), above dialogs. */
export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(function ToastViewport(
  { placement = 'bottom-end', portal = true, container, label = 'Notifications', className, children, ...rest },
  ref,
) {
  const node = (
    <div ref={ref} role="region" aria-label={label} className={cx(styles.viewport, className)} data-placement={placement} data-inline={!portal || undefined} {...rest}>
      {children}
    </div>
  )
  return portal ? <Portal container={container}>{node}</Portal> : node
})

export interface ToastProviderProps {
  children?: ReactNode
  /** Most toasts visible at once. The rest queue, most urgent first. */
  max?: number
  placement?: ToastPlacement
  portal?: boolean
  container?: Element | null
  /** Toasts present on first render. For docs and tests. */
  initialToasts?: ToastOptions[]
}

export function ToastProvider({ children, max = 3, placement = 'bottom-end', portal = true, container, initialToasts }: ToastProviderProps) {
  const counter = useRef(0)
  const mk = (opts: ToastOptions, id?: string): Entry => ({ id: id ?? opts.id ?? `toast-${++counter.current}`, opts, count: 1, nonce: 0, leaving: false })
  const [state, setState] = useState<{ visible: Entry[]; queue: Entry[] }>(() => {
    const all = (initialToasts ?? []).map(mk)
    return { visible: all.slice(0, max), queue: all.slice(max) }
  })
  const maxRef = useRef(max)
  maxRef.current = max

  const stateRef = useRef(state)
  stateRef.current = state

  const toast = useCallback((opts: ToastOptions) => {
    const key = keyOf(opts)
    const matches = (e: Entry) => Boolean((opts.id && e.id === opts.id) || (key && keyOf(e.opts) === key))
    const current = [...stateRef.current.visible, ...stateRef.current.queue].find(matches)
    const newId = current?.id ?? opts.id ?? `toast-${++counter.current}`
    setState((s) => {
      const existing = [...s.visible, ...s.queue].find(matches)
      if (existing) {
        const bump = (e: Entry): Entry => e.id !== existing.id ? e : {
          ...e, opts: { ...e.opts, ...opts }, nonce: e.nonce + 1, leaving: false,
          // Aggregate keys count merged toasts. Identical repeats just refresh the timer, never stack.
          count: opts.aggregateKey ? e.count + 1 : e.count,
        }
        return { visible: s.visible.map(bump), queue: s.queue.map(bump) }
      }
      const entry = mk(opts, newId)
      return s.visible.filter((e) => !e.leaving).length < maxRef.current
        ? { ...s, visible: [...s.visible, entry] }
        : { ...s, queue: [...s.queue, entry] }
    })
    return newId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Marks a visible toast as leaving. The item removes itself after its exit transition. */
  const dismiss = useCallback((id: string) => {
    setState((s) => {
      if (s.queue.some((e) => e.id === id)) return { ...s, queue: s.queue.filter((e) => e.id !== id) }
      return { ...s, visible: s.visible.map((e) => (e.id === id ? { ...e, leaving: true } : e)) }
    })
  }, [])

  const remove = useCallback((id: string) => {
    setState((s) => {
      const gone = s.visible.find((e) => e.id === id)
      if (!gone) return s
      const visible = s.visible.filter((e) => e.id !== id)
      const queue = [...s.queue]
      while (visible.length < maxRef.current && queue.length) {
        let best = 0
        queue.forEach((e, i) => { if (RANK[sev(e)] < RANK[sev(queue[best])]) best = i })
        visible.push(queue.splice(best, 1)[0])
      }
      return { visible, queue }
    })
  }, [])

  const dismissAll = useCallback(() => {
    setState((s) => ({ visible: s.visible.map((e) => ({ ...e, leaving: true })), queue: [] }))
  }, [])

  const api = useMemo<ToastApi>(() => {
    const at = (severity: ToastSeverity) => (title: ToastOptions['title'], opts?: Omit<ToastOptions, 'title' | 'severity'>) => toast({ ...opts, title, severity })
    return { toast, info: at('info'), success: at('success'), warning: at('warning'), error: at('error'), dismiss, dismissAll }
  }, [toast, dismiss, dismissAll])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport placement={placement} portal={portal} container={container}>
        {state.visible.map((e) => (
          <ToastItem key={e.id} entry={e} onDismiss={dismiss} onRemove={remove} />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  )
}

function ToastItem({ entry, onDismiss, onRemove }: { entry: Entry; onDismiss: (id: string) => void; onRemove: (id: string) => void }) {
  const { id, opts, nonce, leaving } = entry
  const reduced = usePrefersReducedMotion()
  const duration = durationOf(opts, reduced)
  const closable = opts.closable ?? (duration === null || (opts.severity ?? 'info') === 'error')

  // Auto-dismiss timer. Pauses on hover and on keyboard focus inside, resumes with the time that was left.
  const remaining = useRef<number>(duration ?? 0)
  const startedAt = useRef<number>(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hovered = useRef(false)
  const focused = useRef(false)
  const stop = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  const start = () => {
    stop()
    if (duration === null || leaving) return
    startedAt.current = Date.now()
    timer.current = setTimeout(() => onDismiss(id), Math.max(remaining.current, 0))
  }
  const pause = () => {
    if (!timer.current) return
    remaining.current -= Date.now() - startedAt.current
    stop()
  }
  const resumeIfIdle = () => { if (!hovered.current && !focused.current) start() }

  // Restart whenever the toast is refreshed (new nonce) or its duration changes.
  useEffect(() => {
    remaining.current = duration ?? 0
    resumeIfIdle()
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, duration, leaving])

  // Exit transition, then remove. Instant under reduced motion.
  useEffect(() => {
    if (!leaving) return
    stop()
    if (reduced) { onRemove(id); opts.onDismiss?.(); return }
    const t = setTimeout(() => { onRemove(id); opts.onDismiss?.() }, EXIT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving])

  return (
    <Toast
      severity={opts.severity ?? 'info'}
      title={titleOf(entry)}
      description={opts.description}
      action={opts.action ? { ...opts.action, onClick: () => { opts.action?.onClick(); onDismiss(id) } } : undefined}
      closable={closable}
      onClose={() => onDismiss(id)}
      leaving={leaving}
      onMouseEnter={() => { hovered.current = true; pause() }}
      onMouseLeave={() => { hovered.current = false; resumeIfIdle() }}
      onFocus={() => { focused.current = true; pause() }}
      onBlur={(ev) => {
        if (ev.currentTarget.contains(ev.relatedTarget as Node | null)) return
        focused.current = false
        resumeIfIdle()
      }}
    />
  )
}
