import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { REGISTRY, type RegistryEntry } from './registry.generated'
import { TokenEditor } from './TokenEditor'
import { AnalyticsPage } from './Analytics'
import { CostPage } from './Cost'
import { WelcomePage } from './Welcome'
import { FieldLabelsPage } from './FieldLabels'
import { HeadersFootersPage } from './HeadersFooters'
import { ContentsPage } from './Contents'
import { SectionTabs } from './SectionTabs'
import { GuidelinesButton } from './GuidelinesModal'
import { TechStackPage, STACK_IN_USE } from './TechStack'
// @ts-ignore plain JSX module: pulls the Data-Viz chart package, kept out of the root typecheck
import { DataVizPage, DATAVIZ_PAGES } from './DataViz.jsx'
import { Boundary, ScrollbarsPage, ColorsPage, EffectsPage, MotionPage, GapsPage, SpacingPage, TypographyPage } from './Foundations'
import { DATA, EXTRA_COMPONENTS, PRODUCT_COMPONENTS, CORE_COUNT, TOKEN_LIST, type TokenRec } from './data'
import { useOverrides, clearOverride } from './overrides'
import { firstLayer, wasOf, scopeOf, affectedComponents } from './edits'

const TIERS: Record<number, string> = { 1: 'Tier 1 · Critical', 2: 'Tier 2 · High value', 3: 'Tier 3 · Specialized', 0: 'Atomic units and patterns' }
const INDEX = [['welcome', 'Welcome'], ['contents', 'Table of contents'], ['cost', 'Cost to build'], ['analytics', 'Analytics'], ['gaps', 'Gaps and conflicts'], ['stack', 'Tech stack created and used']] as const
const FOUND = [['colors', 'Colors'], ['typography', 'Typography'], ['spacing', 'Space, size, radius'], ['effects', 'Shadows and effects'], ['motion', 'Motion'], ['scrollbars', 'Scroll bars'], ['labels', 'Field labels'], ['headers', 'Headers and footers']] as const
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
      <div className="pv-title"><h1>{humanize(entry.folder)}</h1>{status ? <span className="pv-pill">{status}</span> : null}<span className="pv-pill">{TIERS[meta.parameters?.tier ?? 0]}</span><GuidelinesButton folder={entry.folder} label={humanize(entry.folder)} renderPreview={(k) => { const e = k ? stories.find(([n]) => n === k) : stories[0]; if (!e) return null; const [, st0] = e; const st: Story = typeof st0 === 'function' ? { render: st0 as Story['render'] } : st0; const a = { ...(meta.args || {}), ...(st.args || {}) }; const r = st.render || meta.render; const C = meta.component; return r ? r(a, {}) : C ? <C {...a} /> : null }} /></div>
      <p className="pv-desc">{meta.parameters?.description}</p>
      {stories.map(([k, s]) => (
        <Boundary key={k} name={`${entry.folder} / ${k}`}><StoryView name={k} story={typeof s === 'function' ? { render: s as Story['render'] } : s} meta={meta} bg={bg} /></Boundary>
      ))}
    </>
  )
}

/** Temporary page for "View edits". The header and the token editor stay in view so tokens can be changed here and the
 *  preview below updates live. Shows the first layer of edits for the chosen token card, then every component. */
