#!/usr/bin/env node
// First-run setup: shows the repository and Figma targets and asks whether to update them.
// Usage: node scripts/first-run.mjs        (interactive)
//        node scripts/first-run.mjs --keep (accept saved targets, no prompts)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const kit = join(dirname(fileURLToPath(import.meta.url)), '..')
const cfgPath = join(kit, 'config/targets.json')
const statePath = join(kit, 'package/design-system-state.json')
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
const keep = process.argv.includes('--keep')

if (cfg.firstRunDone && !process.argv.includes('--again')) {
  console.log('First run already completed. Targets:\n', JSON.stringify({ github: cfg.github, figma: cfg.figma }, null, 2))
  console.log('Run with --again to change them.')
  process.exit(0)
}

console.log('Current targets\n  GitHub repo :', cfg.github.repo, `(folder: ${cfg.github.subfolder})`, '\n  Figma file  :', cfg.figma.url)
const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = async (q, d) => ((await rl.question(`${q} [${d}] `)).trim() || d)

if (!keep) {
  const upd = (await ask('Update these targets? (y/N)', 'N')).toLowerCase().startsWith('y')
  if (upd) {
    cfg.github.repo = await ask('GitHub repo URL', cfg.github.repo)
    cfg.github.subfolder = await ask('Folder in repo', cfg.github.subfolder)
    const url = await ask('Figma file URL', cfg.figma.url)
    const m = url.match(/figma\.com\/(?:design|file)\/([A-Za-z0-9]+)/)
    if (m) { cfg.figma.url = url; cfg.figma.fileKey = m[1] } else console.log('Could not read a file key from that URL; keeping the old Figma target.')
    cfg.figma.fileName = await ask('Figma file name', cfg.figma.fileName)
  }
}
rl.close()
cfg.firstRunDone = true
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n')

// Keep Code Connect placeholders in sync with the chosen Figma file.
if (existsSync(statePath)) {
  const st = JSON.parse(readFileSync(statePath, 'utf8'))
  st.figma = { ...(st.figma || {}), fileKey: cfg.figma.fileKey }
  writeFileSync(statePath, JSON.stringify(st, null, 2) + '\n')
}
console.log('Saved. Targets recorded in config/targets.json; Figma file key written to package/design-system-state.json.')
