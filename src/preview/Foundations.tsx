import { Component, type ReactNode } from 'react'
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
      <Section title={`Gaps (${gapMap.size})`} note="Roles with no semantic token. Each uses an approved placeholder alias to a primitive until you add a semantic token or choose another mapping.">
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
