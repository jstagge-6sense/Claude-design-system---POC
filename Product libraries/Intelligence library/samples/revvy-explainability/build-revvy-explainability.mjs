// Builds revvy-explainability.html from the 6sense design system repo.
// Reads (never edits) the parent: dist token CSS, foundation styles, component CSS modules and the icon set.
// Usage: node build-revvy-explainability.mjs [path-to-design-system-repo] [out-file]
// Defaults: the repo root four folders up (this library's parent), output next to this script.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(process.argv[2] ?? join(here, '../../../..'))
const out = resolve(process.argv[3] ?? join(here, 'revvy-explainability.html'))
const need = (p) => {
  if (existsSync(p)) return readFileSync(p, 'utf8')
  // The working tree can lose a file the design system still needs (for example a CSS module removed by a commit).
  // Read-only fallback: take the last committed version from git history and say so. Nothing in the parent is changed.
  try {
    const rel = p.slice(repo.length + 1)
    const git = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    const gone = git('log', '-1', '--format=%H', '--diff-filter=D', '--', rel)
    if (gone) {
      const css = git('show', `${gone}^:${rel}`)
      console.warn(`WARNING: ${rel} is missing from the parent. Using its last committed version (before ${gone.slice(0, 7)}).`)
      return css
    }
  } catch { /* fall through */ }
  console.error(`Missing: ${p}`); process.exit(1)
}
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

// 1. Tokens (primitive -> semantic -> component), in dependency order, plus foundation constants, reset and focus.
const tokens = ['primitive', 'semantic', 'component'].map((n) => need(join(repo, 'dist', `${n}.css`))).join('\n')
const foundation = ['foundation', 'reset', 'focus'].map((n) => strip(need(join(repo, 'src/styles', `${n}.css`)))).join('\n')

// 2. Component CSS modules. Class names are scoped as <File>_<class>, the way CSS Modules would scope them.
const modules = [
  ['Card', 'Card/Card'], ['Badge', 'Badge/Badge'], ['Button', 'Button/Button'], ['Chip', 'Chip/Chip'], ['Link', 'Link/Link'],
  ['Field', 'Input/Field'], ['TextArea', 'TextArea/TextArea'], ['Search', 'Search/Search'],
  ['Menu', 'Menu/Menu'], ['MenuList', 'Menu/MenuList'], ['Spinner', 'Spinner/Spinner'],
  ['Checkbox', 'Checkbox/Checkbox'], ['Popover', 'Popover/Popover'],
]
const scoped = modules.map(([name, path]) => {
  const css = strip(need(join(repo, 'src/components', `${path}.module.css`)))
  return `/* ${name} */\n` + css.replace(/\.([A-Za-z_][\w-]*)/g, (_, c) => `.${name}_${c}`)
}).join('\n')

// 3. Icons: the parent's ICON_PATHS object, verbatim.
const iconsSrc = need(join(repo, 'src/icons/paths.ts'))
const m = iconsSrc.match(/export const ICON_PATHS = (\{[\s\S]*?\n\})/)
if (!m) { console.error('Could not read ICON_PATHS'); process.exit(1) }
const icons = `const ICON_PATHS = ${m[1]};`

const tpl = need(join(here, 'revvy-explainability.template.html'))
const html = tpl
  .replace('/*__DS_CSS__*/', () => `${tokens}\n${foundation}\n${scoped}`)
  .replace('/*__ICON_PATHS__*/', () => icons)
writeFileSync(out, html)

// 4. Same guard the Intelligence library runs: page glue may only use parent tokens and local --_ variables, no raw colors.
const glue = strip((tpl.match(/<style>\s*\/\* ==== Page glue[\s\S]*?<\/style>/) ?? [''])[0])
const defined = new Set([...(tokens + foundation).matchAll(/(--[\w-]+)\s*:/g)].map((x) => x[1]))
const own = new Set([...glue.matchAll(/(--_[\w-]+)\s*:/g)].map((x) => x[1]))
let bad = 0
for (const x of glue.matchAll(/var\((--[\w-]+)/g)) if (!defined.has(x[1]) && !own.has(x[1])) { console.error(`Not a parent token: ${x[1]}`); bad++ }
for (const x of glue.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)) { console.error(`Raw color in page CSS: ${x[0]}`); bad++ }
console.log(bad ? `${bad} problem(s).` : 'Page CSS uses only parent tokens.', `Wrote ${out}`)
process.exit(bad ? 1 : 0)
