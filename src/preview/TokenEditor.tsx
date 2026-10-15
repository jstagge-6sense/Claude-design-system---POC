import { useMemo, useState, type ReactNode } from 'react'
import { DATA, TOKEN_LIST, PASSTHROUGH, type TokenRec } from './data'
import { firstLayer } from './edits'
import { downloadEditsZip } from './exportZip'
import { clearAll, clearOverride, computedValue, exportPatch, setOverride, useOverrides, importPatch, type ImportResult } from './overrides'

const HEX = /^#[0-9a-fA-F]{6}$/
const LAYER_ORDER: Record<string, number> = { component: 0, semantic: 1, primitive: 2, theme: 3 }

function aliasCandidates(t: TokenRec): TokenRec[] {
  const allowed = t.layer === 'component' ? ['semantic', 'component'] : t.layer === 'semantic' ? ['primitive', 'semantic'] : []
  return TOKEN_LIST.filter((o) => o.name !== t.name && allowed.includes(o.layer) && o.kind === t.kind)
}

function Row({ t, onView }: { t: TokenRec; onView: (t: TokenRec) => void }) {
  const allOv = useOverrides()
  const ov = allOv[t.name]
  const nEdits = firstLayer(t, allOv).length
  const cur = computedValue(t)
  const [draft, setDraft] = useState<string | null>(null)
  const listId = `al-${t.name}`
  const cands = useMemo(() => (t.layer === 'primitive' ? [] : aliasCandidates(t)), [t.name])
  const aliasNow = ov ? (ov.mode === 'alias' ? ov.value : null) : (t.aliases.length === 1 && t.css && /^var\(/.test(t.css) ? t.aliases[0] : null)
  const commitRaw = (v: string) => { if (v.trim()) setOverride(t.name, { mode: 'raw', value: v.trim() }); setDraft(null) }
  const commitAlias = (v: string) => {
    const name = v.trim()
    if (DATA.tokens[name]) setOverride(t.name, { mode: 'alias', value: name }) // value = the selected token's name
  }
  const showColor = t.kind === 'color' && HEX.test(cur)
  return (
    <div className={`pv-row ${ov ? 'is-edited' : ''}`}>
      <div className="pv-row-head">
        <code className="pv-name" title={t.description || t.name}>{t.name.replace(/^(component|core)\./, '')}</code>
        <span className={`pv-pill pv-${t.layer}`}>{t.layer}</span>
        {t.gap ? <span className="pv-pill pv-gap" title={t.description}>{t.gap}</span> : null}
        {ov ? <button className="pv-link" onClick={() => clearOverride(t.name)}>reset</button> : null}
        <button className="pv-btn pv-viewedits" onClick={() => onView(t)} disabled={!nEdits}>View edits{nEdits ? ` (${nEdits})` : ''}</button>
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

export function TokenEditor({ prefix, onPrefix, onClose, onView, onViewAll }: { prefix: string; onPrefix: (p: string) => void; onClose: () => void; onView: (t: TokenRec) => void; onViewAll: () => void }) {
  const overrides = useOverrides()
  const [layer, setLayer] = useState<'all' | 'component' | 'semantic' | 'primitive'>('all')
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(120)
  const [shown, setShown] = useState<string | null>(null)
  const [report, setReport] = useState<ImportResult | null>(null)
  const [paste, setPaste] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [editsOnly, setEditsOnly] = useState(false)
  const run = (text: string) => { const r = importPatch(text); setReport(r); setShown(r.error ? null : `Applied ${r.applied.length}${r.added?.length ? ` (${r.added.length} new)` : ''}${r.unchanged ? `, unchanged ${r.unchanged}` : ''}${r.skipped.length ? `, skipped ${r.skipped.length}` : ''}.`); if (!r.error && r.applied.length) setPaste(null) }
  const readFile = async (f: File | undefined) => { if (!f) return; try { run(await f.text()) } catch { setReport({ applied: [], unchanged: 0, skipped: [], error: 'Could not read that file.' }) } }
  const list = useMemo(() => {
    const needle = (prefix || q).toLowerCase()
    return TOKEN_LIST
      .filter((t) => !PASSTHROUGH.has(t.name))
      .filter((t) => !editsOnly || t.name in overrides)
      .filter((t) => (layer === 'all' || t.layer === layer))
      .filter((t) => !prefix || t.name.toLowerCase().startsWith(prefix.toLowerCase()) || t.name.toLowerCase().includes(prefix.toLowerCase()))
      .filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()) || (t.description || '').toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer] || a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [layer, q, prefix, editsOnly, overrides])
  const edited = Object.keys(overrides).length
  const exportJson = () => JSON.stringify(exportPatch(), null, 2)
  const copy = async () => { try { await navigator.clipboard.writeText(exportJson()); setShown('Copied') } catch { setShown('Copy blocked. Use Download or select the text.') } }
  const download = () => { downloadEditsZip(); setShown('Downloaded zip: token-edits.json, token-edits.csv, claude-prompt.md') }
  return (
    <aside
      className="pv-editor"
      aria-label="Token editor"
      data-drop={drag || undefined}
      onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setDrag(true) } }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); void readFile(e.dataTransfer?.files?.[0]) }}
    >
      <header className="pv-editor-head">
        <strong>Token editor</strong>
        <span className="pv-muted">{edited} edited</span>
        <button className="pv-btn" onClick={onViewAll} disabled={!edited}>View all changes{edited ? ` (${edited})` : ''}</button>
        <button className="pv-btn" onClick={onClose} aria-label="Close token editor">Close</button>
      </header>
      <div className="pv-editor-tools">
        <input className="pv-input" placeholder="Search tokens or descriptions" value={q} onChange={(e) => { setQ(e.target.value); setLimit(120) }} aria-label="Search tokens" />
        <div className="pv-seg" role="group" aria-label="Layer filter">
          {(['all', 'component', 'semantic', 'primitive'] as const).map((l) => (
            <button key={l} className={layer === l ? 'on' : ''} onClick={() => { setLayer(l); setLimit(120) }} aria-pressed={layer === l}>{l}</button>
          ))}
        </div>
        <label className="pv-toggle"><input type="checkbox" checked={editsOnly} onChange={(e) => { setEditsOnly(e.target.checked); setLimit(120) }} /> See edits only <span className="pv-muted">({edited})</span></label>
        {prefix ? <div className="pv-chip">Showing <code>{prefix}</code> <button className="pv-link" onClick={() => onPrefix('')}>show all</button></div> : null}
        <div className="pv-actions">
          <button className="pv-btn" onClick={copy} disabled={!edited}>Copy edits</button>
          <button className="pv-btn" onClick={download} disabled={!edited}>Download zip</button>
          <button className="pv-btn" onClick={clearAll} disabled={!edited}>Reset all</button>
        </div>
        <div className="pv-actions">
          <label className="pv-btn pv-file">Upload JSON<input type="file" accept=".json,application/json" onChange={(e) => { void readFile(e.target.files?.[0]); e.target.value = '' }} /></label>
          <button className="pv-btn" aria-expanded={paste !== null} onClick={() => setPaste(paste === null ? '' : null)}>Paste JSON</button>
        </div>
        {paste !== null ? (
          <div className="pv-paste">
            <textarea className="pv-input" rows={8} spellCheck={false} aria-label="Token JSON" placeholder={'{\n  "core": { "color": { "teal": { "700": { "$value": "#2a696f" } } } }\n}'} value={paste} onChange={(e) => setPaste(e.target.value)} />
            <button className="pv-btn" disabled={!paste.trim()} onClick={() => run(paste)}>Apply to preview</button>
          </div>
        ) : null}
        {report ? (
          <div className="pv-report" role="status">
            {report.error ? <strong>{report.error}</strong> : null}
            {report.skipped.length ? <details><summary>{report.skipped.length} skipped</summary><ul>{Object.entries(report.skipped.reduce<Record<string, string[]>>((a, x) => { (a[x.reason] = a[x.reason] || []).push(x.name); return a }, {})).map(([reason, names]) => <li key={reason}>{reason} ({names.length}): {names.slice(0, 5).map((n) => <code key={n}>{n} </code>)}{names.length > 5 ? `and ${names.length - 5} more` : null}</li>)}</ul></details> : null}
            <button className="pv-link" onClick={() => setReport(null)}>Dismiss</button>
          </div>
        ) : null}
        {shown ? <div className="pv-muted" role="status">{shown}</div> : null}
        <p className="pv-hint">Edits apply live to every component and are saved in this browser. Editing a primitive changes everything built on it. Aliases accept any token of the same kind. Upload or paste a token JSON (the same shape Copy edits produces) to preview it, and drop a .json file anywhere on this panel. Download zip gives us the JSON, a table of old and new values, and a prompt for Claude to apply them.</p>
      </div>
      <div className="pv-list">
        {list.slice(0, limit).map((t) => <Row key={t.name} t={t} onView={onView} />)}
        {list.length > limit ? <button className="pv-btn" onClick={() => setLimit(limit + 200)}>Show more ({list.length - limit} left)</button> : null}
        {!list.length ? <p className="pv-muted">{editsOnly && !edited ? 'No edits yet. Change a token or upload a JSON to see it here.' : 'No tokens match.'}</p> : null}
      </div>
    </aside>
  )
}
export type { ReactNode }
