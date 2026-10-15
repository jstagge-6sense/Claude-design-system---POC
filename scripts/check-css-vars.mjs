#!/usr/bin/env node
// Fails when component CSS uses a custom property that no token or style file defines.
// An undefined variable makes the whole CSS property drop out (no size, border, fill or gap), so this catches broken styling
// that the token build and the token lint can miss. Run after `npm run build:tokens && npm run build:modes`.
// Usage: node scripts/check-css-vars.mjs [root]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
const root = resolve(process.argv[2] || '.')
const walk = (d) => (existsSync(d) ? readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.css$/.test(p) ? [p] : [] }) : [])
const defined = new Set()
for (const f of [...walk(join(root, 'dist')).filter((p) => !p.includes('/lean/')), ...walk(join(root, 'src/styles'))]) for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1])
if (!defined.size) { console.error('No tokens found in dist/. Run npm run build:tokens and npm run build:modes first.'); process.exit(2) }
const bad = []
for (const f of [...walk(join(root, 'src/components')), ...walk(join(root, 'src/primitives'))]) {
  const css = readFileSync(f, 'utf8')
  const local = new Set([...css.matchAll(/(--_[\w-]+)\s*:/g)].map((m) => m[1]))
  const miss = new Set([...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]).filter((v) => !v.startsWith('--_') && !local.has(v) && !defined.has(v)))
  if (miss.size) bad.push([f.replace(root + '/', ''), [...miss]])
}
for (const [f, vars] of bad) console.error(`✘ ${f}: ${vars.length} undefined\n    ${vars.slice(0, 6).join('\n    ')}${vars.length > 6 ? '\n    ...' : ''}`)
console.log(bad.length ? `CSS variables: ${bad.length} file(s) use undefined variables` : 'CSS variables: every var() in component CSS is defined')
process.exit(bad.length ? 1 : 0)
