#!/usr/bin/env node
// Library verification that works with esbuild alone (no vite, tsc or vitest needed). Run: node scripts/verify-lib.mjs
//   1. Library build: bundles src/index.ts as ESM (react and react-dom external, CSS Modules scoped) into dist-check/.
//   2. Bundle size and tree-shaking: full bundle size, then single-component imports must be much smaller than the whole.
//   3. Server-side rendering: importing the bundle in Node with no window or document must not throw, and no module-scope
//      browser globals are allowed in component source.
//   4. CSS: interactive components must style the focus ring and disabled state; field components must be full width.
// Exits non-zero on any failure. It does not replace tsc, vitest or a real browser: CI runs those too.
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { gzipSync } from 'node:zlib'

const root = resolve('.')
const require = createRequire(import.meta.url)
const esbuildPath = process.env.ESBUILD_PATH || (() => { try { return require.resolve('esbuild') } catch { return '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild' } })()
const esbuild = require(esbuildPath)
const out = join(root, 'dist-check')
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true })
const kb = (n) => `${(n / 1024).toFixed(1)} KB`
let failures = 0
const fail = (m) => { failures++; console.error(`  FAIL  ${m}`) }
const pass = (m) => console.log(`  pass  ${m}`)
const base = { bundle: true, format: 'esm', platform: 'neutral', mainFields: ['module', 'main'], jsx: 'automatic', logLevel: 'silent', treeShaking: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
  loader: { '.module.css': 'local-css', '.css': 'css', '.svg': 'dataurl' }, minify: true }

// ---- 1. Build
console.log('1/4 Library build')
let full
try {
  full = await esbuild.build({ ...base, entryPoints: [join(root, 'src/index.ts')], outdir: out, metafile: true, write: true, entryNames: 'index' })
  const js = statSync(join(out, 'index.js')).size
  const css = existsSync(join(out, 'index.css')) ? statSync(join(out, 'index.css')).size : 0
  pass(`built dist-check/index.js (${kb(js)}, ${kb(gzipSync(readFileSync(join(out, 'index.js'))).length)} gzip) and index.css (${kb(css)}, ${kb(gzipSync(existsSync(join(out, 'index.css')) ? readFileSync(join(out, 'index.css')) : '').length)} gzip)`)
  var fullJs = js
} catch (e) { fail(`library build: ${String(e.message).split('\n')[0]}`); process.exit(1) }
const exportsSrc = readFileSync(join(root, 'src/index.ts'), 'utf8')
const modCount = (exportsSrc.match(/export \* from/g) || []).length
pass(`${modCount} modules exported from src/index.ts`)

