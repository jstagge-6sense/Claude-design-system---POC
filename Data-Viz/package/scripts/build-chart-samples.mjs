#!/usr/bin/env node
// Bundles src/charts/samples/samples.entry.ts into src/charts/samples/dist/dba-charts-samples.js (IIFE, global DBAChartSamples).
// The page src/charts/samples/index.html loads it with Highcharts from the Highcharts CDN and renders all sample charts.
// Usage: node scripts/build-chart-samples.mjs
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
let esbuild
try { esbuild = require('esbuild') } catch { esbuild = require(process.env.ESBUILD_PATH || '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild') }

// The entry only uses the pure option builders. The React components in the same files are tree-shaken to
// harmless stubs, so React is not needed to build the sample page.
const stubDir = join(root, 'scripts/.chart-sample-stubs')
mkdirSync(stubDir, { recursive: true })
writeFileSync(join(stubDir, 'react.js'), 'export const forwardRef = (f) => f\nexport const useMemo = (f) => f()\nexport const useEffect = () => {}\nexport const useRef = () => ({ current: null })\nexport default {}\n')
writeFileSync(join(stubDir, 'jsx-runtime.js'), 'export const jsx = () => null\nexport const jsxs = () => null\n')

const outfile = join(root, 'src/charts/samples/dist/dba-charts-samples.js')
await esbuild.build({
  entryPoints: [join(root, 'src/charts/samples/samples.entry.ts')],
  outfile,
  bundle: true,
  format: 'iife',
  globalName: 'DBAChartSamples',
  jsx: 'automatic',
  target: 'es2019',
  loader: { '.module.css': 'local-css' },
  alias: { react: join(stubDir, 'react.js'), 'react/jsx-runtime': join(stubDir, 'jsx-runtime.js') },
  logLevel: 'info',
})
// Token data for the editor, as a classic script so it works from file:// (fetch would not). Needs `npm run build:tokens` first.
const tokensJson = join(root, 'dist/tokens.json')
if (!existsSync(tokensJson)) throw new Error('dist/tokens.json is missing. Run: npm run build:tokens')
const tokens = JSON.parse(readFileSync(tokensJson, 'utf8'))
const slim = {}
for (const [n, t] of Object.entries(tokens)) slim[n] = { layer: t.layer, kind: t.kind, type: t.type, value: t.value, css: t.css, aliases: t.aliases, description: t.description, gap: t.gap, cssVar: t.cssVar }
writeFileSync(join(root, 'src/charts/samples/dist/tokens-data.js'), 'window.__DS_TOKENS__=' + JSON.stringify({ tokens: slim }) + ';\n')
rmSync(outfile.replace(/\.js$/, '.css'), { force: true }) // module CSS is not needed: index.html carries the SVG hooks
console.log('Wrote', outfile.replace(root + '/', ''), '\nOpen src/charts/samples/index.html in a browser (needs internet for Highcharts from code.highcharts.com).')
