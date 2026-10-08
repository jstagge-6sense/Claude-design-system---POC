#!/usr/bin/env node
// Verifies that chart colors are 6DS colors only.
//  1. Every color in src/charts/palette.generated.ts equals the 6DS primitive token it names (tokens/primitive/color.json).
//  2. Every usable step has >= 3:1 contrast on white.
//  3. No raw hex or rgb() color is typed in chart source files (only the generated palette may contain hex).
//  4. Advisory: saturation profile of each 6DS ramp compared with the chroma-trajectory method (light end ~40%, center ~100%, dark end ~50%).
// Usage: node scripts/verify-chart-palette.mjs   (run `node scripts/gen-chart-palette.mjs` first if tokens changed)
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tokens = JSON.parse(readFileSync(join(root, 'tokens/primitive/color.json'), 'utf8')).core.color
const gen = readFileSync(join(root, 'src/charts/palette.generated.ts'), 'utf8')
const json = (name) => JSON.parse(gen.match(new RegExp(`export const ${name}[^=]*= (\\{[\\s\\S]*?\\n\\}|\\[[\\s\\S]*?\\n\\])\\n`))[1])
const USABLE = json('USABLE')
const CAT = json('CATEGORICAL_STEPS')

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const contrast = (h) => { const [r, g, b] = rgb(h).map(lin); return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05) }
const hsl = (h) => { const [r, g, b] = rgb(h); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l } }

let fail = 0
const err = (m) => { console.error('✘ ' + m); fail++ }

// 1 + 2
const tokenHex = (t) => { const [, , hue, step] = t.split('.'); return tokens[hue]?.[step]?.$value?.toLowerCase() }
for (const [hue, steps] of Object.entries(USABLE)) {
  for (const s of steps) {
    if (tokenHex(s.token) !== s.hex) err(`${s.token}: palette has ${s.hex}, token is ${tokenHex(s.token)}`)
    if (contrast(s.hex) < 3) err(`${s.token}: ${contrast(s.hex).toFixed(2)}:1 is below 3:1`)
  }
}
for (const c of CAT) if (tokenHex(c.token) !== c.hex) err(`categorical ${c.token}: palette ${c.hex} != token ${tokenHex(c.token)}`)

// 3
const hexRe = /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/
function* files(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (!['dist', 'vendor'].includes(f)) yield* files(p) } else yield p } }
for (const f of files(join(root, 'src/charts'))) {
  if (!/\.(ts|tsx|css)$/.test(f) || /palette\.generated\.ts$|\.test\.tsx$/.test(f)) continue
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
    if (/withAlpha|rgba\(\$\{/.test(code)) return // the helper that builds rgba() from a palette hex
    if (hexRe.test(code)) err(`${f.replace(root + '/', '')}:${i + 1} raw color: ${line.trim().slice(0, 90)}`)
  })
}

// 4 advisory
console.log('6DS chart palette (usable steps, >= 3:1 on white):')
for (const [hue, steps] of Object.entries(USABLE)) {
  const sat = steps.map((s) => Math.round(hsl(s.hex).s * 100))
  console.log(`  ${hue.padEnd(6)} ${steps.length} steps  min ${Math.min(...steps.map((s) => contrast(s.hex))).toFixed(2)}:1  saturation ${sat.join('/')}`)
}
console.log('  (saturation is advisory: the chroma-trajectory method targets ~40% light end, ~100% center, ~50% dark end; 6DS ramps are used as defined.)')
if (fail) { console.error(`\n${fail} problem(s).`); process.exit(1) }
console.log('\n✔ Chart colors are 6DS tokens only.')
