// Design-system analytics for the preview: token counts, usage, components, variants, motion coverage, modes and open items.
// Pure read-only. Everything is computed from the repo at build time and embedded in the preview data.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const walk = (d, o = []) => { if (!existsSync(d)) return o; for (const f of readdirSync(d, { withFileTypes: true })) { const p = join(d, f.name); f.isDirectory() ? walk(p, o) : o.push(p) } return o }
const PART = /-(font|font-family|font-size|font-weight|line-height|text-decoration)$/
const STRUCT = /^(variant|type|orientation|mode|layout|kind)$/i
const STYLE = /^(size|density|align|placement|tone|shape|appearance|level|direction|position|status|intent)$/i
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)

export function buildAnalytics(root, { tokens, gaps, state, modes }) {
  const list = Object.entries(tokens).map(([name, t]) => ({ name, ...t }))
  const layers = ['primitive', 'semantic', 'component']
  const valueKey = (t) => t.css ?? `${t.value}|${JSON.stringify(t.parts || {})}`

  // ---- token counts
  const byLayer = {}
  for (const l of layers) {
    const ts = list.filter((t) => t.layer === l)
    const kinds = {}; for (const t of ts) kinds[t.kind] = (kinds[t.kind] || 0) + 1
    byLayer[l] = { total: ts.length, distinct: new Set(ts.map(valueKey)).size, kinds }
  }
  const core = list.filter((t) => t.layer !== 'component')
  const header = { all: 0, component: byLayer.component.distinct, core: new Set(core.map(valueKey)).size }
  header.all = header.component + header.core
  const compBy = {}; for (const t of list.filter((t) => t.layer === 'component')) { const c = t.name.split('.')[1]; compBy[c] = (compBy[c] || 0) + 1 }
  const group = (prefix) => { const g = {}; for (const t of list.filter((t) => t.layer !== 'component' && t.name.startsWith(prefix))) { const k = t.name.split('.')[2]; g[k] = (g[k] || 0) + 1 } return g }
  const semGroups = {}, primGroups = {}
  for (const t of list) { if (t.layer === 'component') continue; const k = t.name.split('.')[1]; const tgt = t.layer === 'semantic' ? semGroups : primGroups; tgt[k] = (tgt[k] || 0) + 1 }

  // ---- usage by runtime component source
  const src = walk(join(root, 'src/components')).filter((f) => /\.(css|tsx?)$/.test(f) && !/\.(stories|test|spec)\.|\.figma\./.test(f))
  const known = new Set(list.map((t) => t.cssVar))
  const refCount = {}, filesPerVar = {}, perComponent = {}
  for (const f of src) {
    const comp = f.split('/components/')[1].split('/')[0]
    const text = readFileSync(f, 'utf8')
    for (const m of text.matchAll(/--(?:core|component)-[A-Za-z0-9-]+/g)) {
      let v = m[0]; if (!known.has(v) && known.has(v.replace(PART, ''))) v = v.replace(PART, '')
      if (!known.has(v)) continue
      refCount[v] = (refCount[v] || 0) + 1
      ;(filesPerVar[v] ??= new Set()).add(comp)
      ;(perComponent[comp] ??= new Set()).add(v)
    }
  }
  const modeText = JSON.stringify(modes || {})
  const dep = {}; for (const t of list) for (const a of t.aliases || []) (dep[a] ??= []).push(t.name)
  const unused = list.filter((t) => t.layer !== 'primitive' && !refCount[t.cssVar] && !(dep[t.name] || []).length && !modeText.includes(t.name)).map((t) => t.name)
  const usedDirect = list.filter((t) => refCount[t.cssVar]).length
  const usage = {
    usedDirect, unusedNonPrimitive: unused.length, unusedList: unused,
    byLayerDirect: Object.fromEntries(layers.map((l) => [l, list.filter((t) => t.layer === l && refCount[t.cssVar]).length])),
    mostShared: top(Object.fromEntries(Object.entries(filesPerVar).map(([v, s]) => [list.find((t) => t.cssVar === v)?.name || v, s.size])), 12),
    tokensPerComponent: top(Object.fromEntries(Object.entries(perComponent).map(([c, s]) => [c, s.size])), 12),
  }

  // ---- components, stories, variants, motion
  const dirs = readdirSync(join(root, 'src/components'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  const comps = []
  for (const name of dirs) {
    const dir = join(root, 'src/components', name)
    const files = walk(dir)
    const stories = files.find((f) => f.endsWith('.stories.tsx'))
    const storyText = stories ? readFileSync(stories, 'utf8') : ''
    const storyCount = (storyText.match(/^export const [A-Z]/gm) || []).length
    const tier = Number((/tier:\s*(\d)/.exec(storyText) || [])[1] ?? 0)
    const main = files.find((f) => f.endsWith(`/${name}.tsx`))
    const tsx = main ? readFileSync(main, 'utf8') : ''
    let structural = 0, styling = 0
    const seen = new Set()
    for (const m of tsx.matchAll(/^\s+(\w+)\??:\s*((?:'[\w-]+'\s*\|\s*)+'[\w-]+')/gm)) {
      const key = m[1] + m[2]; if (seen.has(key)) continue; seen.add(key)
      const n = m[2].split('|').length
      if (STRUCT.test(m[1])) structural += n; else if (STYLE.test(m[1])) styling += n
    }
    const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')).join('\n')
    const animates = /transition\s*:|animation\s*:|@keyframes/.test(css)
    const tokenMotion = /--core-motion-|--ds-motion-|--ds-ease/.test(css)
    const newTokens = /--core-motion-/.test(css)
    comps.push({ name, tier, stories: storyCount, structural, styling, animates, tokenMotion, newTokens, reduced: /prefers-reduced-motion/.test(css) })
  }
  const tiers = {}; for (const c of comps) tiers[c.tier] = (tiers[c.tier] || 0) + 1
  const components = {
    total: comps.length, stories: comps.reduce((a, c) => a + c.stories, 0), tiers,
    withStructuralVariants: comps.filter((c) => c.structural).length,
    structuralVariantCount: comps.reduce((a, c) => a + c.structural, 0) + comps.filter((c) => !c.structural).length,
    allVariantCount: comps.reduce((a, c) => a + c.structural + c.styling, 0) + comps.filter((c) => !c.structural && !c.styling).length,
    storiesPerComponent: top(Object.fromEntries(comps.map((c) => [c.name, c.stories])), 10),
    motion: {
      animated: comps.filter((c) => c.animates).length,
      onMotionTokens: comps.filter((c) => c.newTokens).map((c) => c.name),
      onAliases: comps.filter((c) => c.animates && !c.newTokens && c.tokenMotion).length,
      hardcoded: comps.filter((c) => c.animates && !c.tokenMotion).map((c) => c.name),
      static: comps.filter((c) => !c.animates).length,
    },
  }

  // ---- modes, contrast, open items
  const pairs = modes?.contrast || []
  const conflicts = (state.conflicts || [])
  const closed = (s) => /^(resolved|decided|allowed|noted)/i.test(s || '')
  const items = {
    gapsFlagged: gaps.length,
    conflictsOpen: conflicts.filter((c) => !closed(c.status)).length,
    conflictsClosed: conflicts.filter((c) => closed(c.status)).length,
    conflicts: conflicts.map((c) => ({ id: c.id, title: c.title, status: c.status || 'Open' })),
  }
  const motionTokens = list.filter((t) => t.name.startsWith('core.motion.')).length
  return {
    header, byLayer, total: list.length, semGroups, primGroups, compTokenCounts: top(compBy, 12), compTokenComponents: Object.keys(compBy).length,
    usage, components, items,
    modes: { darkOverrides: Object.keys(modes?.dark?.override || modes?.dark?.overrides || {}).length, contrastPairs: pairs.length, contrastPass: pairs.filter((p) => p.pass ?? p.ok ?? (p.ratio >= (p.min ?? 4.5))).length },
    motionTokens,
  }
}
