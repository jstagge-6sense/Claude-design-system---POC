import { Component, useState, type ReactNode } from 'react'
import { Drawer } from '../components/Drawer'
import { Menu, MenuTrigger } from '../components/Menu'
import { Accordion, AccordionItem } from '../components/Accordion'
import { Popover } from '../components/Popover'
import { Dialog } from '../components/Dialog'
import { ProgressBar } from '../components/ProgressBar'
import { ProgressCircle } from '../components/ProgressCircle'
import { Button } from '../components/Button'
import { DATA, TOKEN_LIST } from './data'

const byPrefix = (p: string) => TOKEN_LIST.filter((t) => t.name.startsWith(p))
const tail = (n: string, p: string) => n.slice(p.length)

function Section({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return <section className="pv-section"><h2>{title}</h2>{note ? <p className="pv-muted">{note}</p> : null}{children}</section>
}
const Swatch = ({ name, cssVar, label }: { name: string; cssVar: string; label?: string }) => (
  <div className="pv-sw"><span style={{ background: `var(${cssVar})` }} /><code>{label ?? name}</code></div>
)

export function ColorsPage() {
  const families = ['white', 'black', 'sage', 'ink', 'teal', 'blue', 'red', 'amber', 'green']
  const sem = (p: string) => byPrefix(`core.color.${p}.`).filter((t) => t.layer === 'semantic')
  return (
    <>
      <Section title="Primitive colors" note="Raw values. Never used directly in components.">
        {families.map((f) => {
          const toks = TOKEN_LIST.filter((t) => t.layer === 'primitive' && (t.name === `core.color.${f}` || t.name.startsWith(`core.color.${f}.`)))
          return <div key={f} className="pv-swrow"><strong>{f}</strong><div className="pv-swgrid">{toks.map((t) => <Swatch key={t.name} name={t.name} cssVar={t.cssVar} label={tail(t.name, `core.color.`)} />)}</div></div>
        })}
        <div className="pv-swrow"><strong>gradients</strong><div className="pv-swgrid">{byPrefix('core.gradient.').map((t) => <Swatch key={t.name} name={t.name} cssVar={t.cssVar} label={tail(t.name, 'core.gradient.')} />)}</div></div>
      </Section>
      {['surface', 'content', 'status', 'border', 'action'].map((g) => (
        <Section key={g} title={`Semantic: ${g}`}>
          <div className="pv-swgrid">{sem(g).map((t) => <Swatch key={t.name} name={t.name} cssVar={t.cssVar} label={tail(t.name, `core.color.${g}.`)} />)}</div>
        </Section>
      ))}
    </>
  )
}

export function TypographyPage() {
  const styles = TOKEN_LIST.filter((t) => t.layer === 'semantic' && t.kind === 'typography')
  return (
    <>
      <Section title="Text styles" note="Atkinson Hyperlegible Next. Sizes follow a 1.2 modular scale.">
        {styles.map((t) => (
          <div key={t.name} className="pv-type">
            <code>{t.name.replace('core.typography.', '')}</code>
            <span style={{ font: `var(${t.cssVar}-font)`, textDecoration: `var(${t.cssVar}-text-decoration)` as never }}>Segments that convert faster</span>
          </div>
        ))}
      </Section>
      <Section title="Primitive scale">
        {byPrefix('core.typography.fontSize.').map((t) => (
          <div key={t.name} className="pv-type"><code>fontSize.{tail(t.name, 'core.typography.fontSize.')} · {t.value}</code><span style={{ fontSize: `var(${t.cssVar})`, fontFamily: 'var(--core-typography-fontFamily-sans)' }}>The quick brown fox</span></div>
        ))}
      </Section>
    </>
  )
}

export function SpacingPage() {
  const g = (p: string) => byPrefix(p)
  return (
    <>
      <Section title="Space" note="Semantic space tokens on the left, primitive steps below.">
        {g('core.dimension.space.').map((t) => (
          <div key={t.name} className="pv-bar"><code>{tail(t.name, 'core.dimension.space.')}</code><span style={{ inlineSize: `var(${t.cssVar})`, minInlineSize: 1 }} /><em>{t.value}</em><span className="pv-pill">{t.layer}</span></div>
        ))}
      </Section>
      <Section title="Size">
        {g('core.dimension.size.').map((t) => (
          <div key={t.name} className="pv-bar"><code>{tail(t.name, 'core.dimension.size.')}</code><span style={{ inlineSize: `var(${t.cssVar})`, minInlineSize: 1 }} /><em>{t.value}</em><span className="pv-pill">{t.layer}</span></div>
        ))}
      </Section>
      <Section title="Radius">
        <div className="pv-swgrid">
          {g('core.dimension.radius.').map((t) => (
            <div key={t.name} className="pv-sw"><span style={{ borderRadius: `var(${t.cssVar})`, background: 'var(--core-color-surface-card)', border: '1px solid var(--core-color-ink-700)' }} /><code>{tail(t.name, 'core.dimension.radius.')} · {t.value}</code></div>
          ))}
        </div>
      </Section>
      <Section title="Border width">
        {g('core.dimension.borderWidth.').map((t) => (
          <div key={t.name} className="pv-bar"><code>{tail(t.name, 'core.dimension.borderWidth.')}</code><span style={{ inlineSize: 120, blockSize: `var(${t.cssVar})`, background: 'var(--core-color-ink-900)' }} /><em>{t.value}</em></div>
        ))}
      </Section>
    </>
  )
}

export function EffectsPage() {
  const shadows = TOKEN_LIST.filter((t) => t.kind === 'shadow' && t.layer !== 'component')
  return (
    <>
      <Section title="Shadows and bevels" note="Button bevel recipes, container shadows, focus ring and the elevation ladder.">
        <div className="pv-swgrid big">
          {shadows.map((t) => (
            <div key={t.name} className="pv-sw big"><span style={{ boxShadow: `var(${t.cssVar})`, background: 'var(--core-color-sage-300)', borderRadius: 12 }} /><code>{t.name.replace('core.effect.', '')}</code></div>
          ))}
        </div>
      </Section>
      <Section title="Opacity and blur">
        {byPrefix('core.effect.opacity.').map((t) => (
          <div key={t.name} className="pv-bar"><code>opacity.{tail(t.name, 'core.effect.opacity.')}</code><span style={{ inlineSize: 120, blockSize: 16, background: 'var(--core-color-ink-900)', opacity: `var(${t.cssVar})` as never }} /><em>{t.value}</em></div>
        ))}
        {byPrefix('core.effect.blur.').map((t) => (
          <div key={t.name} className="pv-bar"><code>blur.{tail(t.name, 'core.effect.blur.')}</code><em>{t.value}</em></div>
        ))}
      </Section>
    </>
  )
}

export function GapsPage() {
  const gapMap = new Map<string, { tokens: string[]; note: string }>()
  for (const g of DATA.gaps) {
    const e = gapMap.get(g.id) || { tokens: [], note: g.note }
    e.tokens.push(g.token); if (!e.note && g.note) e.note = g.note
    gapMap.set(g.id, e)
  }
  const all = DATA.state.conflicts || []
  const isClosed = (st?: string) => /^(resolved|decided|allowed|noted)/i.test(st || '')
  const conflicts = [...all].sort((x, y) => Number(isClosed(x.status)) - Number(isClosed(y.status)))
  const openCount = all.filter((c) => !isClosed(c.status)).length
  return (
    <>
      <Section title={`Conflicts (${openCount} open, ${all.length - openCount} closed)`} note="Found while building. Open ones need a human decision. Closed ones are resolved, decided or noted. Nothing was resolved silently.">
        {conflicts.map((c) => (
          <div key={c.id} className="pv-card" style={isClosed(c.status) ? { opacity: 0.65 } : undefined}><strong>{c.id}. {c.title}</strong><p>{c.detail}</p>{c.status ? <span className="pv-pill">{c.status}</span> : null}</div>
        ))}
        {!conflicts.length ? <p className="pv-muted">None recorded.</p> : null}
      </Section>
      <Section title={`Gaps (${gapMap.size})`} note="Roles with no semantic token. Each uses an approved placeholder alias to a primitive until we add a semantic token or choose another mapping.">
        {[...gapMap.entries()].sort().map(([id, e]) => (
          <div key={id} className="pv-card"><strong>{id}</strong><p>{e.note}</p><details><summary>{e.tokens.length} token{e.tokens.length === 1 ? '' : 's'}</summary><ul>{e.tokens.map((n) => <li key={n}><code>{n}</code></li>)}</ul></details></div>
        ))}
      </Section>
    </>
  )
}

export class Boundary extends Component<{ name: string; children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) { return { err } }
  render() {
    return this.state.err
      ? <div className="pv-err" role="alert"><strong>{this.props.name} failed to render</strong><pre>{String(this.state.err.message)}</pre></div>
      : this.props.children
  }
}