function EditsPage({ tokenName, bg }: { tokenName: string; bg: Bg }) {
  const all = useOverrides()
  const t = TOKEN_LIST.find((x) => x.name === tokenName)
  if (!t) return <p className="pv-muted">That token was not found. <a href="#/i/welcome">Back</a></p>
  const rows = firstLayer(t, all)
  const scope = t.layer === 'component' ? humanize(t.name.split('.')[1]) : t.name
  const back = () => { if (history.length > 1) history.back(); else location.hash = '#/i/welcome' }
  // Only the components affected by these edits (or by the token itself when nothing is edited yet).
  const hit = affectedComponents(rows.length ? rows.map(([n]) => n) : [t.name])
  const entries = REGISTRY.filter((e) => hit.has(lowerCamel(e.folder))).sort((a, b) => a.folder.localeCompare(b.folder))
  return (
    <>
      <p><button className="pv-btn" onClick={back}>&larr; Back</button> <span className="pv-pill">Temporary page</span></p>
      <div className="pv-title"><h1>Edits: {scope}</h1></div>
      <p className="pv-desc">{t.layer === 'component' ? `First layer: only the ${scope} tokens. Tokens of other components are not listed, even if they contain a ${scope}. Edit tokens in the editor on the right and every component below updates.` : 'First layer: only this token. Tokens that refer to it are not listed. Edit it in the editor on the right and every component below updates.'}</p>
      {rows.length ? (
        <table className="pv-table">
          <thead><tr><th scope="col">Token</th><th scope="col">Was</th><th scope="col">Now</th><th scope="col"><span className="pv-sr">Undo</span></th></tr></thead>
          <tbody>
            {rows.map(([name, o]) => (
              <tr key={name}><td><code>{name}</code></td><td>{wasOf(name)}</td><td>{o.mode === 'alias' ? `{${o.value}}` : o.value}</td><td><button className="pv-btn" onClick={() => clearOverride(name)}>Undo</button></td></tr>
            ))}
          </tbody>
        </table>
      ) : <p className="pv-muted">No edits here yet. Change a token in the editor.</p>}
      <h2>Components affected ({entries.length})</h2>
      <p className="pv-muted">Only the components that use these tokens, first sample each. Components that only contain one of them are not shown.</p>
      <div className="pv-allgrid">
        {entries.map((entry) => {
          const meta = entry.mod.default as unknown as Meta
          const first = Object.entries(entry.mod).find(([k, v]) => k !== 'default' && !k.startsWith('__') && v && (typeof v === 'object' || typeof v === 'function')) as [string, Story] | undefined
          if (!first) return null
          const [k, s] = first
          return (
            <section key={entry.folder} className="pv-allitem">
              <h3><a href={`#/c/${entry.folder}`}>{humanize(entry.folder)}</a></h3>
              <Boundary name={`${entry.folder} / ${k}`}><StoryView name={k} story={typeof s === 'function' ? { render: s as Story['render'] } : s} meta={meta} bg={bg} /></Boundary>
            </section>
          )
        })}
      </div>
    </>
  )
}

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || '/i/welcome')
  useEffect(() => { const on = () => setH(location.hash.slice(1) || '/i/welcome'); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on) }, [])
  return h
}

