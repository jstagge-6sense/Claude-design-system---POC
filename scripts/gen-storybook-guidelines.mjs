#!/usr/bin/env node
// Adds a "Guidelines" story to the END of each component's own stories file (src/components/<Name>/<Name>.stories.tsx),
// inside a generated block between BEGIN/END markers. Safe to re-run. The text lives only in src/preview/guidelines*.
// Storybook sorts the Guidelines story first (see .storybook/preview.ts storySort).
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
const root = resolve('.')
const req = createRequire(import.meta.url)
let esbuild
try { esbuild = req(process.env.ESBUILD_PATH || 'esbuild') } catch { esbuild = req('/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild') }
await esbuild.build({ entryPoints: [join(root, 'src/preview/guidelines.ts')], bundle: true, outfile: '/tmp/ds-guidelines-sb.cjs', platform: 'node', format: 'cjs', logLevel: 'error' })
const { GUIDELINES } = req('/tmp/ds-guidelines-sb.cjs')
// Remove the old stand-alone pages.
rmSync(join(root, 'src/storybook/guidelines'), { recursive: true, force: true })
const BEGIN = '// BEGIN generated guidelines (scripts/gen-storybook-guidelines.mjs)'
const END = '// END generated guidelines'
let n = 0
for (const name of Object.keys(GUIDELINES).sort()) {
  const f = join(root, 'src/components', name, `${name}.stories.tsx`)
  if (!existsSync(f)) continue
  let s = readFileSync(f, 'utf8')
  const i = s.indexOf(BEGIN)
  if (i >= 0) s = s.slice(0, i).trimEnd() + '\n'
  s += `\n${BEGIN}
import { GuidelinesStory } from '../../storybook/GuidelinesStory'
import * as self from './${name}.stories'
export const Guidelines: StoryObj = {
  name: 'Guidelines',
  parameters: { layout: 'padded', controls: { disable: true }, actions: { disable: true } },
  render: () => <GuidelinesStory folder="${name}" mod={self as unknown as Record<string, unknown>} />,
}
${END}
`
  writeFileSync(f, s)
  n++
}
console.log(`Added a Guidelines story to ${n} component story files`)
