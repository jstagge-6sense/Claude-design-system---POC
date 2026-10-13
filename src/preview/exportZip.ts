import { DATA } from './data'
import { exportPatch, getOverrides } from './overrides'

/** One row per edited token: component / token / old / new. */
export function editRows() {
  return Object.entries(getOverrides()).map(([name, o]) => {
    const t = DATA.tokens[name]
    const component = t?.layer === 'component' ? (name.split('.')[1] ?? '') : `(${t?.layer ?? 'unknown'} token)`
    const old = t?.aliases?.length === 1 && t.css?.startsWith('var(') ? `{${t.aliases[0]}}` : String(t?.value ?? '')
    const next = o.mode === 'alias' ? `{${o.value}}` : o.value
    return { component, token: name, old, next }
  }).sort((a, b) => a.component.localeCompare(b.component) || a.token.localeCompare(b.token, undefined, { numeric: true }))
}

const csv = (v: string) => `"${v.replace(/"/g, '""')}"`
export function editsCsv() {
  const rows = editRows()
  return '\uFEFF' + ['Component,Token,Old,New', ...rows.map((r) => [r.component, r.token, r.old, r.next].map(csv).join(','))].join('\r\n') + '\r\n'
}

export function claudePrompt(count: number) {
  return `You are updating design tokens in the 6DS package (folder: package/, or the repo folder 6ds-package).

I edited ${count} token${count === 1 ? '' : 's'} in the design-system preview. Two files are attached next to this prompt:
- token-edits.json: the exact changes in DTCG format (token path -> new $value; "Was:" is in $description).
- token-edits.csv: the same changes as a table (Component, Token, Old, New).

Do this, in order:
1. Read token-edits.csv and check each Old value against the current source token files in tokens/. If one differs, stop and tell me before changing it.
2. Run: node scripts/apply-token-edits.mjs token-edits.json --dry  and show me the result.
3. After I confirm, run it without --dry. It updates the source token files and appends to tokens/CHANGELOG.md.
4. Run: npm run build:tokens && npm run lint:tokens && npm run build:lean && npm run preview. Fix any lint failures; do not hard-code values that should be tokens.
5. Dark mode: if an edited token has an override in tokens/modes/dark.json, tell me and ask whether the dark value should change too. Check contrast stays AA.
6. If an edit changes a semantic or primitive token, list which components it affects.
7. Summarise what changed. Do not push to GitHub or write to Figma unless I ask.

Rules: use exact token names from the files, never invented ones. If a token edit conflicts with docs/source (see visual-design-decisions.md), flag it and ask which is right.
`
}

// Minimal ZIP writer (stored, no compression) so the single-file preview works offline with no libraries.
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })()
const crc32 = (b: Uint8Array) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
export function makeZip(files: { name: string; text: string }[]): Blob {
  const enc = new TextEncoder(); const parts: Uint8Array[] = []; const central: Uint8Array[] = []; let offset = 0
  const u16 = (v: number) => [v & 255, (v >>> 8) & 255]; const u32 = (v: number) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]
  for (const f of files) {
    const name = enc.encode(f.name); const data = enc.encode(f.text); const crc = crc32(data)
    const head = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)])
    parts.push(head, name, data)
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name)
    offset += head.length + name.length + data.length
  }
  const cdSize = central.reduce((n, p) => n + p.length, 0)
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(offset), ...u16(0)])
  return new Blob([...parts, ...central, end] as BlobPart[], { type: 'application/zip' })
}

export function downloadEditsZip() {
  const rows = editRows()
  const stamp = new Date().toISOString().slice(0, 10)
  const blob = makeZip([
    { name: 'token-edits.json', text: JSON.stringify(exportPatch(), null, 2) + '\n' },
    { name: 'token-edits.csv', text: editsCsv() },
    { name: 'claude-prompt.md', text: claudePrompt(rows.length) },
  ])
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `token-edits-${stamp}.zip`; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}
