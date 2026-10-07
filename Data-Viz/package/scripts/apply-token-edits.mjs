#!/usr/bin/env node
// Apply a token-edits JSON exported from the preview ("Copy edits") to the source token files.
// Usage: node scripts/apply-token-edits.mjs edits.json [--dry]
// Needs dist/tokens.json (run build:tokens first) to find each token's source file. Appends to tokens/CHANGELOG.md.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
const root = resolve('.')
const file = process.argv[2]
const dry = process.argv.includes('--dry')
if (!file) { console.error('Usage: apply-token-edits.mjs edits.json [--dry]'); process.exit(1) }
const edits = JSON.parse(readFileSync(resolve(file), 'utf8'))
const tokens = JSON.parse(readFileSync(join(root, 'dist/tokens.json'), 'utf8'))
const leaves = []
const walk = (n, p) => { if (n && typeof n === 'object' && '$value' in n) { leaves.push([p.join('.'), n]); return } for (const [k, v] of Object.entries(n || {})) if (!k.startsWith('$')) walk(v, [...p, k]) }
walk(edits, [])
const byFile = {}
for (const [name, leaf] of leaves) {
  const t = tokens[name]
  if (!t) { console.error(`skip ${name}: not a known token`); continue }
  ;(byFile[t.file] = byFile[t.file] || []).push([name, leaf.$value])
}
const log = []
for (const [f, list] of Object.entries(byFile)) {
  const path = join(root, f)
  const json = JSON.parse(readFileSync(path, 'utf8'))
  for (const [name, value] of list) {
    let n = json
    for (const k of name.split('.')) n = n?.[k]
    if (!n || !('$value' in n)) { console.error(`skip ${name}: path not found in ${f}`); continue }
    log.push(`- ${name}: ${JSON.stringify(n.$value)} -> ${JSON.stringify(value)} (${f})`)
    n.$value = value
  }
  if (!dry) writeFileSync(path, JSON.stringify(json, null, 2) + '\n')
}
console.log(log.join('\n') || 'No changes')
if (!dry && log.length) appendFileSync(join(root, 'tokens/CHANGELOG.md'), `\n## Preview edits\n${log.join('\n')}\n`)
console.log(dry ? '(dry run, nothing written)' : 'Applied. Now run: npm run build:tokens && npm run preview')
