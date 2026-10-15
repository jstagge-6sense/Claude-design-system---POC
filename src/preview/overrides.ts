import { useSyncExternalStore } from 'react'
import { DATA, TOKEN_LIST, type TokenKind, type TokenRec } from './data'

/** `json` keeps the original $value of a composite (shadow) edit for export. `add` marks a token that is not in the library: it exists only in this preview. */
export interface Override { mode: 'alias' | 'raw'; value: string; json?: unknown; add?: { layer: TokenRec['layer']; kind: TokenKind; type?: string; description?: string } }
const KEY = '6si-ds-preview-overrides-v1'
let overrides: Record<string, Override> = {}
let version = 0
const listeners = new Set<() => void>()
const root = () => document.documentElement
const PART_VARS: Record<string, string> = { fontFamily: 'font-family', fontSize: 'font-size', fontWeight: 'font-weight', lineHeight: 'line-height', textDecoration: 'text-decoration' }

try { overrides = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { overrides = {} }
// drop broken entries saved by an earlier build (alias with no token name)
overrides = Object.fromEntries(Object.entries(overrides).filter(([, o]) => o && o.value && o.value !== 'undefined'))

const toVar = (n: string) => '--' + n.replace(/\./g, '-')
const cssVarOf = (name: string) => DATA.tokens[name]?.cssVar

/** Add a token that is not in the library so it shows in the editor and can be referenced by other edits. Preview only. */
function register(name: string, add: NonNullable<Override['add']>, value: string, css: string | null) {
  if (DATA.tokens[name]) return
  const rec: TokenRec = { name, layer: add.layer, kind: add.kind, type: add.type, value, css, aliases: [], description: add.description, file: '(added in preview)', cssVar: toVar(name) }
  DATA.tokens[name] = rec; TOKEN_LIST.push(rec)
}
const unregister = (name: string) => {
  delete DATA.tokens[name]
  const i = TOKEN_LIST.findIndex((t) => t.name === name); if (i >= 0) TOKEN_LIST.splice(i, 1)
}
for (const [n, o] of Object.entries(overrides)) if (o.add) register(n, o.add, o.mode === 'raw' ? o.value : `{${o.value}}`, o.mode === 'raw' ? o.value : null)

const RGBA = /rgba\(\s*\{([^}]+)\}\s*,\s*\{([^}]+)\}\s*\)/g
const ALIAS = /\{([^}]+)\}/g
const isShadowValue = (v: unknown) => Array.isArray(v) ? v.length > 0 && v.every((l) => l && typeof l === 'object' && 'blur' in l) : !!v && typeof v === 'object' && 'blur' in (v as object) && 'type' in (v as object)
/** Layer array or single layer to a CSS box-shadow string, aliases as var(), the same way the build does it. */
function shadowCss(raw: unknown, known: (n: string) => boolean): { css?: string; missing?: string } {
  let missing: string | undefined
  const part = (v: unknown) => {
    let x = String(v ?? '0')
    x = x.replace(RGBA, (m, c, o) => { const bad = !known(c) ? c : !known(o) ? o : ''; if (bad) { missing = bad; return m } return `color-mix(in srgb, var(${toVar(c)}) calc(var(${toVar(o)}) * 100%), transparent)` })
    return x.replace(ALIAS, (m, r) => { if (!known(r)) { missing = r; return m } return `var(${toVar(r)})` })
  }
  const layers = (Array.isArray(raw) ? raw : [raw]) as Array<Record<string, unknown>>
  const css = layers.map((l) => `${l.type === 'innerShadow' ? 'inset ' : ''}${part(l.x)} ${part(l.y)} ${part(l.blur)} ${part(l.spread)} ${part(l.color)}`).join(', ')
  return missing ? { missing } : { css }
}
function applyOne(name: string) {
  const t = DATA.tokens[name]; const o = overrides[name]
  if (!t) return
  const vars = t.kind === 'typography' ? [...Object.keys(t.parts || {}).map((k) => `${t.cssVar}-${PART_VARS[k] || k}`), `${t.cssVar}-font`] : [t.cssVar]
  if (!o) { vars.forEach((v) => root().style.removeProperty(v)); return }
  if (t.kind === 'typography' && o.mode === 'alias') {
    const tv = cssVarOf(o.value)
    if (!tv) return
    vars.forEach((v) => root().style.setProperty(v, `var(${v.replace(t.cssVar, tv)})`))
    return
  }
  const val = o.mode === 'alias' ? `var(${cssVarOf(o.value)})` : o.value
  root().style.setProperty(t.cssVar, val)
}
const emit = () => { version++; listeners.forEach((l) => l()); try { localStorage.setItem(KEY, JSON.stringify(overrides)) } catch { /* private mode */ } }
export const applyAll = () => Object.keys(overrides).forEach(applyOne)
export const setOverride = (name: string, o: Override) => {
  if (!o.value) return // never store an empty alias or value
  overrides = { ...overrides, [name]: o }; applyOne(name); emit() }
