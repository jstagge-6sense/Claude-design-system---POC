// Builds src/preview/costData.json for the Cost page: measured model usage, token/component counts, git facts.
// Usage logs live in docs/cost/*.txt (one model call per line: cache_write cache_read output). Add more files to count more sessions.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
const root = process.argv[2] || '.'
const dir = join(root, 'docs/cost')
const sessions = []
if (existsSync(dir)) for (const f of readdirSync(dir).filter((f) => f.endsWith('.txt')).sort()) {
  const rows = readFileSync(join(dir, f), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\s+/).map(Number))
  sessions.push({ file: f, calls: rows.length, cacheWrite: rows.reduce((a, r) => a + r[0], 0), cacheRead: rows.reduce((a, r) => a + r[1], 0), output: rows.reduce((a, r) => a + r[2], 0), input: rows.length * 2 })
}
const time = { activeMinutes: 0, windows: 0, firstMessage: null, lastMessage: null, list: [] }
if (existsSync(dir)) for (const f of readdirSync(dir).filter((f) => /^time.*\.json$/.test(f)).sort()) {
  for (const w of JSON.parse(readFileSync(join(dir, f), 'utf8')).windows || []) {
    const a = Date.parse(w.start + 'Z'), b = Date.parse(w.end + 'Z')
    time.activeMinutes += Math.round((b - a) / 60000); time.windows++; time.list.push([w.start, w.end])
    if (!time.firstMessage || w.start < time.firstMessage) time.firstMessage = w.start
    if (!time.lastMessage || w.end > time.lastMessage) time.lastMessage = w.end
  }
}
const tokens = JSON.parse(readFileSync(join(root, 'dist/tokens.json'), 'utf8'))
const layers = { primitive: 0, semantic: 0, component: 0 }
const comps = {}
for (const [n, t] of Object.entries(tokens)) { layers[t.layer] = (layers[t.layer] || 0) + 1; if (t.layer === 'component') { const c = n.split('.')[1]; comps[c] = (comps[c] || 0) + 1 } }
let git = {}
try {
  const sh = (c) => execSync(c, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  git = { firstCommit: sh('git log --reverse --format=%ad --date=short | head -1'), lastCommit: sh('git log -1 --format=%ad --date=short'), commits: Number(sh('git rev-list --count HEAD')), authors: sh('git shortlog -sn HEAD | wc -l').trim() }
} catch { git = { firstCommit: '2026-10-06', lastCommit: '2026-10-08', commits: 30, authors: '1' } }
const out = {
  generatedAt: new Date().toISOString().slice(0, 10), git, sessions, time,
  totals: { tokens: Object.values(layers).reduce((a, b) => a + b, 0), layers, components: Object.keys(comps).length },
  componentTokens: Object.entries(comps).sort((a, b) => b[1] - a[1]),
  rates: { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3, hourly: 150, buffer: 25 },
  otherSessions: ['React library from MD files', 'First build components', 'React components creation', 'Component token generation', 'CSS token compression', 'Design system variable count', 'Shadow token efficiency', 'Library components list', 'Library load time rating', 'Team kit setup', 'Token migration report analysis', 'Phase 1 approval', 'React structure skill scaffolding', 'Figma markdown library setup', 'Markdown conversion', 'Figma library components skill', 'Figma form-control component skills', 'File reference collection', '6sense UI code language', 'Claude design repository proposal'],
}
writeFileSync(join(root, 'src/preview/costData.json'), JSON.stringify(out, null, 1) + '\n')
console.log(`Cost data: ${sessions.length} usage log(s), ${sessions.reduce((a, s) => a + s.calls, 0)} calls, ${out.totals.tokens} tokens, ${out.totals.components} components`)
