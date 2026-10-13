#!/usr/bin/env node
// Writes one Word document per component from src/preview/guidelines*. Usage: node scripts/export-guidelines-docx.mjs [outDir]
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createRequire } from 'node:module'
const root = resolve('.')
const outDir = resolve(process.argv[2] || 'Guidelines Working files')
const req = createRequire(import.meta.url)
const esbuild = req(process.env.ESBUILD_PATH || '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/esbuild')
const D = req(process.env.DOCX_PATH || '/usr/local/lib/node_modules_global/lib/node_modules/docx')
await esbuild.build({ entryPoints: [join(root, 'src/preview/guidelines.ts')], bundle: true, outfile: '/tmp/ds-guidelines-docx.cjs', platform: 'node', format: 'cjs', logLevel: 'error' })
const { GUIDELINES } = req('/tmp/ds-guidelines-docx.cjs')
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, LevelFormat, AlignmentType } = D
const humanize = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
const W = 9360, INK = '14262A', MUTE = '5D7276', LINE = 'D6DCDF', TINT = 'F4F6F7'
const FONT = 'Arial'
const p = (text, o = {}) => new Paragraph({ spacing: { after: o.after ?? 120, before: o.before ?? 0 }, ...(o.p || {}), children: [new TextRun({ text, font: FONT, size: o.size ?? 22, italics: o.italics, bold: o.bold, color: o.color ?? INK })] })
const rich = (label, text) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: label + ' ', bold: true, font: FONT, size: 22, color: INK }), new TextRun({ text, font: FONT, size: 22, color: INK })] })
const bullet = (t) => new Paragraph({ numbering: { reference: 'b', level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: t, font: FONT, size: 22, color: INK })] })
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 80 }, children: [new TextRun({ text: t, font: FONT, size: 28, bold: true, color: INK })] })
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 60 }, children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, color: INK })] })
const border = { style: BorderStyle.SINGLE, size: 4, color: LINE }
const borders = { top: border, bottom: border, left: border, right: border }
function table(t) {
  const n = t.head.length
  const widths = n === 3 ? [2400, 1400, W - 3800] : Array.from({ length: n }, (_, i) => (i === n - 1 ? W - Math.floor(W / n) * (n - 1) : Math.floor(W / n)))
  const cell = (txt, w, head) => new TableCell({ borders, width: { size: w, type: WidthType.DXA }, shading: head ? { fill: TINT, type: ShadingType.CLEAR, color: 'auto' } : undefined, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: txt, font: FONT, size: 20, bold: head, color: head ? MUTE : INK })] })] })
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, rows: [new TableRow({ tableHeader: true, children: t.head.map((h, i) => cell(h, widths[i], true)) }), ...t.rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], false)) }))] })
}
mkdirSync(outDir, { recursive: true })
for (const f of readdirSync(outDir)) if (f.endsWith('.docx')) { /* keep stale files out */ }
let count = 0
for (const [name, g] of Object.entries(GUIDELINES).sort(([a], [b]) => a.localeCompare(b))) {
  const label = humanize(name)
  const kids = [
    new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 60 }, children: [new TextRun({ text: `${label} guidelines`, font: FONT, size: 44, bold: true, color: INK })] }),
    p('6sense design system. Working draft for review.', { color: MUTE, size: 20, after: 200 }),
    h2('Purpose'), p(g.summary), rich('Used for.', g.usedFor || ''), rich('Why it works this way.', g.why || ''),
  ]
  for (const s of g.sections) {
    kids.push(h2(s.title))
    if (s.intro) kids.push(p(s.intro, { italics: true, color: MUTE }))
    if (s.anatomy) s.anatomy.parts.forEach((a, i) => { kids.push(new Paragraph({ numbering: { reference: 'n', level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: a.name, bold: true, font: FONT, size: 22, color: INK })] }), new Paragraph({ indent: { left: 720 }, spacing: { after: 100 }, children: [new TextRun({ text: a.text, font: FONT, size: 22, color: MUTE })] })) })
    if (s.props) kids.push(rich('Main props.', s.props.join(', ')))
    if (s.bullets) s.bullets.forEach((b) => kids.push(bullet(b)))
    if (s.groups) s.groups.forEach((gr) => { kids.push(h3(gr.label)); gr.bullets.forEach((b) => kids.push(bullet(b))) })
    if (s.table) { kids.push(table(s.table)); kids.push(p('', { after: 60 })) }
    if (s.note) kids.push(rich(s.note.label + '.', s.note.text))
  }
  const doc = new Document({
    creator: '6sense design system', title: `${label} guidelines`,
    styles: { default: { document: { run: { font: FONT, size: 22 } } }, paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 44, bold: true, font: FONT }, paragraph: { spacing: { after: 60 } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 28, bold: true, font: FONT }, paragraph: { spacing: { before: 320, after: 80 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, font: FONT }, paragraph: { spacing: { before: 160, after: 60 }, outlineLevel: 2 } }] },
    numbering: { config: [
      { reference: 'b', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'n', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: kids }],
  })
  writeFileSync(join(outDir, `${name} guidelines.docx`), await Packer.toBuffer(doc)); count++
}
console.log(`Wrote ${count} Word documents to ${outDir}`)
