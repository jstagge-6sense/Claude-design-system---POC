#!/usr/bin/env node
// Codemod: replaces hard-coded colors, spacing, radii and border widths with 6sense design system tokens.
//   node scripts/codemod-tokens.mjs <folder or file> [...]            dry run: lists every change and every value left alone
//   node scripts/codemod-tokens.mjs <folder or file> --write          applies the changes
// Intentional exceptions: put `codemod-ignore` in a comment on the same line (e.g. /* codemod-ignore: 1px hairline offset */) and that line is skipped.
// Flags: --tokens <path to tokens.json>   --json   (machine-readable report)
// Rules: exact matches only, and only semantic tokens (never primitives). A value is replaced when exactly one semantic
// token in the right family matches: colors by property (color -> content, background/fill -> surface or action, border -> border),
// spacing (padding, margin, gap, inset) -> space, border-radius -> radius, border widths -> borderWidth. Anything with several
// candidates or no exact token is reported, never guessed. Works on css, scss, less, and on CSS strings in js, jsx, ts, tsx.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const REM = 16
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0')
/** Canonical form of a color literal: #rrggbb, or rgba(r, g, b, a). Returns null when it is not a plain color literal. */
export function normColor(raw) {
  const s = raw.trim().toLowerCase()
  let m
  if ((m = s.match(/^#([0-9a-f]{3})$/))) return '#' + [...m[1]].map((c) => c + c).join('')
  if ((m = s.match(/^#([0-9a-f]{6})$/))) return '#' + m[1]
  if ((m = s.match(/^#([0-9a-f]{6})([0-9a-f]{2})$/))) { const a = parseInt(m[2], 16) / 255; return a >= 0.995 ? '#' + m[1] : `rgba(${parseInt(m[1].slice(0, 2), 16)}, ${parseInt(m[1].slice(2, 4), 16)}, ${parseInt(m[1].slice(4, 6), 16)}, ${+a.toFixed(2)})` }
  if ((m = s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/))) {
    let a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4])
    return a >= 0.995 ? '#' + hex2(+m[1]) + hex2(+m[2]) + hex2(+m[3]) : `rgba(${+m[1]}, ${+m[2]}, ${+m[3]}, ${+a.toFixed(2)})`
  }
  return null
}
/** Length in px, or null. Zero is never replaced. */
export function toPx(raw) {
  const m = raw.trim().match(/^(-?\d*\.?\d+)(px|rem)$/)
  if (!m) return null
  const v = parseFloat(m[1]) * (m[2] === 'rem' ? REM : 1)
  return v === 0 ? null : +v.toFixed(3)
}

/** Builds lookup tables from dist/tokens.json (semantic layer only). */
export function buildMaps(tokens) {
  const colors = new Map(), lengths = { space: new Map(), radius: new Map(), borderWidth: new Map() }
  const add = (map, key, name, cssVar) => { if (!map.has(key)) map.set(key, []); map.get(key).push({ name, cssVar }) }
  for (const [name, t] of Object.entries(tokens)) {
    if (t.layer !== 'semantic') continue
    const parts = name.split('.')
    if (t.kind === 'color') { const c = normColor(String(t.value)); if (c) add(colors, c, name, t.cssVar) }
    if (t.kind === 'dimension') {
      const px = toPx(String(t.value)); const g = parts[2]
      if (px != null && lengths[g]) add(lengths[g], px, name, t.cssVar)
    }
  }
  return { colors, lengths }
}

const COLOR_PROP = [
  [/^(color|caret-color|text-decoration-color)$/, ['content']],
  [/^(background|background-color)$/, ['surface', 'action']],
  [/^(fill|stroke)$/, ['content', 'action']],
  [/^(border|border-(top|right|bottom|left|block|inline)(-start|-end)?|outline)(-color)?$|^border-color$/, ['border']],
]
const SPACE_PROP = /^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)(-(top|right|bottom|left|block|inline)(-start|-end)?)?$/
const RADIUS_PROP = /^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/
const WIDTH_PROP = /^border(-(top|right|bottom|left|block|inline)(-start|-end)?)?(-width)?$|^outline(-width)?$/

const colorRe = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/g
const lengthRe = /(?<![\w.#-])-?\d*\.?\d+(?:px|rem)\b/g

/** Applies the maps to one declaration value. Returns the new value plus what happened. */
export function convertValue(prop, value, maps) {
  const events = []
  let out = value
  if (/var\(--/.test(value) && !/^[^]*(#[0-9a-fA-F]{3,8}|rgba?\()/.test(value) && !/\d(px|rem)/.test(value)) return { value, events }
  const family = COLOR_PROP.find(([re]) => re.test(prop))
  if (family || /^(background|border|outline)/.test(prop)) {
    out = out.replace(colorRe, (lit) => {
      const key = normColor(lit)
      if (!key) return lit
      const cands = maps.colors.get(key) ?? []
      if (!cands.length) { events.push({ kind: 'none', what: lit }); return lit }
      const groups = family ? family[1] : ['border']
      const inGroup = cands.filter((c) => groups.includes(c.name.split('.')[2]))
      const pick = inGroup.length === 1 ? inGroup[0] : null
      if (!pick) { events.push({ kind: 'ambiguous', what: lit, options: (inGroup.length ? inGroup : cands).map((c) => c.name) }); return lit }
      events.push({ kind: 'replaced', what: lit, token: pick.name }); return `var(${pick.cssVar})`
    })
  }
  const lenFamily = SPACE_PROP.test(prop) ? 'space' : RADIUS_PROP.test(prop) ? 'radius' : null
  if (lenFamily) {
    out = out.replace(lengthRe, (lit) => {
      const px = toPx(lit); if (px == null) return lit
      const cands = maps.lengths[lenFamily].get(px) ?? []
      if (cands.length === 1) { events.push({ kind: 'replaced', what: lit, token: cands[0].name }); return `var(${cands[0].cssVar})` }
      events.push({ kind: cands.length ? 'ambiguous' : 'none', what: lit, options: cands.map((c) => c.name) }); return lit
    })
  } else if (WIDTH_PROP.test(prop) && !/^outline$/.test(prop) || /^(border|outline)-width$/.test(prop)) {
    out = out.replace(lengthRe, (lit) => {
      const px = toPx(lit); if (px == null) return lit
      const cands = maps.lengths.borderWidth.get(px) ?? []
      if (cands.length === 1) { events.push({ kind: 'replaced', what: lit, token: cands[0].name }); return `var(${cands[0].cssVar})` }
      events.push({ kind: cands.length ? 'ambiguous' : 'none', what: lit, options: cands.map((c) => c.name) }); return lit
    })
  }
  return { value: out, events }
}

/** Transforms the text of one file. */
export function transform(source, ext, maps) {
  const events = []
  const lineOf = (idx) => source.slice(0, idx).split('\n').length
  const ignored = (idx) => { const a = source.lastIndexOf('\n', idx) + 1; let b = source.indexOf('\n', idx); if (b < 0) b = source.length; return source.slice(a, b).includes('codemod-ignore') }
  const css = ['.css', '.scss', '.less'].includes(ext)
  const re = css ? /([\w-]+)\s*:\s*([^;{}]+)(?=;|\})/g : /(['"`])((?:(?!\1)[^\\\n])*?)\1/g
  const next = css
    ? source.replace(re, (all, prop, value, idx) => {
        if (prop.startsWith('--') || ignored(idx)) return all
        const r = convertValue(prop.toLowerCase(), value, maps)
        r.events.forEach((e) => events.push({ ...e, prop, line: lineOf(idx) }))
        return r.value === value ? all : all.replace(value, r.value)
      })
    : source.replace(re, (all, q, body, idx) => {
        if (ignored(idx)) return all
        // CSS strings inside js, jsx, ts and tsx: "padding: 16px; color: #fff" and style-object strings such as { padding: '16px' }
        const decl = body.match(/^\s*([\w-]+)\s*:\s*(.+?)\s*;?\s*$/)
        if (decl) { const r = convertValue(decl[1].toLowerCase(), decl[2], maps); r.events.forEach((e) => events.push({ ...e, prop: decl[1], line: lineOf(idx) })); return r.value === decl[2] ? all : all.replace(decl[2], r.value) }
        return all
      })
  // Style objects: { padding: '16px', borderRadius: '8px', color: '#fff' }
  const next2 = css ? next : next.replace(/\b([a-z][a-zA-Z]*)\s*:\s*(['"])([^'"\n]+)\2/g, (all, key, q, value, idx) => {
    if (ignored(idx)) return all
    const prop = key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
    if (!/^(color|background|border|outline|fill|stroke|padding|margin|gap|inset|top|right|bottom|left|row-gap|column-gap)/.test(prop)) return all
    const r = convertValue(prop, value, maps)
    r.events.forEach((e) => events.push({ ...e, prop: key, line: lineOf(idx) }))
    return r.value === value ? all : `${key}: ${q}${r.value}${q}`
  })
  return { text: next2, events }
}

function walk(p, out = []) {
  const st = statSync(p)
  if (st.isFile()) { out.push(p); return out }
  for (const n of readdirSync(p)) {
    if (['node_modules', 'dist', 'build', '.git', 'coverage'].includes(n)) continue
    walk(join(p, n), out)
  }
  return out
}

function main() {
  const argv = process.argv.slice(2)
  const flag = (n) => argv.includes(n)
  const val = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined)
  const here = fileURLToPath(new URL('.', import.meta.url))
  const targets = argv.filter((a, i) => !a.startsWith('--') && !['--tokens'].includes(argv[i - 1]))
  if (!targets.length) { console.error('Give a folder or file: node scripts/codemod-tokens.mjs src [--write]'); process.exit(1) }
  const tokPath = val('--tokens') ?? [join(here, '../dist/tokens.json'), resolve('node_modules/@6sense/design-system/dist/tokens.json')].find(existsSync)
  if (!tokPath || !existsSync(tokPath)) { console.error('tokens.json not found. Pass --tokens <path> or run npm run build:tokens.'); process.exit(1) }
  const maps = buildMaps(JSON.parse(readFileSync(tokPath, 'utf8')))
  const write = flag('--write')
  const exts = ['.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx']
  const report = { replaced: 0, ambiguous: 0, none: 0, files: [] }
  for (const f of targets.flatMap((t) => walk(resolve(t))).filter((f) => exts.includes(extname(f)) && !/\.(stories|test|d)\.[jt]sx?$/.test(f))) {
    const src = readFileSync(f, 'utf8')
    const { text, events } = transform(src, extname(f), maps)
    if (!events.length) continue
    report.files.push({ file: f, events })
    for (const e of events) report[e.kind]++
    if (write && text !== src) writeFileSync(f, text)
  }
  if (flag('--json')) { console.log(JSON.stringify(report, null, 2)); return }
  for (const { file, events } of report.files) {
    console.log(`\n${file}`)
    for (const e of events) console.log(`  ${String(e.line).padStart(4)}  ${e.kind === 'replaced' ? '✓' : e.kind === 'ambiguous' ? '?' : '·'} ${e.prop}: ${e.what}${e.kind === 'replaced' ? `  ->  ${e.token}` : e.kind === 'ambiguous' ? `  (several tokens fit: ${e.options.join(', ')})` : '  (no exact token)'}`)
  }
  console.log(`\n${write ? 'Applied' : 'Would apply'} ${report.replaced} replacement(s). ${report.ambiguous} need a person to choose. ${report.none} have no exact token.${write ? '' : ' Run again with --write to apply.'}`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
