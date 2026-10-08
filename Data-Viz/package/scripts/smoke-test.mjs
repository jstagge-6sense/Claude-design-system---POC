#!/usr/bin/env node
// Render smoke test: runs every story's render function through a minimal fake React (see scripts/lib/fake-react.cjs).
// Catches ReferenceErrors, missing exports, bad prop access and invalid children. Does NOT replace a browser test.
// Usage: node scripts/smoke-test.mjs [Name ...]
import { readdirSync, writeFileSync, statSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
const root = resolve('.')
const ESB = process.env.ESBUILD_PATH || '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild'
const esbuild = createRequire(import.meta.url)(ESB)
const only = process.argv.slice(2)
const compDir = join(root, 'src/components')
const names = readdirSync(compDir).filter((d) => !d.startsWith('.') && statSync(join(compDir, d)).isDirectory() && (!only.length || only.includes(d)))
const stories = names.flatMap((d) => readdirSync(join(compDir, d)).filter((f) => f.endsWith('.stories.tsx')).map((f) => ({ d, f })))
const tmp = '/tmp/ds-smoke'; mkdirSync(tmp, { recursive: true })
const entry = join(tmp, 'entry.ts')
writeFileSync(entry, stories.map((s, i) => `import * as s${i} from '${join(compDir, s.d, s.f.replace(/\.tsx$/, ''))}'`).join('\n') + `\nexport { expand, stats } from ${JSON.stringify(join(root,'scripts/lib/fake-react.cjs'))}\nexport const ALL = [${stories.map((s, i) => `['${s.d}', s${i}]`).join(',')}]\n`)
const fake = join(root, 'scripts/lib/fake-react.cjs')
const plugin = { name: 'fake', setup(b) {
  b.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (a) => ({ path: a.path, namespace: 'fk' }))
  b.onLoad({ filter: /.*/, namespace: 'fk' }, (a) => ({ loader: 'js', resolveDir: root, contents:
    a.path === 'react' ? `module.exports = require(${JSON.stringify(fake)}).React`
    : a.path.startsWith('react/jsx') ? `const f=require(${JSON.stringify(fake)}); export const jsx=f.jsx, jsxs=f.jsx, jsxDEV=f.jsx, Fragment=f.React.Fragment`
    : `const f=require(${JSON.stringify(fake)}); module.exports = { createPortal: f.createPortal, createRoot: () => ({ render() {} }), flushSync: (fn) => fn() }` }))
  b.onResolve({ filter: /^@(storybook|figma)\// }, (a) => ({ path: a.path, namespace: 'em' }))
  b.onLoad({ filter: /.*/, namespace: 'em' }, () => ({ contents: 'module.exports = {}', loader: 'js' }))
} }
const out = join(tmp, 'bundle.cjs')
await esbuild.build({ entryPoints: [entry], bundle: true, outfile: out, platform: 'node', format: 'cjs', jsx: 'automatic', loader: { '.module.css': 'local-css', '.css': 'css' }, plugins: [plugin], logLevel: 'error', define: { 'process.env.NODE_ENV': '"development"' } })
// minimal browser globals so module-level or render-time checks do not crash
const noop = () => {}
globalThis.window = globalThis
globalThis.document = { body: { style: {}, appendChild: noop }, documentElement: { style: {}, dir: 'ltr' }, addEventListener: noop, removeEventListener: noop, activeElement: null, createElement: () => ({ style: {}, setAttribute: noop }), getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] }
globalThis.matchMedia = () => ({ matches: false, addEventListener: noop, removeEventListener: noop })
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop }
globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} }
globalThis.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} }
globalThis.requestAnimationFrame = (f) => 0
const { ALL, expand, stats } = createRequire(import.meta.url)(out)
let bad = 0, ok = 0
for (const [folder, mod] of ALL) {
  const meta = mod.default || {}
  for (const [k, story] of Object.entries(mod)) {
    if (k === 'default' || k.startsWith('__') || !story) continue
    const s = typeof story === 'function' ? { render: story } : story
    try {
      const args = { ...(meta.args || {}), ...(s.args || {}) }
      const render = s.render || meta.render
      const before = stats.elements
      expand(render ? render(args, {}) : { $$: 1, type: meta.component, props: args })
      if (stats.elements === before) throw new Error('story rendered nothing')
      ok++
    } catch (e) { bad++; console.error(`✘ ${folder}/${k}: ${e.message}\n    ${String(e.stack).split('\n').slice(1, 3).join('\n    ')}`) }
  }
}
console.log(`Smoke test: ${ok} stories rendered, ${bad} failed (${stats.elements} elements)`)
process.exit(bad ? 1 : 0)