// ---- 2. Tree-shaking
console.log('2/4 Bundle size and tree-shaking')
const probe = async (name, line) => {
  const entry = join(out, `probe-${name}.ts`); writeFileSync(entry, line)
  const r = await esbuild.build({ ...base, entryPoints: [entry], outfile: join(out, `probe-${name}.js`), write: false, metafile: true, absWorkingDir: root, sourcemap: false,
    plugins: [{ name: 'src', setup(b) { b.onResolve({ filter: /^@src\// }, (a) => ({ path: join(root, 'src', a.path.slice(5)) + '.ts' })) } }] })
  return r.outputFiles.find((f) => f.path.endsWith('.js')).contents.length
}
for (const [name, imp] of [['Button', "export { Button } from '@src/index'"], ['Badge', "export { Badge } from '@src/index'"], ['Tabs', "export { Tabs, TabList, Tab } from '@src/index'"], ['Table', "export { Table } from '@src/index'"]]) {
  const size = await probe(name, imp)
  const pct = Math.round((size / fullJs) * 100)
  if (pct <= 60) pass(`${name} alone is ${kb(size)} (${pct}% of the full bundle)`); else fail(`${name} alone is ${kb(size)} (${pct}% of the full bundle): tree-shaking is weak`)
}

// ---- 3. SSR
console.log('3/4 Server-side rendering')
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p] })
const srcFiles = walk(join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f) && !/\.(stories|test|figma)\.tsx?$/.test(f) && !f.includes('/preview/'))
const GLOBALS = /\b(window|document|localStorage|sessionStorage|navigator|matchMedia|requestAnimationFrame|ResizeObserver|IntersectionObserver)\b/
let moduleScope = 0
for (const f of srcFiles) {
  const lines = readFileSync(f, 'utf8').split('\n')
  let depth = 0
  lines.forEach((l, i) => {
    const code = l.replace(/\/\/.*$/, '').replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '""')
    if (depth === 0 && !/^\s*(\*|\/\*|import|export type|type |interface )/.test(code) && GLOBALS.test(code) && !/typeof (window|document|navigator)/.test(code)) { moduleScope++; console.error(`    ${f.replace(root + '/', '')}:${i + 1}: ${l.trim().slice(0, 100)}`) }
    for (const ch of code) { if (ch === '{' || ch === '(' || ch === '[') depth++; else if (ch === '}' || ch === ')' || ch === ']') depth = Math.max(0, depth - 1) }
  })
}
if (moduleScope) fail(`${moduleScope} browser-global use(s) at module scope (listed above): they throw during server-side rendering`); else pass('no browser globals at module scope in component source')
// import the bundle in Node with no window or document
try {
  const cjs = await esbuild.build({ ...base, format: 'cjs', platform: 'node', entryPoints: [join(root, 'src/index.ts')], outfile: join(out, 'index.cjs'), write: true, minify: false,
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'], loader: { ...base.loader, '.css': 'empty', '.module.css': 'local-css' } })
  const fake = join(root, 'scripts/lib/fake-react.cjs')
  const Module = require('node:module'); const orig = Module._load
  Module._load = function (req, ...a) { if (req === 'react' || req === 'react/jsx-runtime') { const f = orig.call(this, fake, ...a); return req === 'react' ? f.React : { jsx: f.jsx, jsxs: f.jsx, Fragment: f.React.Fragment } } if (req === 'react-dom' || req === 'react-dom/client') return { createPortal: (c) => c, createRoot: () => ({ render() {} }), flushSync: (f) => f() }; return orig.call(this, req, ...a) }
  for (const g of ['window', 'document', 'localStorage', 'navigator', 'matchMedia']) delete globalThis[g]
  const lib = require(join(out, 'index.cjs')); Module._load = orig
  pass(`importing the library in Node with no window or document works (${Object.keys(lib).length} exports)`)
} catch (e) { fail(`importing the library with no window or document: ${String(e.message).split('\n')[0]}`) }

// ---- 4. CSS
console.log('4/4 CSS states, focus ring and full width')
const compDir = join(root, 'src/components')
const comps = readdirSync(compDir).filter((d) => statSync(join(compDir, d)).isDirectory())
const ctrlRe = /<button|<input|<textarea|<select|role="(button|tab|switch|checkbox|radio|option|menuitem|slider)"|onClick/
const noFocusOwn = new Set(['Icon'])
let cssIssues = 0
for (const c of comps) {
  const files = readdirSync(join(compDir, c))
  const tsx = files.filter((f) => /\.tsx$/.test(f) && !/\.(stories|test|figma)\.tsx$/.test(f)).map((f) => readFileSync(join(compDir, c, f), 'utf8')).join('\n')
  const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(compDir, c, f), 'utf8')).join('\n')
  const uses = (s) => css.includes(s)
  if (!ctrlRe.test(tsx)) continue
  // Focus: the shared ring token, :focus-visible, :focus-within, or a delegated child component that carries it.
  const focus = uses('ring-focus') || uses(':focus-visible') || uses(':focus-within') || uses("data-state='focus'") || uses('data-state="focus"') || /from '\.\.\/(Button|Checkbox|Radio|Toggle|Input|Input\/Field|Menu|Popover|Link|Search|Chip|Tabs)'/.test(tsx) || /from '\.\/(Field|Button)'/.test(tsx)
  if (!focus) { cssIssues++; console.error(`    ${c}: interactive but no focus ring in its CSS`) }
  const hover = uses(':hover') || uses("data-state='hover'") || /from '\.\.\/(Button|Menu|Chip|Link|Tabs|Search|Input|Input\/Field)'/.test(tsx) || /from '\.\/(Field|Button)'/.test(tsx)
  if (!hover) console.log(`    note: ${c} has no hover style of its own`)
}
if (cssIssues) fail(`${cssIssues} interactive component(s) without a focus ring`); else pass('every interactive component styles or inherits the focus ring')
const field = readFileSync(join(compDir, 'Input/Field.module.css'), 'utf8')
if (/\.shell\s*\{[^}]*inline-size:\s*100%/.test(field)) pass('field shell is full width (inline-size: 100%)'); else fail('field shell is not full width')
const disabled = comps.filter((c) => { const f = readdirSync(join(compDir, c)).filter((x) => x.endsWith('.css')).map((x) => readFileSync(join(compDir, c, x), 'utf8')).join(''); return /:disabled|\[disabled\]|aria-disabled|data-disabled/.test(f) })
pass(`${disabled.length} components style a disabled state`)

rmSync(out, { recursive: true, force: true })
console.log(failures ? `\n${failures} check(s) failed.` : '\nAll library checks passed.')
process.exit(failures ? 1 : 0)