const MENU_ITEMS = [
  { value: 'rename', label: 'Rename' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive' },
]

export function MotionPage() {
  const [drawer, setDrawer] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [push, setPush] = useState(false)
  const [run, setRun] = useState(0)
  const tokens = byPrefix('core.motion.')
  return (
    <>
      <Section title="Motion pilot" note="One sample each. Drawer: core.motion.panel.* (enter and exit). Dropdown and Popover: core.motion.popup.* (enter only). Accordion: core.motion.expand.* plus core.motion.feedback.* on the chevron. Dialog: core.motion.modal.*. Progress bar and circle: core.motion.progress.* (slide or sweep in from empty while the number counts up). Turn on reduced motion in the OS to see them go instant.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start', marginBlockStart: 12 }}>
          <Button priority="secondary" onClick={() => setDrawer(true)}>Open drawer</Button>
          <Button priority="secondary" onClick={() => setPush(!push)}>{push ? 'Close push drawer' : 'Open push drawer'}</Button>
          <Button priority="secondary" onClick={() => setDialog(true)}>Open dialog</Button>
          <Menu label="Actions" items={MENU_ITEMS} trigger={<MenuTrigger>Dropdown</MenuTrigger>} />
          <Popover mode="rich" title="Popover" content="Fades in and nudges 4px away from its trigger." side="bottom" closeButton>
            <Button priority="secondary">Popover</Button>
          </Popover>
        </div>
        <div style={{ display: 'flex', blockSize: 240, marginBlockStart: 16, border: '1px solid var(--core-color-border-standard)', overflow: 'hidden' }}>
          <div style={{ flex: '1 1 0', minInlineSize: 0, padding: 16 }}>
            <strong>Page content</strong>
            <p style={{ margin: '8px 0 0' }}>The push drawer takes width from this area instead of covering it.</p>
          </div>
          <Drawer open={push} onOpenChange={setPush} behavior="push" size="small" title="Push drawer">
            <p>Sits in the layout. No scrim.</p>
          </Drawer>
        </div>
        <div style={{ maxInlineSize: '32rem', marginBlockStart: 16 }}>
          <Accordion type="multiple" defaultValue={['one']}>
            <AccordionItem value="one" title="Expand and collapse">Content grows and shrinks over 200ms with the standard curve.</AccordionItem>
            <AccordionItem value="two" title="Another panel">The chevron rotates using the feedback duration.</AccordionItem>
          </Accordion>
        </div>
        <div style={{ maxInlineSize: '32rem', marginBlockStart: 16, display: 'grid', gap: 8 }}>
          <ProgressBar key={run} label="Progress bar" value={72} showValue />
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBlock: 8 }}>
            <ProgressCircle key={`c${run}`} label="Progress circle" value={72} />
          </div>
          <div><Button priority="secondary" size="small" onClick={() => setRun(run + 1)}>Replay</Button></div>
        </div>
        <Dialog open={dialog} onOpenChange={setDialog} complexity="confirmation" size="small" title="Motion test" description="Fades and grows in over 200ms, leaves in 120ms." confirmLabel="Done" onConfirm={() => setDialog(false)} />
        <Drawer open={drawer} onOpenChange={setDrawer} side="end" title="Motion test" primaryAction={<Button priority="primary" onClick={() => setDrawer(false)}>Done</Button>}>
          <p>Enter decelerates over 320ms; exit accelerates over 200ms.</p>
        </Drawer>
      </Section>
      <Section title="Motion tokens">
        {tokens.map((t) => (
          <div key={t.name} style={{ display: 'flex', gap: 16, alignItems: 'baseline', paddingBlock: 2 }}><code style={{ flex: '0 0 15rem' }}>{t.name.replace('core.motion.', '')}</code><em>{t.value}</em></div>
        ))}
      </Section>
    </>
  )
}

