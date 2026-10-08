#!/usr/bin/env node
// Compile-check components with esbuild (no React install needed): TSX syntax, imports, CSS Modules, stories.
// Usage: node scripts/check-components.mjs Button Input   (or no args for all)
import { readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
const root = resolve('.')
const ESB = process.env.ESBUILD_PATH || '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild'
const esbuild = createRequire(import.meta.url)(ESB)
const names = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const all = readdirSync(join(root, 'src/components')).filter((d) => existsSync(join(root, 'src/components', d, 'index.ts')))
const targets = names.length ? names : all
let failed = 0
for (const n of targets) {
  const dir = join(root, 'src/components', n)
  if (!existsSync(dir)) { console.error(`✘ ${n}: folder missing`); failed++; continue }
  const entries = [join(dir, 'index.ts')]
  for (const f of readdirSync(dir)) if (/\.stories\.tsx$/.test(f)) entries.push(join(dir, f))
  try {
    await esbuild.build({
      entryPoints: entries, bundle: true, write: false, outdir: '/tmp/ds-check', format: 'esm', jsx: 'automatic', logLevel: 'silent',
      loader: { '.module.css': 'local-css', '.css': 'css' },
      external: ['react', 'react-dom', 'react/jsx-runtime', '@storybook/react', '@figma/code-connect', 'react-dom/client'],
    })
    // syntax-only check of test + figma files
    for (const f of readdirSync(dir)) if (/\.(test|figma)\.tsx$/.test(f)) {
      await esbuild.transform((await import('node:fs')).readFileSync(join(dir, f), 'utf8'), { loader: 'tsx', jsx: 'automatic' })
    }
    console.log(`✔ ${n}`)
  } catch (e) {
    failed++
    console.error(`✘ ${n}\n${(e.errors || [e]).map((x) => x.text ? `${x.location?.file}:${x.location?.line} ${x.text}` : String(x)).join('\n')}`)
  }
}
if (failed) process.exit(1)
