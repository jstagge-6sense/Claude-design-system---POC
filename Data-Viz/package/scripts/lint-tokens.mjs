#!/usr/bin/env node
// Component CSS lint.
//  ERROR: hex/rgb/hsl colors, primitive tokens used directly, var() names that do not exist, z-index outside --ds-z-*.
//  WARN:  raw px/rem/ms literals (use a token, a --ds-* constant, or log a GAP).
// Usage: node scripts/lint-tokens.mjs [root] [--only Button,Input]
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
const args = process.argv.slice(2)
const root = resolve(args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--only' && args[i - 1] !== '--dist') || '.')
const onlyIdx = args.indexOf('--only')
const only = onlyIdx > -1 ? args[onlyIdx + 1].split(',') : null
const distIdx = args.indexOf('--dist')
const tokensPath = join(distIdx > -1 ? resolve(args[distIdx + 1]) : join(root, 'dist'), 'tokens.json')
if (!existsSync(tokensPath)) { console.error('Run npm run build:tokens first'); process.exit(1) }
const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'))
const known = new Map() // css var -> layer
for (const t of Object.values(tokens)) {
  known.set(t.cssVar, t.layer)
  if (t.kind === 'typography') for (const s of ['-font-family', '-font-size', '-font-weight', '-line-height', '-text-decoration', '-font']) known.set(t.cssVar + s, t.layer)
}
const walk = (d) => !existsSync(d) ? [] : readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.css$/.test(p) ? [p] : [] })
const files = [...walk(join(root, 'src/components'))].filter((f) => !only || only.some((n) => f.includes(`/components/${n}/`)))
const errors = [], warns = []
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  const localDefs = new Set([...clean.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
  clean.split('\n').forEach((line, i) => {
    const loc = `${relative(root, f)}:${i + 1}`
    if (/#[0-9a-fA-F]{3,8}\b/.test(line)) errors.push(`${loc} hex color`)
    if (/\b(rgba?|hsla?|hwb|oklch|lab)\(/.test(line)) errors.push(`${loc} raw color function`)
    if (/z-index\s*:\s*(-?\d+)/.test(line) && !/z-index\s*:\s*(0|-1)\b/.test(line)) errors.push(`${loc} z-index must use --ds-z-* (cross-cutting tiers)`)
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const v = m[1]
      if (v.startsWith('--_') || v.startsWith('--ds-') || localDefs.has(v)) continue
      if (!known.has(v)) { errors.push(`${loc} unknown variable ${v}`); continue }
      if (known.get(v) === 'primitive' && !/^--core-effect-(opacity|blur|shadow|glow)-/.test(v)) errors.push(`${loc} primitive token ${v} used in a component. Use a semantic or component token`)
    }
    const stripped = line.replace(/var\([^)]*\)/g, '').replace(/@media[^{]*/g, '').replace(/\b(0|1)px\b/g, '')
    if (/(^|[^\w#-])-?\d*\.?\d+(px|rem|em)\b/.test(stripped) && !/^\s*(--_|--ds)/.test(line)) warns.push(`${loc} raw length: ${line.trim()}`)
  })
}
if (warns.length) console.warn(`Token lint warnings (${warns.length}):\n- ` + warns.slice(0, 40).join('\n- ') + (warns.length > 40 ? `\n- ...${warns.length - 40} more` : ''))
if (errors.length) { console.error(`Token lint failed (${errors.length}):\n- ` + errors.join('\n- ')); process.exit(1) }
console.log(`Token lint passed (${files.length} css files, ${warns.length} warnings)`)
