// Header and live token editor for the sample page. Mirrors the design-system preview: theme and density toggles,
// token counts, search, layer filter, color picker / raw value / alias per token, Copy, Download, Reset.
// Edits are CSS custom properties on <html>, saved in localStorage (same key as the preview, so edits carry over),
// and every change re-renders the charts. Vanilla DOM on purpose: the sample page has no React.

interface Tok {
  layer: 'primitive' | 'semantic' | 'component' | 'theme'
  kind: string
  type?: string
  value: string
  css: string | null
  aliases: string[]
  description?: string
  gap?: string
  cssVar: string
}
interface Ov { mode: 'alias' | 'raw'; value: string }

const KEY = '6si-ds-preview-overrides-v1'
const HEX = /^#[0-9a-fA-F]{6}$/
const LAYERS = ['all', 'semantic', 'primitive', 'component'] as const

declare global { interface Window { __DS_TOKENS__?: { tokens: Record<string, Tok>; builtAt?: string } } }

export function mountEditor(onChange: () => void): void {
  const data = window.__DS_TOKENS__
  const tokens = data?.tokens ?? {}
  const names = Object.keys(tokens)
  const root = document.documentElement
  let overrides: Record<string, Ov> = {}
  try { overrides = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { overrides = {} }
  const cssVarOf = (n: string) => tokens[n]?.cssVar
  const computed = (t: Tok) => getComputedStyle(root).getPropertyValue(t.kind === 'typography' ? `${t.cssVar}-font` : t.cssVar).trim()

  function applyOne(n: string) {
    const t = tokens[n]; const o = overrides[n]
    if (!t || t.kind === 'typography') return // composite typography is edited in the preview app
    if (!o) { root.style.removeProperty(t.cssVar); return }
    root.style.setProperty(t.cssVar, o.mode === 'alias' ? `var(${cssVarOf(o.value)})` : o.value)
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(overrides)) } catch { /* private mode */ } }
  let raf = 0
  const changed = () => { save(); refreshCount(); cancelAnimationFrame(raf); raf = requestAnimationFrame(onChange) }
  const set = (n: string, o: Ov) => { overrides = { ...overrides, [n]: o }; applyOne(n); changed() }
  const clear = (n: string) => { const { [n]: _g, ...rest } = overrides; overrides = rest; applyOne(n); changed() }
  const clearAll = () => { const ks = Object.keys(overrides); overrides = {}; ks.forEach(applyOne); changed(); renderList() }

  function patch() {
    const out: Record<string, unknown> = {}
    for (const [n, o] of Object.entries(overrides)) {
      const t = tokens[n]; let cur = out
      const parts = n.split('.')
      parts.slice(0, -1).forEach((p) => { cur = (cur[p] = (cur[p] as Record<string, unknown>) || {}) as Record<string, unknown> })
      cur[parts[parts.length - 1]] = { ...(t?.type ? { $type: t.type } : {}), $value: o.mode === 'alias' ? `{${o.value}}` : o.value, $description: `Edited in chart samples. Was: ${t?.value}` }
    }
    return JSON.stringify(out, null, 2)
  }

  // ---------- DOM helpers ----------
  const h = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: Array<Node | string>) => {
    const el = document.createElement(tag)
    for (const [k, v] of Object.entries(attrs)) k === 'class' ? (el.className = v) : el.setAttribute(k, v)
    kids.forEach((k) => el.append(k))
    return el
  }
  const seg = (label: string, opts: string[], cur: string, pick: (v: string) => void) => {
    const g = h('div', { class: 'pv-seg', role: 'group', 'aria-label': label })
    opts.forEach((o) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(o === cur) }, o)
      if (o === cur) b.className = 'on'
      b.onclick = () => { pick(o); [...g.children].forEach((c) => { const on = c === b; c.className = on ? 'on' : ''; c.setAttribute('aria-pressed', String(on)) }) }
      g.append(b)
    })
    return g
  }

  // ---------- header ----------
  const counts = { primitive: 0, semantic: 0, component: 0, theme: 0 }
  names.forEach((n) => { counts[tokens[n].layer]++ })
  const top = document.getElementById('pv-top')!
  const prefOf = (k: string, d: string) => { try { return localStorage.getItem(k) || d } catch { return d } }
  const setPref = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } }
  const theme = prefOf('dba-samples-theme', 'light'); const density = prefOf('dba-samples-density', 'default')
  const applyMode = () => { theme === 'dark' ? root.setAttribute('data-theme', 'dark') : root.removeAttribute('data-theme') }
  const applyDensity = (d: string) => { d === 'default' ? root.removeAttribute('data-density') : root.setAttribute('data-density', d) }
  applyMode(); applyDensity(density)

  const editedCount = h('span', { class: 'pv-muted', role: 'status' })
  function refreshCount() {
    const n = Object.keys(overrides).length
    editedCount.textContent = `${n} edited`
    ;(document.getElementById('pv-copy') as HTMLButtonElement | null)?.toggleAttribute('disabled', !n)
    ;(document.getElementById('pv-dl') as HTMLButtonElement | null)?.toggleAttribute('disabled', !n)
    ;(document.getElementById('pv-reset') as HTMLButtonElement | null)?.toggleAttribute('disabled', !n)
  }
  const toggle = h('button', { type: 'button', class: 'pv-btn', 'aria-pressed': 'false', 'aria-controls': 'pv-editor' }, 'Token editor')
  const stats = h('span', { class: 'pv-muted', title: 'Tokens built from tokens/*.json' },
    `${names.length.toLocaleString()} tokens: ${counts.primitive} primitive, ${counts.semantic} semantic, ${counts.component} component`)
  top.append(
    h('h1', {}, 'DBA charts samples'),
    stats,
    h('span', { class: 'grow' }),
    h('span', { class: 'pv-muted' }, 'Theme'),
    seg('Theme', ['light', 'dark'], theme, (v) => { setPref('dba-samples-theme', v); v === 'dark' ? root.setAttribute('data-theme', 'dark') : root.removeAttribute('data-theme'); onChange() }),
    h('span', { class: 'pv-muted' }, 'Density'),
    seg('Density', ['compact', 'default', 'spacious'], density, (v) => { setPref('dba-samples-density', v); applyDensity(v); onChange() }),
    editedCount,
    toggle,
  )

  // ---------- editor panel ----------
  const panel = h('aside', { id: 'pv-editor', class: 'pv-editor', 'aria-label': 'Token editor' })
  panel.hidden = true
  const q = h('input', { class: 'pv-input', placeholder: 'Search tokens or descriptions', 'aria-label': 'Search tokens' }) as HTMLInputElement
  let layer: (typeof LAYERS)[number] = 'semantic'; let limit = 120
  const list = h('div', { class: 'pv-list' })
  const msg = h('div', { class: 'pv-muted', role: 'status' })
  const closeBtn = h('button', { type: 'button', class: 'pv-btn', 'aria-label': 'Close token editor' }, 'Close')
  const copy = h('button', { type: 'button', class: 'pv-btn', id: 'pv-copy' }, 'Copy edits')
  const dl = h('button', { type: 'button', class: 'pv-btn', id: 'pv-dl' }, 'Download')
  const reset = h('button', { type: 'button', class: 'pv-btn', id: 'pv-reset' }, 'Reset all')
  copy.onclick = async () => { try { await navigator.clipboard.writeText(patch()); msg.textContent = 'Copied' } catch { msg.textContent = 'Copy blocked. Use Download.' } }
  dl.onclick = () => { const a = h('a'); a.href = URL.createObjectURL(new Blob([patch()], { type: 'application/json' })); a.download = 'token-edits.json'; a.click() }
  reset.onclick = clearAll
  const layerSeg = seg('Layer filter', [...LAYERS], layer, (v) => { layer = v as typeof layer; limit = 120; renderList() })
  q.oninput = () => { limit = 120; renderList() }
  panel.append(
    h('header', { class: 'pv-editor-head' }, h('strong', {}, 'Token editor'), closeBtn),
    h('div', { class: 'pv-editor-tools' }, q, layerSeg, h('div', { class: 'pv-actions' }, copy, dl, reset), msg,
      h('p', { class: 'pv-hint' }, 'Edits apply live to the charts and are saved in this browser (shared with the design-system preview). Chart series colors come from teal, blue, green, amber, red and ink primitives: edit those to recolor charts. Aliases accept any token of the same kind.')),
    list,
  )
  document.getElementById('pv-body')!.append(panel)
  const setOpen = (open: boolean) => { panel.hidden = !open; toggle.setAttribute('aria-pressed', String(open)); document.getElementById('pv-body')!.classList.toggle('no-editor', !open); setTimeout(onChange, 0) }
  toggle.onclick = () => setOpen(panel.hidden === true)
  closeBtn.onclick = () => setOpen(false)

  const order: Record<string, number> = { component: 0, semantic: 1, primitive: 2, theme: 3 }
  function aliasCands(n: string): string[] {
    const t = tokens[n]
    const allowed = t.layer === 'component' ? ['semantic', 'component'] : t.layer === 'semantic' ? ['primitive', 'semantic'] : []
    return names.filter((o) => o !== n && allowed.includes(tokens[o].layer) && tokens[o].kind === t.kind)
  }

  function row(n: string): HTMLElement {
    const t = tokens[n]; const ov = overrides[n]; const cur = computed(t)
    const r = h('div', { class: 'pv-row' + (ov ? ' is-edited' : '') })
    const head = h('div', { class: 'pv-row-head' }, h('code', { class: 'pv-name', title: t.description || n }, n.replace(/^(component|core)\./, '')), h('span', { class: `pv-pill pv-${t.layer}` }, t.layer))
    if (t.gap) head.append(h('span', { class: 'pv-pill pv-gap', title: t.description || '' }, t.gap))
    if (ov) { const b = h('button', { type: 'button', class: 'pv-link' }, 'reset'); b.onclick = () => { clear(n); renderList() }; head.append(b) }
    r.append(head)
    const body = h('div', { class: 'pv-row-body' })
    if (t.kind === 'color' || t.kind === 'gradient') body.append(h('span', { class: 'pv-swatch' + (t.kind === 'gradient' ? ' wide' : ''), style: `background:var(${t.cssVar})` }))
    if (t.kind === 'color' && HEX.test(cur)) {
      const c = h('input', { type: 'color', 'aria-label': `${n} color`, value: cur }) as HTMLInputElement
      c.oninput = () => set(n, { mode: 'raw', value: c.value })
      c.onchange = () => renderList()
      body.append(c)
    }
    if (t.kind === 'typography') body.append(h('span', { class: 'pv-muted' }, `${cur || '(composite)'} (edit in the preview app)`))
    else {
      const i = h('input', { class: 'pv-input', 'aria-label': `${n} value`, spellcheck: 'false' }) as HTMLInputElement
      i.value = ov?.mode === 'raw' ? ov.value : cur
      const commit = () => { const v = i.value.trim(); if (v && v !== (ov?.mode === 'raw' ? ov.value : cur)) { set(n, { mode: 'raw', value: v }); renderList() } }
      i.onblur = commit; i.onkeydown = (e) => { if (e.key === 'Enter') commit() }
      body.append(i)
    }
    r.append(body)
    if (t.layer !== 'primitive' && t.kind !== 'typography') {
      const aliasNow = ov ? (ov.mode === 'alias' ? ov.value : '') : (t.aliases.length === 1 && t.css && /^var\(/.test(t.css) ? t.aliases[0] : '')
      const id = `al-${n}`
      const a = h('input', { class: 'pv-input', list: id, 'aria-label': `${n} alias`, placeholder: 'type a token name', spellcheck: 'false' }) as HTMLInputElement
      a.value = aliasNow
      const dlist = h('datalist', { id })
      const fill = () => { if (dlist.childElementCount) return; aliasCands(n).forEach((c) => dlist.append(h('option', { value: c }))) }
      a.onfocus = fill
      const commit = () => { const v = a.value.trim(); if (tokens[v] && v !== aliasNow) { set(n, { mode: 'alias', value: v }); renderList() } }
      a.onchange = commit; a.onblur = commit
      r.append(h('div', { class: 'pv-row-alias' }, h('label', {}, 'alias', a)), dlist)
    }
    return r
  }

  function renderList() {
    const needle = q.value.trim().toLowerCase()
    const hits = names
      .filter((n) => layer === 'all' || tokens[n].layer === layer)
      .filter((n) => !needle || n.toLowerCase().includes(needle) || (tokens[n].description || '').toLowerCase().includes(needle))
      .sort((a, b) => order[tokens[a].layer] - order[tokens[b].layer] || a.localeCompare(b, undefined, { numeric: true }))
    list.replaceChildren(...hits.slice(0, limit).map(row))
    if (hits.length > limit) { const m = h('button', { type: 'button', class: 'pv-btn' }, `Show more (${hits.length - limit} left)`); m.onclick = () => { limit += 200; renderList() }; list.append(m) }
    if (!hits.length) list.append(h('p', { class: 'pv-muted' }, names.length ? 'No tokens match.' : 'Token data not found. Run npm run samples:charts.'))
  }

  Object.keys(overrides).forEach(applyOne)
  refreshCount(); renderList()
  if (Object.keys(overrides).length) onChange()
}