export function ScrollbarsPage() {
  const rows = Array.from({ length: 14 }, (_, i) => `Row ${i + 1}: scrollable content`)
  const box = { border: '1px solid var(--pv-line)', borderRadius: 8, background: 'var(--pv-panel)', padding: 12 } as const
  return (
    <>
      <Section title="Scroll bars" note="Every scroll bar in the preview uses one custom style instead of the browser default: a slim rounded thumb on a transparent track. The thumb turns the accent color on hover and while dragging. Scroll the areas below to try it.">
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          <div><strong>Vertical</strong><div style={{ ...box, blockSize: 160, overflowY: 'auto' }}>{rows.map((r) => <p key={r} style={{ margin: '0 0 8px' }}>{r}</p>)}</div></div>
          <div><strong>Horizontal</strong><div style={{ ...box, overflowX: 'auto' }}><p style={{ margin: 0, whiteSpace: 'nowrap' }}>{rows.join('  ·  ')}</p></div></div>
          <div><strong>Both directions</strong><div style={{ ...box, blockSize: 160, overflow: 'auto' }}><div style={{ inlineSize: 600 }}>{rows.map((r) => <p key={r} style={{ margin: '0 0 8px' }}>{r}</p>)}</div></div></div>
        </div>
      </Section>
      <Section title="Spec">
        <table className="pv-table">
          <thead><tr><th>Part</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Size</td><td><code>--pv-sb-size</code> 10px (thin on Firefox)</td></tr>
            <tr><td>Track</td><td>Transparent</td></tr>
            <tr><td>Thumb</td><td><code>core.color.border.strong</code></td></tr>
            <tr><td>Thumb radius</td><td><code>core.dimension.radius.pill</code></td></tr>
            <tr><td>Thumb hover and drag</td><td>Preview accent color</td></tr>
            <tr><td>Forced colors</td><td>System scroll bar</td></tr>
          </tbody>
        </table>
      </Section>
    </>
  )
}
