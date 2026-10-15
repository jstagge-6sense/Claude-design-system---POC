import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { AnatomyPart } from './guidelines'
import { Button } from '../components/Button'
import { Icon } from '../icons'

interface Pt { x: number; y: number }
interface Callout { n: number; badge: Pt; anchor: Pt }

/** Anatomy diagrams: the live library component with numbered callouts measured from its real parts. */
function ButtonAnatomy() {
  const wrap = useRef<HTMLDivElement>(null)
  const [calls, setCalls] = useState<Callout[]>([])
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrap.current
      if (!w) return
      const o = w.getBoundingClientRect()
      const at = (sel: string) => { const r = w.querySelector(sel)?.getBoundingClientRect(); return r ? { l: r.left - o.left, r: r.right - o.left, t: r.top - o.top, b: r.bottom - o.top, cx: (r.left + r.right) / 2 - o.left } : null }
      const btn = at('button'), lead = at('[data-part="lead"]'), label = at('[data-part="label"]'), trail = at('[data-part="trail"]')
      if (!btn || !lead || !label || !trail) return
      setCalls([
        { n: 1, anchor: { x: btn.l + 14, y: btn.t }, badge: { x: btn.l - 28, y: btn.t - 40 } },
        { n: 2, anchor: { x: label.cx, y: label.t }, badge: { x: label.cx, y: btn.t - 40 } },
        { n: 3, anchor: { x: lead.cx, y: lead.b }, badge: { x: lead.cx, y: btn.b + 40 } },
        { n: 4, anchor: { x: trail.cx, y: trail.b }, badge: { x: trail.cx, y: btn.b + 40 } },
        { n: 5, anchor: { x: btn.r + 5, y: (btn.t + btn.b) / 2 }, badge: { x: btn.r + 56, y: (btn.t + btn.b) / 2 } },
      ])
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <div className="pv-anat-stage" role="img" aria-label="Button with five numbered parts: container, label, leading icon, trailing icon, focus ring">
      <div className="pv-anat-wrap" ref={wrap}>
        <Button priority="primary" data-state="focus" tabIndex={-1}
          icon={<span data-part="lead" style={{ display: 'inline-flex' }}><Icon name="plus" /></span>}
          trailingIcon={<span data-part="trail" style={{ display: 'inline-flex' }}><Icon name="chevronDown" /></span>}
        ><span data-part="label">Create Segment</span></Button>
        <svg className="pv-anat-lines" aria-hidden="true">
          {calls.map((c) => <line key={c.n} x1={c.badge.x} y1={c.badge.y} x2={c.anchor.x} y2={c.anchor.y} />)}
        </svg>
        {calls.map((c) => <span key={c.n} className="pv-anat-badge" style={{ left: c.badge.x, top: c.badge.y }} aria-hidden="true">{c.n}</span>)}
      </div>
    </div>
  )
}

export const ANATOMY_DIAGRAMS: Record<string, () => JSX.Element> = { button: ButtonAnatomy }

const GAP = 40

/** Generic live diagram: draws the component's own story with a numbered callout on each part that has a selector. */
export function LiveAnatomy({ parts, children }: { parts: AnatomyPart[]; children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [calls, setCalls] = useState<Array<{ n: number; badge: Pt; anchor: Pt }>>([])
  useLayoutEffect(() => {
    const measure = () => {
      const w = wrap.current
      if (!w) return
      const o = w.getBoundingClientRect()
      const root = w.querySelector('.pv-anat-live')?.firstElementChild ?? null
      const out: Array<{ n: number; badge: Pt; anchor: Pt }> = []
      parts.forEach((p, i) => {
        if (p.selector == null || !root) return
        const el = p.selector === '' ? (root as Element) : root.querySelector(p.selector) ?? (root.matches(p.selector) ? root : null)
        if (!el) return
        const r = el.getBoundingClientRect()
        if (!r.width && !r.height) return
        const l = r.left - o.left, rr = r.right - o.left, t = r.top - o.top, b = r.bottom - o.top, cx = (l + rr) / 2, cy = (t + b) / 2
        const side = p.side || 'top'
        const a = side === 'top' ? { x: cx, y: t } : side === 'bottom' ? { x: cx, y: b } : side === 'left' ? { x: l, y: cy } : { x: rr, y: cy }
        const bd = side === 'top' ? { x: cx, y: t - GAP } : side === 'bottom' ? { x: cx, y: b + GAP } : side === 'left' ? { x: l - GAP, y: cy } : { x: rr + GAP, y: cy }
        out.push({ n: i + 1, badge: bd, anchor: a })
      })
      setCalls(out)
    }
    measure()
    window.addEventListener('resize', measure)
    const t = window.setTimeout(measure, 150)
    return () => { window.removeEventListener('resize', measure); window.clearTimeout(t) }
  }, [parts])
  return (
    <div className="pv-anat-stage">
      <div className="pv-anat-wrap" ref={wrap}>
        <div className="pv-anat-live" {...({ inert: '' } as object)}>{children}</div>
        <svg className="pv-anat-lines" aria-hidden="true">{calls.map((c) => <line key={c.n} x1={c.badge.x} y1={c.badge.y} x2={c.anchor.x} y2={c.anchor.y} />)}</svg>
        {calls.map((c) => <span key={c.n} className="pv-anat-badge" style={{ left: c.badge.x, top: c.badge.y }} aria-hidden="true">{c.n}</span>)}
      </div>
    </div>
  )
}