export const clearOverride = (name: string) => { const { [name]: _gone, ...rest } = overrides; overrides = rest; applyOne(name); if (_gone?.add) unregister(name); emit() }
export const clearAll = () => { const old = overrides; const names = Object.keys(old); overrides = {}; names.forEach(applyOne); names.forEach((n) => { if (old[n].add) unregister(n) }); emit() }
export const getOverrides = () => overrides
export function useOverrides() {
  useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => version)
  return overrides
}
/** Computed (resolved) value of a token's CSS variable right now. */
export const computedValue = (t: TokenRec): string => {
  const v = t.kind === 'typography' ? `${t.cssVar}-font` : t.cssVar
  return getComputedStyle(root()).getPropertyValue(v).trim()
}
/** DTCG patch of every edited token. */
export function exportPatch() {
  const out: Record<string, unknown> = {}
  for (const [name, o] of Object.entries(overrides)) {
    const t = DATA.tokens[name]
    let cur: Record<string, unknown> = out
    const parts = name.split('.')
    parts.slice(0, -1).forEach((p) => { cur = (cur[p] = (cur[p] as Record<string, unknown>) || {}) as Record<string, unknown> })
    cur[parts[parts.length - 1]] = { ...(t?.type ? { $type: t.type } : {}), $value: o.json !== undefined ? o.json : o.mode === 'alias' ? `{${o.value}}` : o.value, $description: o.add ? (o.add.description || 'Added in preview.') : `Edited in preview. Was: ${t?.aliases?.length === 1 && t.css?.startsWith('var(') ? `{${t.aliases[0]}}` : t?.value}` }
  }
  return out
}

export interface ImportResult { applied: string[]; added?: string[]; unchanged: number; skipped: Array<{ name: string; reason: string }>; error?: string }

/**
 * Apply a token JSON (the editor's own export, a DTCG fragment, or a flat { "token.name": value } map) as live edits.
 * Every entry is checked against the real token list; bad entries are skipped with a reason, never half-applied.
 */
