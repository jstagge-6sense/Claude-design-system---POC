// Helpers for authoring component token files (tokens/component/<name>.json).
// Usage in a throwaway generator script:
//   import { tok, rgba, gap, setPath, writeTokens } from './tok.mjs'
//   const tree = {}
//   setPath(tree, 'component.button.primary.container.fill.default', tok('{core.color.action.primary.default}', 'color'))
//   writeTokens('tokens/component/button.json', tree)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/** Build a DTCG token. `gapId` flags an approved GAP placeholder (allows a primitive alias). */
export const tok = (value, type, description, gapId) => {
  const t = { $type: type, $value: value }
  if (description) t.$description = description
  if (gapId) t.$extensions = { gap: gapId }
  return t
}
/** rgba composition: color token with an opacity primitive, e.g. rgba('core.color.border.subtle','core.effect.opacity.100') */
export const rgba = (color, opacity) => `rgba({${color}},{${opacity}})`
/** Alias string. */
export const a = (name) => `{${name}}`
export const gap = (id) => id
export const setPath = (tree, dotted, leaf) => {
  const parts = dotted.split('.')
  let n = tree
  for (const p of parts.slice(0, -1)) n = n[p] = n[p] || {}
  const last = parts[parts.length - 1]
  if (n[last]) throw new Error(`duplicate token path ${dotted}`)
  n[last] = leaf
}
export const writeTokens = (file, tree) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(tree, null, 2) + '\n')
}
