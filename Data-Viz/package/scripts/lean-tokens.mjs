#!/usr/bin/env node
// Lean token set (Option A): drop component tokens that are pure pass-throughs to ONE semantic token.
//  A pass-through = component token whose css is exactly var(--core-...) (non-effect), i.e. no component-specific decision.
//  Source JSON in tokens/ is NOT touched. Outputs (all under dist/lean/):
//    tokens.json            the lean token set (full set minus pass-throughs)
//    passthrough.json       { "--component-x": "--core-y", ... } the removed tokens and what they pointed at
//    root/src/components/   component CSS rewritten to reference the semantic token directly
//  Then lints the rewritten CSS against the lean set. Re-run after any token or CSS change.
// Usage: node scripts/lean-tokens.mjs [root]
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(process.argv[2] || '.')
const full = JSON.parse(readFileSync(join(root, 'dist/tokens.json'), 'utf8'))
const out = join(root, 'dist/lean')
mkdirSync(out, { recursive: true })

// Only semantic targets qualify. Primitive targets (borderWidth, size, radius, raw colors) stay as component tokens,
// because components may not reference primitives directly (layer rule).
const isPass = (t) => t.layer === 'component' && (t.aliases || []).length === 1 && /^var\(--core-(?!effect)[\w-]+\)$/.test(t.css || '') && full[t.aliases[0]]?.layer === 'semantic'
const map = {}
const lean = {}
for (const [name, t] of Object.entries(full)) {
  if (isPass(t)) map[t.cssVar] = t.css.slice(4, -1)
  else lean[name] = t
}
// chains: a pass-through can only point at a core token, so one hop is enough
writeFileSync(join(out, 'tokens.json'), JSON.stringify(lean, null, 2))
writeFileSync(join(out, 'passthrough.json'), JSON.stringify(map, null, 2))

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.css$/.test(p) ? [p] : [] })
let rewrites = 0, files = 0
const base = join(root, 'src/components')
for (const f of walk(base)) {
  const src = readFileSync(f, 'utf8')
  const next = src.replace(/var\(\s*(--component-[\w-]+)(\s*[,)])/g, (m, v, tail) => {
    if (!map[v]) return m
    rewrites++
    return `var(${map[v]}${tail}`
  })
  const dest = join(out, 'root/src/components', relative(base, f))
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, next)
  files++
}
const count = (o, l) => Object.values(o).filter((t) => t.layer === l).length
console.log(`Lean set: ${Object.keys(lean).length} tokens (primitive ${count(lean, 'primitive')}, semantic ${count(lean, 'semantic')}, component ${count(lean, 'component')}). Removed ${Object.keys(map).length} pass-throughs. Rewrote ${rewrites} var() references in ${files} CSS files.`)
execFileSync('node', ['scripts/lint-tokens.mjs', join(out, 'root'), '--dist', out], { stdio: 'inherit', cwd: root })
