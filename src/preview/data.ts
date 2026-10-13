// Reads the data the build script embedded in the HTML page.
export type TokenKind = 'color' | 'gradient' | 'dimension' | 'number' | 'shadow' | 'typography' | 'fontFamily' | 'fontWeight' | 'lineHeight' | 'string'
export interface TokenRec {
  name: string; layer: 'primitive' | 'semantic' | 'component' | 'theme'; kind: TokenKind; type?: string
  value: string; css: string | null; parts?: Record<string, string>; aliases: string[]; description?: string
  file: string; gap?: string; cssVar: string
  /** The token's $value exactly as written in its source file. Used to tell an unchanged import from an edit. */
  source?: unknown
}
export interface PreviewData {
  tokens: Record<string, TokenRec>
  gaps: Array<{ id: string; token: string; aliases: string[]; note: string }>
  state: { level?: string; gaps?: unknown[]; conflicts?: Array<{ id: string; title: string; detail: string; status?: string }>; deferred?: unknown[]; components?: Record<string, { status: string }> }
  lean?: string[] // pass-through component tokens hidden in the Lean set
  analytics?: Analytics
  builtAt: string
}
export type Pairs = Array<[string, number]>
export interface Analytics {
  header: { all: number; component: number; core: number }
  byLayer: Record<'primitive' | 'semantic' | 'component', { total: number; distinct: number; kinds: Record<string, number> }>
  total: number; semGroups: Record<string, number>; primGroups: Record<string, number>; compTokenCounts: Pairs; compTokenComponents: number
  usage: { usedDirect: number; unusedNonPrimitive: number; unusedList: string[]; byLayerDirect: Record<string, number>; mostShared: Pairs; tokensPerComponent: Pairs; usedBy?: Record<string, string[]> }
  components: { total: number; stories: number; tiers: Record<string, number>; withStructuralVariants: number; structuralVariantCount: number; allVariantCount: number; storiesPerComponent: Pairs; motion: { animated: number; onMotionTokens: string[]; onAliases: number; hardcoded: string[]; static: number } }
  items: { gapsFlagged: number; conflictsOpen: number; conflictsClosed: number; conflicts: Array<{ id: string; title: string; status: string }> }
  modes: { darkOverrides: number; contrastPairs: number; contrastPass: number }
  motionTokens: number
}
const el = typeof document !== 'undefined' ? document.getElementById('ds-data') : null
export const DATA: PreviewData = el ? JSON.parse(el.textContent || '{}') : { tokens: {}, gaps: [], state: {}, builtAt: '' }
export const PASSTHROUGH = new Set(DATA.lean || [])
export const FULL_COUNT = Object.keys(DATA.tokens).length
// Counts treat tokens that resolve to the same value as one unit (within their group).
const valueKey = (t: TokenRec) => t.css ?? `${t.value}|${JSON.stringify(t.parts || {})}`
const distinct = (list: TokenRec[]) => new Set(list.map(valueKey)).size
const ALL = Object.values(DATA.tokens)
export const COMP_FULL = ALL.filter((t) => t.layer === 'component').length
export const COMP_LEAN = distinct(ALL.filter((t) => t.layer === 'component')) // distinct component values
export const CORE_COUNT = distinct(ALL.filter((t) => t.layer !== 'component')) // distinct primitive + semantic values
export const LEAN_COUNT = COMP_LEAN + CORE_COUNT
export const TOKEN_LIST: TokenRec[] = Object.entries(DATA.tokens).map(([name, t]) => ({ ...t, name: (t as { name?: string }).name || name }))

// Library items that are not folders under src/components but are part of the library: the Data-Viz charts and the shared
// pieces. They have no component tokens of their own. Together with src/components they make the full library list.
/** Product components counted in the DS component sheet (React column) that are not in this repo yet: Revvy, explainability and shared pieces. */
export const PRODUCT_COMPONENTS = ['iconButton', 'categoryBadge', 'feedbackModal', 'revvyChat', 'revvyLibrary', 'revvyHistory', 'modelBlocks', 'markdown', 'aiReaction', 'reactionModal', 'label', 'helperText', 'body', 'header', 'footer', 'customScroll']
export const EXTRA_COMPONENTS = ['lineChart', 'barChart', 'stackedGroupedBarChart', 'donutChart', 'areaChart', 'dbaChart', 'funnelChart', 'paretoChart', 'icon', 'portal', 'visuallyHidden']
