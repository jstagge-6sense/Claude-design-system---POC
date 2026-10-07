import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { REGISTRY, type RegistryEntry } from './registry.generated'
import { TokenEditor } from './TokenEditor'
import { Boundary, ColorsPage, EffectsPage, GapsPage, SpacingPage, TypographyPage } from './Foundations'
import { DATA, LEAN_COUNT, COMP_LEAN, CORE_COUNT } from './data'
import { useOverrides } from './overrides'

const TIERS: Record<number, string> = { 4: 'Pages', 1: 'Tier 1 · Critical', 2: 'Tier 2 · High value', 3: 'Tier 3 · Specialized', 0: 'Atomic units and patterns' }
const FOUND = [['colors', 'Colors'], ['typography', 'Typography'], ['spacing', 'Space, size, radius'], ['effects', 'Shadows and effects'], ['gaps', 'Gaps and conflicts']] as const
const lowerCamel = (s: string) => s[0].toLowerCase() + s.slice(1)
const humanize = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
const BG = [['page', 'Page'], ['white', 'White'], ['sage', 'Sage'], ['dark', 'Dark']] as const
type Bg = (typeof BG)[number][0]

interface Story { name?: string; args?: Record<string, unknown>; render?: (args: Record<string, unknown>, ctx: unknown) => ReactNode; parameters?: Record<string, unknown> }
interface Meta { title?: string; component?: (p: Record<string, unknown>) => ReactNode; args?: Record<string, unknown>; render?: Story['render']; parameters?: { tier?: number; group?: string; description?: string } }

function StoryView({ name, story, meta, bg }: { name: string; story: Story; meta: Meta; bg: Bg }) {
  const args = { ...(meta.args || {}), ...(story.args || {}) }
  const render = story.render || meta.render
  const Cmp = meta.component
  let content: ReactNode = null
  if (render) content = render(args, {})
  else if (Cmp) content = <Cmp {...args} />
  return (
    <article className="pv-story">
      <header><strong>{story.name || humanize(name)}</strong></header>
      <div className="pv-canvas" data-bg={bg}>{content}</div>
    </article>
  )
}

function ComponentPage({ entry, bg }: { entry: RegistryEntry; bg: Bg }) {
  const meta = entry.mod.default as unknown as Meta
  const stories = Object.entries(entry.mod).filter(([k, v]) => k !== 'default' && !k.startsWith('__') && v && (typeof v === 'object' || typeof v === 'function')) as Array<[string, Story]>
  const status = DATA.state.components?.[entry.folder]?.status
  return (
    <>
      <div className="pv-title"><h1>{humanize(entry.folder)}</h1>{status ? <span className="pv-pill">{status}</span> : null}<span className="pv-pill">{TIERS[meta.parameters?.tier ?? 0]}</span></div>
      <p className="pv-desc">{meta.parameters?.description}</p>
      {stories.map(([k, s]) => (
        <Boundary key={k} name={`${entry.folder} / ${k}`}><StoryView name={k} story={typeof s === 'function' ? { render: s as Story['render'] } : s} meta={meta} bg={bg} /></Boundary>
      ))}
    </>
  )
}

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || '/c/Button')
  useEffect(() => { const on = () => setH(location.hash.slice(1) || '/c/Button'); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on) }, [])
  return h
}

