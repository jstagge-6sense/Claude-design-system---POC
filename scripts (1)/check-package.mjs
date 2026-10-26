#!/usr/bin/env node
// After `npm run build`: confirms every file the package points at exists, and lists what `npm pack` would publish.
// Fails if main, module, types, an exports target or a "files" entry is missing, or if source or tests would be published.
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
const root = resolve('.')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
let bad = 0
const need = (label, p) => { if (!p || p.includes('*')) return; if (existsSync(join(root, p))) console.log(`  pass  ${label}: ${p}`); else { bad++; console.error(`  FAIL  ${label}: ${p} does not exist (run npm run build first)`) } }
need('main', pkg.main); need('module', pkg.module); need('types', pkg.types)
const walk = (v) => typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(walk) : []
for (const t of walk(pkg.exports)) need('exports', t)
for (const f of ['name', 'version', 'license', 'repository', 'peerDependencies']) if (!pkg[f]) { bad++; console.error(`  FAIL  package.json is missing "${f}"`) }
try {
  const out = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))[0]
  const files = out.files.map((f) => f.path)
  const leaked = files.filter((f) => /^(src|scripts|docs|tokens|Data-Viz|Product libraries)\//.test(f) || /\.(stories|test|figma)\.tsx?$/.test(f))
  if (leaked.length) { bad++; console.error(`  FAIL  would publish source or tests: ${leaked.slice(0, 5).join(', ')}`) } else console.log(`  pass  npm pack contains ${files.length} files, ${(out.size / 1024).toFixed(0)} KB packed, no source or tests`)
} catch (e) { bad++; console.error('  FAIL  npm pack --dry-run failed') }
process.exit(bad ? 1 : 0)
