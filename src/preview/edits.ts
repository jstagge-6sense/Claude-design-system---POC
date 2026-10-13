import { DATA, TOKEN_LIST, type TokenRec } from './data'

const lc = (s: string) => s[0].toLowerCase() + s.slice(1)
import type { Override } from './overrides'

/** First layer of edits for a token card. A component token shows the edits of that component's own tokens only
 *  (component.button.*), never the tokens of another component that contains it, such as a dialog with a button inside.
 *  A semantic or primitive token shows only its own edit, not the tokens that alias it. */
export function firstLayer(t: TokenRec, all: Record<string, Override>): Array<[string, Override]> {
  if (t.layer !== 'component') return t.name in all ? [[t.name, all[t.name]]] : []
  const own = t.name.split('.').slice(0, 2).join('.') + '.'
  return Object.entries(all).filter(([n]) => n.startsWith(own))
}
export const wasOf = (name: string) => { const x = DATA.tokens[name]; return x?.aliases?.length === 1 && x.css?.startsWith('var(') ? `{${x.aliases[0]}}` : String(x?.value ?? '') }
/** The editor filter that goes with a token card: a component's own tokens, or the single token. */
export const scopeOf = (t: TokenRec) => (t.layer === 'component' ? t.name.split('.').slice(0, 2).join('.') + '.' : t.name)

let users: Map<string, string[]> | null = null
/** Components (lower camel names, like "button") that are affected by changing these tokens. A component token affects only
 *  its own component. A semantic or primitive token affects every component whose tokens refer to it, directly or through
 *  other tokens. A component that merely contains an affected component (a dialog with a button) is not included. */
export function affectedComponents(names: string[]): Set<string> {
  if (!users) {
    users = new Map()
    for (const t of TOKEN_LIST) for (const a of t.aliases || []) { const l = users.get(a); if (l) l.push(t.name); else users.set(a, [t.name]) }
  }
  const out = new Set<string>()
  const seen = new Set<string>()
  // A component token affects its own component only (first layer). Semantic and primitive tokens also carry through to
  // components that build on other components' tokens (a pagination that uses the button fill).
  const own = names.filter((n) => n.startsWith('component.'))
  const upper = names.filter((n) => !n.startsWith('component.'))
  for (const n of own) out.add(n.split('.')[1])
  const stack = [...upper]
  while (stack.length) {
    const n = stack.pop() as string
    if (seen.has(n)) continue
    seen.add(n)
    if (n.startsWith('component.')) out.add(n.split('.')[1])
    for (const c of DATA.analytics?.usage.usedBy?.[n] || []) out.add(lc(c)) // components whose styles use this token directly
    for (const u of users.get(n) || []) stack.push(u)
  }
  return out
}
