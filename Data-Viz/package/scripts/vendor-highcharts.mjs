#!/usr/bin/env node
// Copies Highcharts into src/charts/samples/vendor/ so samples/index.html works fully offline (no CDN needed).
// Uses node_modules/highcharts when installed; otherwise downloads from the jsDelivr CDN (Node 18+ fetch).
// Usage: node scripts/vendor-highcharts.mjs [version]     e.g. node scripts/vendor-highcharts.mjs 12
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'src/charts/samples/vendor')
const files = ['highcharts.js', 'modules/accessibility.js', 'modules/funnel.js', 'modules/pareto.js', 'modules/pattern-fill.js']
const version = process.argv[2] || '12'
mkdirSync(join(out, 'modules'), { recursive: true })

const local = join(root, 'node_modules/highcharts')
for (const f of files) {
  const dest = join(out, f)
  if (existsSync(join(local, f))) {
    copyFileSync(join(local, f), dest)
    console.log('copied', f, '(node_modules)')
  } else {
    const url = `https://cdn.jsdelivr.net/npm/highcharts@${version}/${f}`
    const res = await fetch(url)
    if (!res.ok) { console.error(`✘ ${url}: HTTP ${res.status}`); process.exit(1) }
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
    console.log('downloaded', f)
  }
}
console.log('\nDone. Reload src/charts/samples/index.html. Highcharts is licensed separately: check your license before redistributing the vendor folder.')