export function App() {
  const hash = useHash()
  const [filter, setFilter] = useState('')
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

  // The editor filter follows the page: the token card's scope on the edits page, the component on a component page, nothing elsewhere.
  useEffect(() => {
    if (kind === 'e' && id) { setEditor(true); const t = TOKEN_LIST.find((x) => x.name === decodeURIComponent(id)); setPrefix(t ? scopeOf(t) : ''); return }
    setPrefix(entry ? `component.${lowerCamel(entry.folder)}.` : '')
  }, [kind, id, entry?.folder])
  const viewEdits = (t: TokenRec) => { location.hash = `#/e/${encodeURIComponent(t.name)}` }
  // A new menu item always opens at the top of its content.
  useEffect(() => { const m = document.getElementById('main'); if (m) m.scrollTop = 0; window.scrollTo(0, 0) }, [hash])
  useEffect(() => { document.title = `${entry ? humanize(entry.folder) : kind === 'e' ? 'Edits' : kind === 'd' ? 'Data visualization' : kind === 'i' ? 'Index' : 'Foundations'} · 6sense design system preview` }, [entry?.folder])

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
        <span className="pv-muted">{REGISTRY.length + EXTRA_COMPONENTS.length + PRODUCT_COMPONENTS.length} components leveraging {DATA.analytics?.header.core ?? CORE_COUNT} unique tokens using {STACK_IN_USE.length} tech stacks</span>
        <span className="grow" />
        <div className="pv-seg" role="group" aria-label="Theme">
          {(['light', 'dark'] as const).map((m) => <button key={m} className={theme === m ? 'on' : ''} aria-pressed={theme === m} onClick={() => setTheme(m)}>{m === 'light' ? 'Light' : 'Dark'}</button>)}
        </div>
        <div className="pv-seg" role="group" aria-label="Density">
          {(['compact', 'default', 'spacious'] as const).map((m) => <button key={m} className={density === m ? 'on' : ''} aria-pressed={density === m} onClick={() => setDensity(m)}>{m[0].toUpperCase() + m.slice(1)}</button>)}
        </div>
        <label className="pv-muted">Background <select className="pv-input" style={{ inlineSize: 'auto' }} value={bg} onChange={(e) => setBg(e.target.value as Bg)}>{BG.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <button className="pv-btn" aria-pressed={editor} onClick={() => setEditor(!editor)}>Token editor{edited ? ` (${edited})` : ''}</button>
      </header>
      <div className={`pv-body ${editor ? '' : 'no-editor'}`}>
        <nav className="pv-nav" aria-label="Components">
          <div className="pv-navsearch"><h2>Search</h2><input className="pv-input" placeholder="Filter components" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter components" /></div>
          <h3>Index</h3>
          {INDEX.map(([k, l]) => <a key={k} href={`#/i/${k}`} aria-current={kind === 'i' && id === k ? 'page' : undefined}>{l}</a>)}
          <h3>Foundations</h3>
          {FOUND.map(([k, l]) => <a key={k} href={`#/f/${k}`} aria-current={kind === 'f' && id === k ? 'page' : undefined}>{l}</a>)}
          {[1, 2, 3, 0].map((tier) => (
            <div key={tier}>
              {groups[tier]?.length ? <>
                <h3>{TIERS[tier]}</h3>
                {groups[tier].sort((a, b) => a.folder.localeCompare(b.folder)).map((e) => <a key={e.folder} href={`#/c/${e.folder}`} aria-current={kind === 'c' && id === e.folder ? 'page' : undefined}>{humanize(e.folder)}</a>)}
              </> : null}
              {tier === 3 && (DATAVIZ_PAGES as ReadonlyArray<readonly [string, string]>).length ? <>
                <h3>Data visualization</h3>
                {(DATAVIZ_PAGES as ReadonlyArray<readonly [string, string]>).map(([k, l]) => <a key={k} href={`#/d/${k}`} aria-current={kind === 'd' && id === k ? 'page' : undefined}>{l}</a>)}
              </> : null}
            </div>))}
        </nav>
        <main className="pv-main" id="main">
          <SectionTabs resetKey={hash} />
          <div className="pv-stage" data-bg={bg}>
            <Boundary key={hash} name="This page">
            {kind === 'e' && id ? <EditsPage tokenName={decodeURIComponent(id)} bg={bg} /> : entry ? <ComponentPage entry={entry} bg={bg} /> : kind === 'd' ? <DataVizPage id={id || 'area'} /> : kind === 'f' && id === 'typography' ? <TypographyPage />
              : kind === 'f' && id === 'spacing' ? <SpacingPage /> : kind === 'f' && id === 'effects' ? <EffectsPage /> : kind === 'f' && id === 'motion' ? <MotionPage /> : kind === 'f' && id === 'scrollbars' ? <ScrollbarsPage /> : kind === 'f' && id === 'labels' ? <FieldLabelsPage /> : kind === 'f' && id === 'headers' ? <HeadersFootersPage /> : kind === 'i' && id === 'analytics' ? <AnalyticsPage /> : kind === 'i' && id === 'cost' ? <CostPage /> : kind === 'i' && id === 'gaps' ? <GapsPage /> : kind === 'i' && id === 'stack' ? <TechStackPage /> : kind === 'i' && id === 'contents' ? <ContentsPage />
              : kind === 'f' && id === 'colors' ? <ColorsPage /> : <WelcomePage />}
          </Boundary>
          </div>
        </main>
        {editor ? <TokenEditor prefix={prefix} onPrefix={setPrefix} onClose={() => setEditor(false)} onView={viewEdits} /> : null}
      </div>
    </div>
  )
}
