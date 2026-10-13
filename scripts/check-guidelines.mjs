#!/usr/bin/env node
// Validates src/preview/guidelines*. Usage: node scripts/check-guidelines.mjs [Component ...]
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
const root = resolve('.')
const esbuild = createRequire(import.meta.url)(process.env.ESBUILD_PATH || '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild')
const out = '/tmp/ds-guidelines-check.cjs'
await esbuild.build({ entryPoints: [join(root, 'src/preview/guidelines.ts')], bundle: true, outfile: out, platform: 'node', format: 'cjs', logLevel: 'error' })
const { GUIDELINES } = createRequire(import.meta.url)(out)
const comps = readdirSync(join(root, 'src/components'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
const only = process.argv.slice(2)
const names = only.length ? only : comps
const T = ['When to use', 'When not to use', 'Anatomy', null, 'Best practices', 'Content guidelines', 'Accessibility (WCAG 2.2)', 'Related components']
const errs = []
const e = (n, m) => errs.push(`${n}: ${m}`)
for (const n of names) {
  const g = GUIDELINES[n]
  if (!g) { e(n, 'missing'); continue }
  for (const k of ['summary', 'usedFor', 'why']) if (!g[k] || g[k].length < 20) e(n, `${k} missing or too short`)
  if (g.sources) e(n, 'remove sources field (not shown)')
  if (g.sections.length !== 8) e(n, `needs 8 sections, has ${g.sections.length}`)
  g.sections.forEach((s, i) => {
    if (T[i] && s.title !== T[i]) e(n, `section ${i + 1} should be "${T[i]}", is "${s.title}"`)
    if (i === 3 && !/^(Choosing|Sizes|Variants|Types|Layout|Options|Picking|Using)/.test(s.title)) e(n, `section 4 title "${s.title}" should start with Choosing/Sizes/Variants/Types/Layout/Options/Picking/Using`)
    if (i === 6) { if (s.intro !== '') e(n, 'Accessibility intro must be empty string'); }
    else if (!s.intro || s.intro.length < 15) e(n, `${s.title}: intro missing`)
    const has = s.bullets?.length || s.groups?.length || s.table || s.anatomy || s.note
    if (!has) e(n, `${s.title}: no content`)
    if (i === 4 && !(s.groups || []).some((x) => x.label === 'Do') || i === 4 && !(s.groups || []).some((x) => x.label === "Don't")) e(n, 'Best practices needs Do and Don\'t groups')
    if (i === 6) {
      if (!s.table || s.table.rows.length < 3) e(n, 'Accessibility needs a table of >=3 rows')
      else s.table.rows.forEach((r) => { if (!/\d\.\d+\.\d+|\d\.\d+/.test(r[1] || '')) e(n, `Accessibility row "${r[0]}" lacks a WCAG number`) })
    }
    if (i === 2) {
      const a = s.anatomy
      if (!a || a.parts.length < 3) e(n, 'Anatomy needs >=3 parts')
      else {
        if (a.story) { let src = ''; try { src = readFileSync(join(root, 'src/components', n, n + '.stories.tsx'), 'utf8') } catch {} ; if (!new RegExp('export const ' + a.story + '\\b').test(src)) e(n, `anatomy story "${a.story}" is not exported by ${n}.stories.tsx`) }
        if (a.diagram !== 'live' && a.diagram !== 'none' && n !== 'Button') e(n, 'Anatomy diagram must be live or none')
        if (a.diagram === 'live' && a.parts.some((p) => p.selector == null)) e(n, 'live anatomy parts need selectors')
      }
    }
    if (i === 7) for (const b of s.bullets || []) { const nm = b.split(':')[0].replace(/\s*\(.*\)/, '').trim().replace(/ /g, ''); if (!comps.includes(nm) && !/^(Link|Text)/.test(nm)) e(n, `Related component "${b.split(':')[0]}" is not a library component name`) }
  })
  const all = JSON.stringify(g)
  if (/!/.test(all.replace(/!==|!=/g, ''))) e(n, 'contains "!"')
  if (/\bsuccessfully\b|\bsimply\b|\bjust\b|\bplease\b/i.test(all)) e(n, 'contains filler word (successfully/simply/just/please)')
  if (/\bgenuinely\b|\bhonestly\b|\bstraightforward\b/i.test(all)) e(n, 'banned word')
}
errs.forEach((x) => console.error('✘ ' + x))
console.log(`Guidelines check: ${names.length - new Set(errs.map((x) => x.split(':')[0])).size}/${names.length} components clean, ${errs.length} issues`)
process.exit(errs.length ? 1 : 0)