export function App() {
  const hash = useHash()
  const [filter, setFilter] = useState('')
  const [rtl, setRtl] = useState(false)
  const [bg, setBg] = useState<Bg>('page')
  const [editor, setEditor] = useState(() => typeof window === 'undefined' || window.innerWidth > 900)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => { try { return localStorage.getItem('ds-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' } })
  const [density, setDensity] = useState<'compact' | 'default' | 'spacious'>(() => { try { const d = localStorage.getItem('ds-density'); return d === 'compact' || d === 'spacious' ? d : 'default' } catch { return 'default' } })
  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('data-theme', theme); el.setAttribute('data-density', density)
    try { localStorage.setItem('ds-theme', theme); localStorage.setItem('ds-density', density) } catch { /* private mode */ }
  }, [theme, density])
  const [prefix, setPrefix] = useState('')
  const edited = Object.keys(useOverrides()).length
  const [kind, id] = hash.split('/').filter(Boolean)
  const entry = kind === 'c' ? REGISTRY.find((e) => e.folder === id) : undefined

  useEffect(() => { setPrefix(entry ? `component.${lowerCamel(entry.folder)}.` : '') }, [entry?.folder])
  useEffect(() => { document.title = `${entry ? humanize(entry.folder) : 'Foundations'} · 6sense design system preview` }, [entry?.folder])

  const groups = useMemo(() => {
    const g: Record<number, RegistryEntry[]> = {}
    for (const e of REGISTRY) {
      const tier = (e.mod.default as unknown as Meta).parameters?.tier ?? 0
      if (filter && !humanize(e.folder).toLowerCase().includes(filter.toLowerCase())) continue
      ;(g[tier] = g[tier] || []).push(e)
    }
    return g
  }, [filter])

  return (
    <div className="pv-shell">
      <header className="pv-top">
        <h1>6sense design system preview</h1>
        <span className="pv-muted">{REGISTRY.length} components · built {DATA.builtAt}</span>
        <table className="pv-stats" aria-label="Token counts">
          <tbody>
            <tr><th scope="row">All tokens</th><td>{LEAN_COUNT}</td></tr>
            <tr><th scope="row">Component tokens</th><td>{COMP_LEAN}</td></tr>
            <tr><th scope="row">Primitive + semantic</th><td>{CORE_COUNT}</td></tr>
          </tbody>
        </table>
        <span className="grow" />
        <div className="pv-seg" role="group" aria-label="Theme">
          {(['light', 'dark'] as const).map((m) => <button key={m} className={theme === m ? 'on' : ''} aria-pressed={theme === m} onClick={() => setTheme(m)}>{m === 'light' ? 'Light' : 'Dark'}</button>)}
        </div>
        <div className="pv-seg" role="group" aria-label="Density">
          {(['compact', 'default', 'spacious'] as const).map((m) => <button key={m} className={density === m ? 'on' : ''} aria-pressed={density === m} onClick={() => setDensity(m)}>{m[0].toUpperCase() + m.slice(1)}</button>)}
        </div>
        <label className="pv-muted">Background <select className="pv-input" style={{ inlineSize: 'auto' }} value={bg} onChange={(e) => setBg(e.target.value as Bg)}>{BG.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <button className="pv-btn" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>{rtl ? 'RTL' : 'LTR'}</button>
        <button className="pv-btn" aria-pressed={editor} onClick={() => setEditor(!editor)}>Token editor{edited ? ` (${edited})` : ''}</button>
      </header>
      <div className={`pv-body ${editor ? '' : 'no-editor'}`}>
        <nav className="pv-nav" aria-label="Components">
          <input className="pv-input" placeholder="Filter components" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter components" />
          <h3>Foundations</h3>
          {FOUND.map(([k, l]) => <a key={k} href={`#/f/${k}`} aria-current={kind === 'f' && id === k ? 'page' : undefined}>{l}</a>)}
          {[4, 1, 2, 3, 0].map((tier) => groups[tier]?.length ? (
            <div key={tier}><h3>{TIERS[tier]}</h3>
              {groups[tier].sort((a, b) => a.folder.localeCompare(b.folder)).map((e) => <a key={e.folder} href={`#/c/${e.folder}`} aria-current={kind === 'c' && id === e.folder ? 'page' : undefined}>{humanize(e.folder)}</a>)}
            </div>) : null)}
        </nav>
        <main className="pv-main" id="main">
          <div className="pv-stage" data-bg={bg} dir={rtl ? 'rtl' : 'ltr'}>
            {entry ? <ComponentPage entry={entry} bg={bg} /> : kind === 'f' && id === 'typography' ? <TypographyPage />
              : kind === 'f' && id === 'spacing' ? <SpacingPage /> : kind === 'f' && id === 'effects' ? <EffectsPage />
              : kind === 'f' && id === 'gaps' ? <GapsPage /> : <ColorsPage />}
          </div>
        </main>
        {editor ? <TokenEditor prefix={prefix} onPrefix={setPrefix} onClose={() => setEditor(false)} /> : null}
      </div>
    </div>
  )
}
