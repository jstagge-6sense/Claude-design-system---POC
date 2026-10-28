import { DATA } from './data'
import { clearOverride, getOverrides, useOverrides } from './overrides'

const lowerCamel = (s: string) => s[0].toLowerCase() + s.slice(1)
const humanize = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ')

/** Edited tokens that belong to this component only (first layer). Tokens of other components are never included,
 *  even when that component contains this one (for example a dialog that has a button inside).
 *  When a variant is given and the component has tokens for it, only that variant's tokens and the shared ("all") tokens are kept. */
export function firstLayerEdits(folder: string, variant?: string) {
  const own = `component.${lowerCamel(folder)}.`
  const all = Object.entries(getOverrides()).filter(([name]) => name.startsWith(own))
  if (!variant) return all
  const v = lowerCamel(variant.replace(/\s+/g, ''))
  const variants = new Set(Object.keys(DATA.tokens).filter((n) => n.startsWith(own)).map((n) => n.slice(own.length).split('.')[0]))
  if (!variants.has(v)) return all // the story name is not a token variant: show the component's own edits
  return all.filter(([name]) => { const seg = name.slice(own.length).split('.')[0]; return seg === v || seg === 'all' })
}

/** Button at the top right of a story card. Opens the edits page for this component. */
export function ViewEditsButton({ folder, story }: { folder: string; story: string }) {
  useOverrides()
  const n = firstLayerEdits(folder, story).length
  return <a className="pv-btn pv-viewedits" href={`#/e/${folder}/${encodeURIComponent(story)}`}>View edits{n ? ` (${n})` : ''}</a>
}

const show = (name: string, o: { mode: string; value: string }) => (o.mode === 'alias' ? `{${o.value}}` : o.value)
const oldOf = (name: string) => {
  const t = DATA.tokens[name]
  return t?.aliases?.length === 1 && t.css?.startsWith('var(') ? `{${t.aliases[0]}}` : String(t?.value ?? '')
}

/** Temporary page: not in the menu. Shows only this component's own edited tokens. */
export function EditsPage({ folder, story }: { folder: string; story?: string }) {
  useOverrides()
  const rows = firstLayerEdits(folder, story)
  return (
    <>
      <p><a href={`#/c/${folder}`}>&larr; Back to {humanize(folder)}</a></p>
      <div className="pv-title"><h1>Edits: {humanize(folder)}{story ? ` · ${story}` : ''}</h1><span className="pv-pill">Temporary page</span></div>
      <p className="pv-desc">Only the tokens of {humanize(folder)} itself. Tokens of other components are not shown, even if they contain a {humanize(folder).toLowerCase()}.</p>
      {rows.length ? (
        <table className="pv-table">
          <thead><tr><th scope="col">Token</th><th scope="col">Was</th><th scope="col">Now</th><th scope="col"><span className="pv-sr">Undo</span></th></tr></thead>
          <tbody>
            {rows.map(([name, o]) => (
              <tr key={name}><td><code>{name}</code></td><td>{oldOf(name)}</td><td>{show(name, o)}</td><td><button className="pv-btn" onClick={() => clearOverride(name)}>Undo</button></td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="pv-muted">No edits to {humanize(folder)} yet. Change one of its tokens in the token editor and it will show here.</p>
      )}
    </>
  )
}
