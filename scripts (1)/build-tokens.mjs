#!/usr/bin/env node
// Dependency-free DTCG token build for the 6sense design system.
//
// Differences from the generic scaffold script (all driven by the project's real token files):
//  - Layer comes from the SOURCE FOLDER (tokens/primitive, tokens/semantic, tokens/component), not the root key.
//    Project primitives and semantics both use the root `core`; component tokens use root `component`.
//  - Composite values are supported: typography objects, shadow layer arrays, gradients (strings).
//  - rgba({color},{opacity}) composes with color-mix so opacity and color stay live-editable.
//  - Alias rules: primitive -> primitive. semantic -> primitive | semantic. component -> semantic | component.
//    A component token may alias a primitive only for opacity or blur, or when flagged with
//    "$extensions": { "gap": "GAP-n" } (an approved placeholder, logged in dist/gaps.json).
//
// Emits to dist/: primitive.css semantic.css component.css tokens.json tokens.d.ts figma-syntax.json gaps.json
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'

const argv = process.argv.slice(2)
const flag = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : null }
const root = resolve(argv.find((a) => !a.startsWith('--') && a !== flag('--out') && a !== flag('--components')) || '.')
const tokDir = join(root, 'tokens')
// --out <dir>: write somewhere other than dist/ (use a private dir when validating one component in parallel work).
// --components a,b: only load tokens/component/a.json and b.json (primitive + semantic always load).
const out = flag('--out') ? resolve(flag('--out')) : join(root, 'dist')
const onlyComponents = flag('--components') ? flag('--components').split(',') : null
const errors = []
const warnings = []

const walkFiles = (d) => !existsSync(d) ? [] : readdirSync(d).sort().flatMap((f) => {
  const p = join(d, f)
  if (statSync(p).isDirectory()) return walkFiles(p)
  if (!p.endsWith('.json')) return []
  if (onlyComponents && d.endsWith('/component') && !onlyComponents.includes(f.replace(/\.json$/, ''))) return []
  return [p]
})

const FONT_FALLBACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

// ---- 1. Flatten ---------------------------------------------------------------------------
const flat = {} // name -> { raw, type, desc, file, layer, ext }
const isShadowLayer = (o) => o && typeof o === 'object' && ('blur' in o || 'spread' in o) && 'type' in o
const isTypographyObj = (o) => o && typeof o === 'object' && !Array.isArray(o) && ('fontSize' in o || 'fontFamily' in o)

const visit = (node, path, inheritedType, file, layer) => {
  if (node && typeof node === 'object' && !Array.isArray(node) && '$value' in node) {
    flat[path.join('.')] = {
      raw: node.$value, type: node.$type || inheritedType, desc: node.$description, file, layer, ext: node.$extensions || {},
    }
    return
  }
  for (const [k, v] of Object.entries(node || {})) {
    if (k.startsWith('$')) continue
    visit(v, [...path, k], node.$type || inheritedType, file, layer)
  }
}
const LAYER_DIRS = { primitive: 'primitive', semantic: 'semantic', component: 'component', themes: 'theme' }
for (const [dir, layer] of Object.entries(LAYER_DIRS)) {
  for (const f of walkFiles(join(tokDir, dir))) {
    let json
    try { json = JSON.parse(readFileSync(f, 'utf8')) } catch (e) { errors.push(`${relative(root, f)}: invalid JSON (${e.message})`); continue }
    const before = new Set(Object.keys(flat))
    visit(json, [], undefined, relative(root, f), layer)
    for (const n of Object.keys(flat)) if (!before.has(n) && flat[n].file !== relative(root, f)) errors.push(`${n}: defined twice`)
  }
}
// duplicate detection across files (visit overwrites silently)
{
  const seen = {}
  for (const [dir] of Object.entries(LAYER_DIRS)) for (const f of walkFiles(join(tokDir, dir))) {
    const tmp = {}
    const collect = (node, path) => {
      if (node && typeof node === 'object' && !Array.isArray(node) && '$value' in node) { tmp[path.join('.')] = 1; return }
      for (const [k, v] of Object.entries(node || {})) if (!k.startsWith('$')) collect(v, [...path, k])
    }
    try { collect(JSON.parse(readFileSync(f, 'utf8')), []) } catch { /* reported above */ }
    for (const n of Object.keys(tmp)) { if (seen[n] && seen[n] !== f) errors.push(`${n}: defined in both ${relative(root, seen[n])} and ${relative(root, f)}`); seen[n] = f }
  }
}

// leaf/group collisions (e.g. a.b and a.b.c)
for (const n of Object.keys(flat)) {
  const parts = n.split('.')
  for (let i = 1; i < parts.length; i++) {
    const parent = parts.slice(0, i).join('.')
    if (parent in flat) errors.push(`${n}: parent ${parent} is also a token (leaf/group collision)`)
  }
}

const cssVar = (n) => '--' + n.replace(/\./g, '-')
const ALIAS = /\{([^}]+)\}/g
const RGBA = /rgba\(\s*\{([^}]+)\}\s*,\s*\{([^}]+)\}\s*\)/g