export function importPatch(text: string): ImportResult {
  const res: ImportResult = { applied: [], added: [], unchanged: 0, skipped: [] }
  let json: unknown
  try { json = JSON.parse(text) } catch (e) { return { ...res, error: `Not valid JSON: ${(e as Error).message}` } }
  if (!json || typeof json !== 'object' || Array.isArray(json)) return { ...res, error: 'Expected a JSON object of tokens.' }

  const found: Array<[string, unknown, string | undefined]> = []
  const walk = (o: Record<string, unknown>, path: string[]) => {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$')) continue
      const p = [...path, k]
      if (v && typeof v === 'object' && !Array.isArray(v) && '$value' in (v as object)) found.push([p.join('.'), (v as Record<string, unknown>).$value, (v as Record<string, unknown>).$type as string | undefined])
      else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v as Record<string, unknown>, p)
      else if (typeof v === 'string' || typeof v === 'number') found.push([p.join('.'), v, undefined]) // flat form or bare value
    }
  }
  // The combined bundle (6ds-all-tokens.json) wraps each token file as { layer: { file: { core: ... } } }. Unwrap it; modes are not tokens.
  const top = Object.keys(json as object)
  const LAYERS = ['primitive', 'semantic', 'component', 'modes', 'themes']
  if (top.length && top.every((k) => LAYERS.includes(k))) {
    for (const layer of top) {
      if (layer === 'modes' || layer === 'themes') continue
      for (const file of Object.values((json as Record<string, Record<string, unknown>>)[layer] || {})) if (file && typeof file === 'object') walk(file as Record<string, unknown>, [])
    }
  } else walk(json as Record<string, unknown>, [])
  if (!found.length) return { ...res, error: 'No tokens found. Each token needs a "$value".' }

  const inFile = new Set(found.map((f) => f[0]))
  const known = (n: string) => !!DATA.tokens[n] || inFile.has(n)
  const kindFromType = (type: string | undefined, v: string): TokenKind =>
    type === 'boxShadow' ? 'shadow' : type === 'opacity' || type === 'number' ? 'number' : type === 'color' ? 'color'
      : type && /dimension|spacing|sizing|borderRadius|borderWidth|fontSizes/.test(type) ? 'dimension'
        : /^#[0-9a-f]{3,8}$/i.test(v) ? 'color' : /^-?\d*\.?\d+(px|rem|em)$/.test(v) ? 'dimension' : /^-?\d*\.?\d+$/.test(v) ? 'number' : 'string'
  const describe = (name: string, raw: unknown) => `Added in preview from an uploaded file (${name}).`

  for (const [name, raw, type] of found) {
    const existing = DATA.tokens[name]
    const isNew = !existing
    if (existing && !getOverrides()[name] && existing.source !== undefined && JSON.stringify(raw) === JSON.stringify(existing.source)) { res.unchanged++; continue }
    const layerGuess: TokenRec['layer'] = typeof raw === 'string' && /\{[^}]+\}/.test(raw) || isShadowValue(raw) && /\{[^}]+\}/.test(JSON.stringify(raw)) ? 'semantic' : 'primitive'

    if (isShadowValue(raw)) {
      if (existing && existing.kind !== 'shadow') { res.skipped.push({ name, reason: `Token is ${existing.kind}, not a shadow` }); continue }
      const r = shadowCss(raw, known)
      if (r.missing) { res.skipped.push({ name, reason: `Alias target ${r.missing} does not exist` }); continue }
      if (isNew) register(name, { layer: layerGuess, kind: 'shadow', type: type || 'boxShadow', description: describe(name, raw) }, r.css!, r.css!)
      setOverride(name, { mode: 'raw', value: r.css!, json: raw, ...(isNew ? { add: { layer: layerGuess, kind: 'shadow' as TokenKind, type: type || 'boxShadow', description: describe(name, raw) } } : {}) })
      res.applied.push(name); if (isNew) res.added!.push(name)
      continue
    }
    if (raw === null || typeof raw === 'object') { res.skipped.push({ name, reason: 'Composite values are not supported. Use an alias or a single value.' }); continue }
    const value = String(raw).trim()
    if (!value) { res.skipped.push({ name, reason: 'Empty value' }); continue }
    const alias = /^\{([^}]+)\}$/.exec(value)
    if (alias) {
      const target = DATA.tokens[alias[1]]
      if (!target && !inFile.has(alias[1])) { res.skipped.push({ name, reason: `Alias target ${alias[1]} does not exist` }); continue }
      if (alias[1] === name) { res.skipped.push({ name, reason: 'A token cannot alias itself' }); continue }
      if (existing && target && target.kind !== existing.kind) { res.skipped.push({ name, reason: `Alias target is ${target.kind}, this token is ${existing.kind}` }); continue }
      if (existing && !getOverrides()[name] && existing.aliases?.length === 1 && existing.aliases[0] === alias[1] && existing.css?.startsWith('var(')) { res.unchanged++; continue }
      if (isNew) {
        const kind = target?.kind ?? kindFromType(type, value)
        const add = { layer: 'semantic' as const, kind, type, description: describe(name, raw) }
        register(name, add, value, null)
        setOverride(name, { mode: 'alias', value: alias[1], add })
        res.added!.push(name)
      } else setOverride(name, { mode: 'alias', value: alias[1] })
    } else {
      if (existing && (existing.kind === 'typography' || existing.kind === 'shadow')) { res.skipped.push({ name, reason: `${existing.kind} tokens take an alias, not a raw value` }); continue }
      if (existing && !getOverrides()[name] && (value === String(existing.value) || value === existing.css)) { res.unchanged++; continue }
      if (isNew) {
        const add = { layer: 'primitive' as const, kind: kindFromType(type, value), type, description: describe(name, raw) }
        register(name, add, value, value)
        setOverride(name, { mode: 'raw', value, add })
        res.added!.push(name)
      } else setOverride(name, { mode: 'raw', value })
    }
    res.applied.push(name)
  }
  return res
}
