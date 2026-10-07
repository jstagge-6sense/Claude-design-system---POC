// Reads the data the build script embedded in the HTML page.
export type TokenKind = 'color' | 'gradient' | 'dimension' | 'number' | 'shadow' | 'typography' | 'fontFamily' | 'fontWeight' | 'lineHeight' | 'string'
export interface TokenRec {
  name: string; layer: 'primitive' | 'semantic' | 'component' | 'theme'; kind: TokenKind; type?: string
  value: string; css: string | null; parts?: Record<string, string>; aliases: string[]; description?: string
  file: string; gap?: string; cssVar: string
}
export interface PreviewData {
  tokens: Record<string, TokenRec>
  gaps: Array<{ id: string; token: string; aliases: string[]; note: string }>
  state: { level?: string; gaps?: unknown[]; conflicts?: Array<{ id: string; title: string; detail: string; status?: string }>; deferred?: unknown[]; components?: Record<string, { status: string }> }
  lean?: string[] // pass-through component tokens hidden in the Lean set
  builtAt: string
}
const el = typeof document !== 'undefined' ? document.getElementById('ds-data') : null
export const DATA: PreviewData = el ? JSON.parse(el.textContent || '{}') : { tokens: {}, gaps: [], state: {}, builtAt: '' }
export const PASSTHROUGH = new Set(DATA.lean || [])
export const LEAN_COUNT = Object.keys(DATA.tokens).length - PASSTHROUGH.size
export const FULL_COUNT = Object.keys(DATA.tokens).length
export const COMP_FULL = Object.values(DATA.tokens).filter((t) => t.layer === 'component').length
export const COMP_LEAN = COMP_FULL - PASSTHROUGH.size
export const CORE_COUNT = FULL_COUNT - COMP_FULL // primitive + semantic, identical in both sets
export const TOKEN_LIST: TokenRec[] = Object.entries(DATA.tokens).map(([name, t]) => ({ ...t, name: (t as { name?: string }).name || name }))