// ---- 2. Resolve ---------------------------------------------------------------------------
const resolved = {}
const resolving = []
const OPACITY_BLUR = /^core\.effect\.(opacity|blur|shadow|glow)\./

const checkRef = (name, ref, t) => {
  if (!(ref in flat)) { errors.push(`${name}: unresolved alias {${ref}} (${t.file})`); return false }
  const rl = flat[ref].layer
  if (t.layer === 'primitive' && rl !== 'primitive') errors.push(`${name}: primitive may alias primitives only (got ${ref})`)
  if (t.layer === 'semantic' && rl === 'component') errors.push(`${name}: semantic may not alias component tokens (got ${ref})`)
  if (t.layer === 'component') {
    if (rl === 'primitive' && !t.ext.gap && !OPACITY_BLUR.test(ref))
      errors.push(`${name}: component may not alias primitive ${ref}. Use a semantic token, or flag "$extensions.gap" with a GAP id`)
  }
  return true
}

// Convert a string with {aliases} and rgba({c},{o}) into css + display (fully resolved) strings.
const resolveString = (name, str, t, aliases) => {
  let css = String(str)
  let display = String(str)
  const sub = (ref) => {
    aliases.push(ref)
    if (!checkRef(name, ref, t)) return null
    const r = resolveToken(ref)
    return r
  }
  css = css.replace(RGBA, (m, c, o) => {
    const rc = sub(c), ro = sub(o)
    if (!rc || !ro) return m
    return `color-mix(in srgb, var(${cssVar(c)}) calc(var(${cssVar(o)}) * 100%), transparent)`
  })
  display = display.replace(RGBA, (m, c, o) => {
    const rc = resolved[c], ro = resolved[o]
    if (!rc || !ro) return m
    return toRgba(rc.value, ro.value)
  })
  css = css.replace(ALIAS, (m, ref) => { const r = sub(ref); return r ? `var(${cssVar(ref)})` : m })
  display = display.replace(ALIAS, (m, ref) => resolved[ref] ? resolved[ref].value : m)
  return { css, display }
}
const toRgba = (hex, op) => {
  const h = String(hex).replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return `rgba(${hex}, ${op})`
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${op})`
}

const kindOf = (t, value) => {
  if (Array.isArray(value) || isShadowLayer(value)) return 'shadow'
  if (isTypographyObj(value)) return 'typography'
  const ty = t.type
  if (ty === 'shadow') return 'shadow'
  if (ty === 'typography') return 'typography'
  if (ty === 'gradient') return 'gradient'
  if (ty === 'color') return /gradient\(/.test(String(value)) ? 'gradient' : 'color'
  if (['fontFamilies'].includes(ty)) return 'fontFamily'
  if (['fontWeights'].includes(ty)) return 'fontWeight'
  if (['fontSizes', 'spacing', 'sizing', 'borderRadius', 'borderWidth', 'dimension'].includes(ty)) return 'dimension'
  if (['lineHeights'].includes(ty)) return 'lineHeight'
  if (ty === 'number' || ty === 'opacity') return 'number'
  if (typeof value === 'number') return 'number'
  if (/^#[0-9a-fA-F]{3,8}$/.test(String(value))) return 'color'
  if (/^-?\d*\.?\d+(px|rem|em|%)?$/.test(String(value))) return /px|rem|em/.test(String(value)) ? 'dimension' : 'number'
  return 'string'
}

const shadowToCss = (name, layer, t, aliases) => {
  const f = (v) => resolveString(name, v === undefined ? '0' : v, t, aliases)
  const x = f(layer.x), y = f(layer.y), b = f(layer.blur), s = f(layer.spread), c = f(layer.color)
  const inset = layer.type === 'innerShadow' ? 'inset ' : ''
  return {
    css: `${inset}${x.css} ${y.css} ${b.css} ${s.css} ${c.css}`,
    display: `${inset}${x.display} ${y.display} ${b.display} ${s.display} ${c.display}`,
  }
}

function resolveToken(name) {
  if (name in resolved) return resolved[name]
  const t = flat[name]
  if (!t) return null
  if (resolving.includes(name)) { errors.push(`Circular alias: ${[...resolving, name].join(' -> ')}`); return null }
  resolving.push(name)
  const aliases = []
  const rec = {
    name, layer: t.layer, type: t.type, description: t.desc, file: t.file, gap: t.ext.gap, aliases, raw: t.raw,
  }
  const raw = t.raw
  if (isTypographyObj(raw)) {
    rec.kind = 'typography'
    rec.parts = {}
    rec.partsDisplay = {}
    for (const [k, v] of Object.entries(raw)) {
      if (k.startsWith('$')) continue
      let { css, display } = resolveString(name, v, t, aliases)
      if (k === 'fontFamily') { const q = (s) => (/[ ]/.test(s) && !/^["']/.test(s) ? `"${s}"` : s); css = css; display = q(display) + ', ' + FONT_FALLBACK }
      rec.parts[k] = css; rec.partsDisplay[k] = display
    }
    rec.value = Object.entries(rec.partsDisplay).map(([k, v]) => `${k}: ${v}`).join('; ')
    rec.css = null
  } else if (Array.isArray(raw) || isShadowLayer(raw)) {
    rec.kind = 'shadow'
    const layers = (Array.isArray(raw) ? raw : [raw]).map((l) => shadowToCss(name, l, t, aliases))
    rec.css = layers.map((l) => l.css).join(', ')
    rec.value = layers.map((l) => l.display).join(', ')
    rec.layers = Array.isArray(raw) ? raw.length : 1
  } else {
    const strVal = typeof raw === 'number' ? String(raw) : raw
    const { css, display } = resolveString(name, strVal, t, aliases)
    rec.css = css; rec.value = display
    rec.kind = kindOf(t, display)
    // Alias to a composite (typography): forward its parts
    const only = /^\{([^}]+)\}$/.exec(String(strVal))
    if (only && resolved[only[1]] && resolved[only[1]].kind === 'typography') {
      const target = resolved[only[1]]
      rec.kind = 'typography'
      rec.parts = Object.fromEntries(Object.keys(target.parts).map((k) => [k, `var(${cssVar(only[1])}-${kebab(k)})`]))
      rec.partsDisplay = target.partsDisplay
      rec.css = null
    }
    if (rec.kind === 'fontFamily') {
      const q = (s) => (/ /.test(s) && !/^["']/.test(s) ? `"${s}"` : s)
      if (!/var\(/.test(rec.css)) { rec.css = `${q(rec.css)}, ${FONT_FALLBACK}`; rec.value = rec.css }
    }
    if (t.layer !== 'primitive' && !aliases.length && !t.ext.gap) errors.push(`${name}: raw value in ${t.layer} layer; alias a lower layer (or flag $extensions.gap)`)
  }
  resolving.pop()
  return (resolved[name] = rec)
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

for (const n of Object.keys(flat)) resolveToken(n)
// second pass for display values that depended on order
for (const n of Object.keys(resolved)) {
  const r = resolved[n]
  if (r.kind === 'typography' || r.kind === 'shadow') continue
}

if (errors.length) {
  console.error('Token build failed:\n- ' + [...new Set(errors)].join('\n- '))
  process.exit(1)
}

// ---- 3. Emit ------------------------------------------------------------------------------
mkdirSync(out, { recursive: true })
const byLayer = { primitive: [], semantic: [], component: [], theme: [] }
for (const [n, r] of Object.entries(resolved)) {
  const v = cssVar(n)
  const push = (line) => byLayer[r.layer].push('  ' + line)
  if (r.kind === 'typography') {
    const p = r.parts
    const sub = { fontFamily: 'font-family', fontSize: 'font-size', fontWeight: 'font-weight', lineHeight: 'line-height', textDecoration: 'text-decoration' }
    for (const [k, val] of Object.entries(p)) push(`${v}-${sub[k] || kebab(k)}: ${val};`)
    const g = (k, d) => p[k] ? p[k] : d
    // `font` shorthand: weight size/line-height family
    push(`${v}-font: ${g('fontWeight', 'normal')} ${g('fontSize', 'inherit')}/${g('lineHeight', 'normal')} ${p.fontFamily ? p.fontFamily : 'inherit'};`)
  } else {
    push(`${v}: ${r.css};`)
  }
}
for (const [layer, lines] of Object.entries(byLayer)) {
  if (layer === 'theme' && !lines.length) continue
  writeFileSync(join(out, `${layer}.css`), `/* generated by scripts/build-tokens.mjs. Do not edit. */\n:root {\n${lines.join('\n')}\n}\n`)
}
const tokensJson = {}
for (const [n, r] of Object.entries(resolved)) {
  tokensJson[n] = { layer: r.layer, kind: r.kind, type: r.type, value: r.value, css: r.css, parts: r.parts, aliases: [...new Set(r.aliases)], description: r.description, file: r.file, gap: r.gap, cssVar: cssVar(n), source: r.raw }
}
writeFileSync(join(out, 'tokens.json'), JSON.stringify(tokensJson, null, 2))
writeFileSync(join(out, 'tokens.d.ts'), `export type TokenName =\n${Object.keys(resolved).map((n) => `  | '${n}'`).join('\n') || '  never'};\n`)
const figma = {}
for (const n of Object.keys(resolved)) figma[n.replace(/\./g, '/')] = `var(${cssVar(n)})`
writeFileSync(join(out, 'figma-syntax.json'), JSON.stringify(figma, null, 2))
const gaps = Object.values(resolved).filter((r) => r.gap).map((r) => ({ id: r.gap, token: r.name, aliases: r.aliases, note: r.description || '' }))
writeFileSync(join(out, 'gaps.json'), JSON.stringify(gaps, null, 2))

const counts = Object.fromEntries(Object.entries(byLayer).filter(([k]) => k !== 'theme').map(([k]) => [k, Object.values(resolved).filter((r) => r.layer === k).length]))
console.log(`Tokens built: ${JSON.stringify(counts)} (total ${Object.keys(resolved).length}, gaps ${gaps.length})`)
