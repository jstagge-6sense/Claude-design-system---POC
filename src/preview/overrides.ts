import { useSyncExternalStore } from 'react'
import { DATA, type TokenRec } from './data'

export interface Override { mode: 'alias' | 'raw'; value: string }
const KEY = '6si-ds-preview-overrides-v1'
let overrides: Record<string, Override> = {}
let version = 0
const listeners = new Set<() => void>()
const root = () => document.documentElement
const PART_VARS: Record<string, string> = { fontFamily: 'font-family', fontSize: 'font-size', fontWeight: 'font-weight', lineHeight: 'line-height', textDecoration: 'text-decoration' }

try { overrides = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { overrides = {} }

const cssVarOf = (name: string) => DATA.tokens[name]?.cssVar
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
export const setOverride = (name: string, o: Override) => { overrides = { ...overrides, [name]: o }; applyOne(name); emit() }
export const clearOverride = (name: string) => { const { [name]: _gone, ...rest } = overrides; overrides = rest; applyOne(name); emit() }
export const clearAll = () => { const names = Object.keys(overrides); overrides = {}; names.forEach(applyOne); emit() }
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
    cur[parts[parts.length - 1]] = { ...(t?.type ? { $type: t.type } : {}), $value: o.mode === 'alias' ? `{${o.value}}` : o.value, $description: `Edited in preview. Was: ${t?.aliases?.length === 1 && t.css?.startsWith('var(') ? `{${t.aliases[0]}}` : t?.value}` }
  }
  return out
}
