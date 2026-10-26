// Guards the rule that this library adds no tokens and no raw values: every CSS file may only use var(--...) names that the
// base design system defines (../../dist/*.css), plus local private variables that start with --_.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const dist = join(here, '../../../dist')
if (!existsSync(dist)) { console.error('Base tokens not built. Run "npm run tokens" first.'); process.exit(1) }
const defined = new Set()
for (const f of readdirSync(dist).filter((f) => f.endsWith('.css'))) for (const m of readFileSync(join(dist, f), 'utf8').matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1])

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.css') ? [p] : [] })
let bad = 0
for (const file of walk(join(here, '../src'))) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const own = new Set([...css.matchAll(/(--_[\w-]+)\s*:/g)].map((m) => m[1]))
  for (const m of css.matchAll(/var\((--[\w-]+)/g)) if (!defined.has(m[1]) && !own.has(m[1])) { console.error(`${file}: ${m[1]} is not a base token`); bad++ }
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)) { console.error(`${file}: raw color ${m[0]}`); bad++ }
}
if (bad) process.exit(1)
console.log('Only base tokens in use.')
