import { useMemo, useState, type ReactNode } from 'react'
import { DATA, TOKEN_LIST, PASSTHROUGH, type TokenRec } from './data'
import { clearAll, clearOverride, computedValue, exportPatch, setOverride, useOverrides } from './overrides'

const HEX = /^#[0-9a-fA-F]{6}$/
const LAYER_ORDER: Record<string, number> = { component: 0, semantic: 1, primitive: 2, theme: 3 }

function aliasCandidates(t: TokenRec): TokenRec[] {
  const allowed = t.layer === 'component' ? ['semantic', 'component'] : t.layer === 'semantic' ? ['primitive', 'semantic'] : []
  return TOKEN_LIST.filter((o) => o.name !== t.name && allowed.includes(o.layer) && o.kind === t.kind)
}

function Row({ t }: { t: TokenRec }) {
  const ov = useOverrides()[t.name]
  const cur = computedValue(t)
  const [draft, setDraft] = useState<string | null>(null)
  const listId = `al-${t.name}`
  const cands = useMemo(() => (t.layer === 'primitive' ? [] : aliasCandidates(t)), [t.name])
  const aliasNow = ov ? (ov.mode === 'alias' ? ov.value : null) : (t.aliases.length === 1 && t.css && /^var\(/.test(t.css) ? t.aliases[0] : null)
  const commitRaw = (v: string) => { if (v.trim()) setOverride(t.name, { mode: 'raw', value: v.trim() }); setDraft(null) }
  const commitAlias = (v: string) => {
    const hit = DATA.tokens[v.trim()]
    if (hit) setOverride(t.name, { mode: 'alias', value: hit.name })
  }
  const showColor = t.kind === 'color' && HEX.test(cur)
  return (
    <div className={`pv-row ${ov ? 'is-edited' : ''}`}>
      <div className="pv-row-head">
        <code className="pv-name" title={t.description || t.name}>{t.name.replace(/^(component|core)\./, '')}</code>
        <span className={`pv-pill pv-${t.layer}`}>{t.layer}</span>
        {t.gap ? <span className="pv-pill pv-gap" title={t.description}>{t.gap}</span> : null}
        {ov ? <button className="pv-link" onClick={() => clearOverride(t.name)}>reset</button> : null}
      </div>
      <div className="pv-row-body">
        {t.kind === 'color' ? <span className="pv-swatch" style={{ background: `var(${t.cssVar})` }} /> : null}
        {t.kind === 'gradient' ? <span className="pv-swatch wide" style={{ background: `var(${t.cssVar})` }} /> : null}
        {showColor ? <input aria-label={`${t.name} color`} type="color" value={cur} onChange={(e) => setOverride(t.name, { mode: 'raw', value: e.target.value })} /> : null}
        {t.kind !== 'typography' ? (
          <input
            className="pv-input"
            aria-label={`${t.name} value`}
            value={draft ?? (ov?.mode === 'raw' ? ov.value : cur)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => draft !== null && commitRaw(draft)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRaw((e.target as HTMLInputElement).value) }}
            spellCheck={false}
          />
        ) : <span className="pv-muted">{cur || '(composite)'}</span>}
      </div>
      {t.layer !== 'primitive' ? (
        <div className="pv-row-alias">
          <label>alias
            <input className="pv-input" list={listId} aria-label={`${t.name} alias`} defaultValue={aliasNow || ''} key={aliasNow || 'none'}
              placeholder="type a token name" onBlur={(e) => commitAlias(e.target.value)} onChange={(e) => DATA.tokens[e.target.value] && commitAlias(e.target.value)} spellCheck={false} />
          </label>
          <datalist id={listId}>{cands.map((c) => <option key={c.name} value={c.name} />)}</datalist>
        </div>
      ) : null}
    </div>
  )
}

export function TokenEditor({ prefix, onPrefix, onClose }: { prefix: string; onPrefix: (p: string) => void; onClose: () => void }) {
  const overrides = useOverrides()
  const [layer, setLayer] = useState<'all' | 'component' | 'semantic' | 'primitive'>('all')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(120)
  const [shown, setShown] = useState<string | null>(null)
  const list = useMemo(() => {
    const needle = (prefix || q).toLowerCase()
    return TOKEN_LIST
      .filter((t) => !PASSTHROUGH.has(t.name))
      .filter((t) => (layer === 'all' || t.layer === layer))
      .filter((t) => !prefix || t.name.toLowerCase().startsWith(prefix.toLowerCase()) || t.name.toLowerCase().includes(prefix.toLowerCase()))
      .filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()) || (t.description || '').toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer] || a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [layer, q, prefix])
  const edited = Object.keys(overrides).length
  const exportJson = () => JSON.stringify(exportPatch(), null, 2)
  const copy = async () => { try { await navigator.clipboard.writeText(exportJson()); setShown('Copied') } catch { setShown('Copy blocked. Use Download or select the text.') } }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }))
    a.download = 'token-edits.json'; a.click()
  }
  return (
    <aside className="pv-editor" aria-label="Token editor">
      <header className="pv-editor-head">
        <strong>Token editor</strong>
        <span className="pv-muted">{edited} edited</span>
        <button className="pv-btn" onClick={onClose} aria-label="Close token editor">Close</button>
      </header>
      <div className="pv-editor-tools">
        <input className="pv-input" placeholder="Search tokens or descriptions" value={q} onChange={(e) => { setQ(e.target.value); setLimit(120) }} aria-label="Search tokens" />
        <div className="pv-seg" role="group" aria-label="Layer filter">
          {(['all', 'component', 'semantic', 'primitive'] as const).map((l) => (
            <button key={l} className={layer === l ? 'on' : ''} onClick={() => { setLayer(l); setLimit(120) }} aria-pressed={layer === l}>{l}</button>
          ))}
        </div>
        {prefix ? <div className="pv-chip">Showing <code>{prefix}</code> <button className="pv-link" onClick={() => onPrefix('')}>show all</button></div> : null}
        <div className="pv-actions">
          <button className="pv-btn" onClick={copy} disabled={!edited}>Copy edits</button>
          <button className="pv-btn" onClick={download} disabled={!edited}>Download</button>
          <button className="pv-btn" onClick={clearAll} disabled={!edited}>Reset all</button>
        </div>
        {shown ? <div className="pv-muted" role="status">{shown}</div> : null}
        <p className="pv-hint">Edits apply live to every component and are saved in this browser. Editing a primitive changes everything built on it. Aliases accept any token of the same kind. Copy edits to send token changes back.</p>
      </div>
      <div className="pv-list">
        {list.slice(0, limit).map((t) => <Row key={t.name} t={t} />)}
        {list.length > limit ? <button className="pv-btn" onClick={() => setLimit(limit + 200)}>Show more ({list.length - limit} left)</button> : null}
        {!list.length ? <p className="pv-muted">No tokens match.</p> : null}
      </div>
    </aside>
  )
}
export type { ReactNode }
