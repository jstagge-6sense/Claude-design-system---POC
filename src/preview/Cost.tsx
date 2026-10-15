import { useEffect, useMemo, useState, type ReactNode } from 'react'
import COST from './costData.json'
import { EXTRA_COMPONENTS } from './data'

const KEY = '6si-ds-preview-cost-v1'
type Inputs = { input: number; output: number; cacheWrite: number; cacheRead: number; extra: number; hourly: number; extraHours: number; awayGap: number; buffer: number; earlierSessions: number; earlierHours: number; review: number }
const DEFAULTS: Inputs = { buffer: 25, ...COST.rates, extra: 0, extraHours: 1, awayGap: 1, earlierSessions: 0, earlierHours: 0, review: 25 }
const START = '2026-10-02' // the user-confirmed first day of work on this library (the first git commit is later)
const usd = (n: number, d = 2) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d })
const nf = (n: number) => n.toLocaleString('en-US')
const hrs = (n: number) => `${n.toFixed(1)} h`
const dt = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split('-'); return `${m}-${d}-'${y.slice(2)}` } // YYYY-MM-DD to MM-DD-'YY
const mil = (n: number) => `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M`

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <section className="pv-section"><h2>{title}</h2>{note ? <p className="pv-muted">{note}</p> : null}{children}</section>
}
function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return <div className="pv-card pv-stat"><span className="pv-stat-value">{value}</span><strong>{label}</strong>{note ? <span className="pv-muted">{note}</span> : null}</div>
}

function load(): Inputs {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    if (saved.awayGap === 3) delete saved.awayGap // the old 3 hour default counted waiting time as work: use the current default
    if (saved.extraHours === 0) delete saved.extraHours // the 1 hour for the token export and import plugin is now the default
    if (saved.hourly === 75) delete saved.hourly // the old placeholder rate: use the current default
    const merged = { ...DEFAULTS, ...saved } as Inputs
    for (const k of Object.keys(DEFAULTS) as Array<keyof Inputs>) if (!Number.isFinite(merged[k])) merged[k] = DEFAULTS[k] // never let a missing or bad value produce NaN
    merged.awayGap = DEFAULTS.awayGap; merged.earlierSessions = DEFAULTS.earlierSessions; merged.earlierHours = DEFAULTS.earlierHours; merged.extraHours = DEFAULTS.extraHours // fixed settings, not editable
    return merged
  } catch { return DEFAULTS }
}

export function CostPage() {
  const [v, setV] = useState<Inputs>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* private mode */ } }, [v])
  const set = (k: keyof Inputs) => (e: { target: { value: string } }) => setV({ ...v, [k]: Math.max(0, Number(e.target.value) || 0) })

  const m = useMemo(() => {
    const s = COST.sessions.reduce((a, x) => ({ calls: a.calls + x.calls, cw: a.cw + x.cacheWrite, cr: a.cr + x.cacheRead, out: a.out + x.output, inp: a.inp + x.input }), { calls: 0, cw: 0, cr: 0, out: 0, inp: 0 })
    const earlyCalls = (COST.tasks?.list ?? []).reduce((a, t) => a + ((t as { effective?: number }).effective ? t.calls : 0), 0)
    s.calls += earlyCalls // the early build's model turns are part of the call total
    const earlyEff = (COST.tasks?.list ?? []).reduce((a, t) => a + ((t as { effective?: number }).effective ?? 0), 0)
    const parts = { 'Cache reads': (s.cr / 1e6) * v.cacheRead, 'Cache writes': (s.cw / 1e6) * v.cacheWrite, 'Output': (s.out / 1e6) * v.output, 'Input (uncached)': (s.inp / 1e6) * v.input, 'Early build (effective tokens)': (earlyEff / 1e6) * v.input }
    const usage = Object.values(parts).reduce((a, b) => a + b, 0)
    const activeH = COST.time.activeMinutes / 60
    // Working time: wall clock from the first to the last message of each stretch of work. A gap longer than the away limit
    // (overnight, a day off) ends the stretch and is not counted. Short gaps (reviewing, waiting, thinking) are counted.
    const ws = (COST.time.list as string[][]).map(([a, b]) => [Date.parse(a + 'Z'), Date.parse(b + 'Z')]).sort((x, y) => x[0] - y[0])
    let workMin = 0, stretches = 0, cur: number[] | null = null
    const spans: number[][] = []
    for (const w of ws) {
      if (cur && (w[0] - cur[1]) / 36e5 <= v.awayGap) cur[1] = Math.max(cur[1], w[1])
      else { if (cur) { workMin += (cur[1] - cur[0]) / 6e4; spans.push(cur) } cur = [...w]; stretches++ }
    }
    if (cur) { workMin += (cur[1] - cur[0]) / 6e4; spans.push(cur) }
    // Each stretch of working time is split across the task segments it overlaps. Time that falls in an excluded task is not counted.
    const segs = (COST.tasks?.segments ?? []).map(([a, n]) => [Date.parse(a + ':00Z'), n as string] as [number, string])
    const hoursBy: Record<string, number> = {}
    for (const [a, b] of spans) {
      const cuts = [a, ...segs.map(([t]) => t).filter((t) => t > a && t < b), b]
      for (let i = 0; i < cuts.length - 1; i++) {
        let name = segs.length ? segs[0][1] : 'All work'
        for (const [t, n] of segs) if (cuts[i] >= t) name = n
        hoursBy[name] = (hoursBy[name] ?? 0) + (cuts[i + 1] - cuts[i]) / 36e5
      }
    }
    for (const ex of (COST.tasks?.excluded ?? [])) delete hoursBy[ex]
    // Working time across ALL work, including tasks that are not counted in the cost (demo pages, cost page and so on).
    const wsAll = ((COST.time as { allList?: string[][] }).allList ?? (COST.time.list as string[][])).map(([a, b]) => [Date.parse(a + 'Z'), Date.parse(b + 'Z')]).sort((x, y) => x[0] - y[0])
    let allMin = 0, curA: number[] | null = null
    for (const w of wsAll) {
      if (curA && (w[0] - curA[1]) / 36e5 <= v.awayGap) curA[1] = Math.max(curA[1], w[1])
      else { if (curA) allMin += (curA[1] - curA[0]) / 6e4; curA = [...w] }
    }
    if (curA) allMin += (curA[1] - curA[0]) / 6e4
    const allH = allMin / 60 + v.extraHours
    const allPeopleH = allH * (1 + v.review / 100)
    const workH = Object.values(hoursBy).reduce((a, b) => a + b, 0)
    // Earlier sessions (START to the day before this session) cannot be read, so they are estimated: sessions x hours each,
    // costed at this session's measured model usage per working hour. Edit both numbers in the inputs bar.
    const earlierH = v.earlierSessions * v.earlierHours
    const earlierUsage = workH > 0 ? earlierH * (usage / workH) : 0
    const baseH = workH + earlierH + v.extraHours
    const peopleH = baseH * (1 + v.review / 100) // review time: time spent looking outputs over, added to the counted hours
    const labor = peopleH * v.hourly
    const measured = usage + earlierUsage + labor
    const subtotal = measured + v.extra
    const bufferAmt = (usage + earlierUsage + v.extra) * (v.buffer / 100) // buffer applies to spend, not to people time
    const total = subtotal + bufferAmt
    // Cost by task: hours come from the split above; excluded tasks are not counted.
    const early = new Set((COST.tasks?.list ?? []).filter((t) => (t as { effective?: number }).effective).map((t) => t.name))
    const use = Object.fromEntries((COST.tasks?.list ?? []).map((t) => [t.name, t]))
    const taskRows = [...new Set([...Object.keys(hoursBy), ...Object.keys(use)])].map((name) => {
      const u = use[name]
      const eff = (u as { effective?: number } | undefined)?.effective ?? 0
      const tokensUsed = eff || (u ? u.cacheWrite + u.cacheRead + u.output + u.input : 0)
      const claude = eff ? (eff / 1e6) * v.input : u ? ((u.cacheRead / 1e6) * v.cacheRead + (u.cacheWrite / 1e6) * v.cacheWrite + (u.output / 1e6) * v.output + (u.input / 1e6) * v.input) : 0
      const hours = (hoursBy[name] ?? 0) * (1 + v.review / 100)
      const people = hours * v.hourly
      return { name, calls: u?.calls ?? 0, tokensUsed, hours, claude, people, total: claude + people }
    }).sort((x, y) => y.total - x.total)
    if (v.extraHours) { const hours = v.extraHours * (1 + v.review / 100); taskRows.push({ name: 'Token export/import plugin and token matching (added hour)', calls: 0, tokensUsed: 0, hours, claude: 0, people: hours * v.hourly, total: hours * v.hourly }) }
    const tokens = COST.totals.tokens
    const claudeTotal = (usage + earlierUsage + v.extra) * (1 + v.buffer / 100) // Claude spend with its buffer
    const perToken = total / tokens
    const perTokenClaude = claudeTotal / tokens
    const perTokenPeople = labor / tokens
    const core = COST.totals.layers.primitive + COST.totals.layers.semantic
    const all = [...COST.componentTokens, ...EXTRA_COMPONENTS.map((n) => [n, 0] as [string, number])] // the full library: components, charts, icon and shared pieces
    const nComp = all.length
    const rows = all.map(([name, own]) => ({ name: name as string, own: own as number, units: (own as number) + core / nComp }))
      .map((r) => ({ ...r, cost: r.units * perToken, claude: r.units * perTokenClaude, people: r.units * perTokenPeople, hours: r.units * (peopleH / tokens) })).sort((a, b) => b.cost - a.cost)
    return { allH, allPeopleH, early, taskRows, s, parts, claudeTotal, perTokenClaude, perTokenPeople, baseH, earlierH, earlierUsage, subtotal, bufferAmt, usage, activeH, workH, stretches, peopleH, labor, measured, total, tokens, perToken, core, nComp, rows }
  }, [v])

  const bars: Array<[string, number]> = [...Object.entries(m.parts), ['Earlier sessions usage (estimated)', m.earlierUsage], ['People time', m.labor], ...(v.extra ? [['Added spend', v.extra] as [string, number]] : []), ['Buffer', m.bufferAmt]]
  const maxPart = Math.max(...bars.map((b) => b[1]), 1)
  const L = COST.totals.layers
  const rate = (k: keyof Inputs, label: string) => (
    <label className="pv-field"><span>{label}</span><input className="pv-input" type="number" min={0} step="any" value={v[k]} onChange={set(k)} aria-label={label} /></label>
  )

  return (
    <>
      <Section title="Cost to build the library" note="What the model usage behind this workspace cost, then broken out per token and per component. Costs are API-equivalent estimates from measured usage and the rates we set below.">
        <div className="pv-statgrid">
          <Stat label="Total cost" value={usd(m.total)} note={`Claude ${usd(m.claudeTotal)} + people ${usd(m.labor)}`} />
          <Stat label="Claude cost only" value={usd(m.claudeTotal)} note="Model usage only, with buffer" />
          <Stat label="People cost only" value={usd(m.labor)} note={`${hrs(m.peopleH)} at ${usd(v.hourly)} an hour`} />
          <Stat label="Working time, all work" value={hrs(m.allPeopleH)} note={`Includes tasks not in the cost.`} />
          <Stat label="Of that, Claude working" value={hrs(m.activeH)} note="Time Claude ran. Not charged." />
          <Stat label="Cost per token" value={usd(m.perToken, 3)} note={`${nf(m.tokens)} tokens`} />
          <Stat label="Cost per component" value={usd(m.total / m.nComp)} note={`Average of ${m.nComp} components, ${hrs(m.peopleH / m.nComp)} working time each`} />
          <Stat label="First day of usage" value={dt(START)} note={`${Math.round((Date.parse(COST.git.lastCommit) - Date.parse(START)) / 864e5) + 1} days to ${dt(COST.git.lastCommit)}`} />
          <Stat label="Model calls measured" value={nf(m.s.calls)} note={`${(m.s.calls / m.workH).toFixed(0)} calls per working hour`} />
        </div>
      </Section>

      <Section title="Time added to the hour count">
        <ul className="pv-muted">
          <li>Review time: {v.review}% added to the counted hours, for time spent looking outputs over ({hrs(m.workH * v.review / 100)}).</li>
          {v.extraHours ? <li>Token export/import plugin and token matching: {hrs(v.extraHours)} added ({hrs(v.extraHours * v.review / 100)} more with review time). Claude was not used to build the Figma plugin, so it has no token cost.</li> : null}
          <li>Learning skills: about 2 hours of the measured time, already inside the working time.</li>
        </ul>
      </Section>
      <Section title="Rates, time and other spend" note="Rates are per million tokens and are placeholders, so change them to match our plan. People cost is working time times the hourly rate. A gap of more than the limit below ends a stretch of work. The buffer is added to spend only, to cover rework. Inputs are saved in this browser.">
        <div className="pv-ratebar">
          {rate('cacheRead', 'Cache read $ / M')}
          {rate('cacheWrite', 'Cache write $ / M')}
          {rate('output', 'Output $ / M')}
          {rate('input', 'Input $ / M')}
          {rate('hourly', 'People time $ / hour')}
          {rate('extra', 'Added spend (USD)')}
          {rate('review', 'Review time added to hours (%)')}
          {rate('buffer', 'Buffer on spend (%)')}
          <button className="pv-btn" onClick={() => setV(DEFAULTS)}>Reset</button>
        </div>
      </Section>

      <Section title="Cost by task" note="What each kind of work cost: Claude tokens used and cost, working hours and people cost. Demo pages, the token editor, the cost page and library restore work are not counted.">
        <table className="pv-table">
          <thead><tr><th scope="col">Task</th><th scope="col">Calls</th><th scope="col">Tokens used</th><th scope="col">Hours</th><th scope="col">Claude</th><th scope="col">People</th><th scope="col">Total</th></tr></thead>
          <tbody>
            {m.taskRows.map((r) => <tr key={r.name}><td>{r.name}</td><td>{nf(r.calls)}</td><td>{r.tokensUsed ? `${mil(r.tokensUsed)}${m.early.has(r.name) ? ' effective' : ''}` : r.name.startsWith('Token export/import plugin') ? 'none (no Claude)' : 'not readable'}</td><td>{hrs(r.hours)}</td><td>{usd(r.claude)}</td><td>{usd(r.people)}</td><td>{usd(r.total)}</td></tr>)}
            <tr><th scope="row">All</th><td><strong>{nf(m.taskRows.reduce((a, r) => a + r.calls, 0))}</strong></td><td><strong>{mil(m.taskRows.reduce((a, r) => a + r.tokensUsed, 0))}</strong></td><td><strong>{hrs(m.taskRows.reduce((a, r) => a + r.hours, 0))}</strong></td><td><strong>{usd(m.taskRows.reduce((a, r) => a + r.claude, 0))}</strong></td><td><strong>{usd(m.taskRows.reduce((a, r) => a + r.people, 0))}</strong></td><td><strong>{usd(m.taskRows.reduce((a, r) => a + r.total, 0))}</strong></td></tr>
          </tbody>
        </table>
        <p className="pv-muted">The early build thread made 72 tool calls across 36 model turns; the 36 model turns are counted as its calls. Its tokens are effective tokens: cached re-reads count at 0.1x, cache writes at 2x and output at 5x a regular input token. The split by group is approximate: project docs about half, Claude's instructions and tools about 18%, Claude writing about 14%, messages and loaded skills about 9%, everything else about 8%. Subagents, web research, connectors and Chrome were not used.</p>
      </Section>

      <Section title="Cost per token" note="Every token carries the same share: cost divided by all tokens, split into Claude (model usage and buffer) and people (working hours). The layer rows show how that adds up.">
        <table className="pv-table">
          <thead><tr><th scope="col">Layer</th><th scope="col">Tokens</th><th scope="col">Claude</th><th scope="col">People</th><th scope="col">Cost</th><th scope="col">Per token</th></tr></thead>
          <tbody>
            {(['primitive', 'semantic', 'component'] as const).map((l) => <tr key={l}><td>{l}</td><td>{nf(L[l])}</td><td>{usd(L[l] * m.perTokenClaude)}</td><td>{usd(L[l] * m.perTokenPeople)}</td><td>{usd(L[l] * m.perToken)}</td><td>{usd(m.perToken, 3)}</td></tr>)}
            <tr><th scope="row">All</th><td><strong>{nf(m.tokens)}</strong></td><td><strong>{usd(m.claudeTotal)}</strong></td><td><strong>{usd(m.labor)}</strong></td><td><strong>{usd(m.total)}</strong></td><td><strong>{usd(m.perToken, 3)}</strong></td></tr>
          </tbody>
        </table>
      </Section>

      <section className="pv-section">
        <details className="pv-collapse">
          <summary><h2>Cost per component</h2><span className="pv-muted">Show or hide the table of {m.nComp} components</span></summary>
          <p className="pv-muted">{`Each component carries its own component tokens plus an equal share (${(m.core / m.nComp).toFixed(1)} tokens) of the ${nf(m.core)} shared primitive and semantic tokens, at the cost per token above. Working time is the same share of the counted hours.`}</p>
        <table className="pv-table">
          <thead><tr><th scope="col">Component</th><th scope="col">Own tokens</th><th scope="col">Token share</th><th scope="col">Working time</th><th scope="col">Claude</th><th scope="col">People</th><th scope="col">Total</th></tr></thead>
          <tbody>
            {m.rows.map((r) => <tr key={r.name}><td>{r.name.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</td><td>{r.own}</td><td>{r.units.toFixed(1)}</td><td>{hrs(r.hours)}</td><td>{usd(r.claude)}</td><td>{usd(r.people)}</td><td>{usd(r.cost)}</td></tr>)}
          </tbody>
        </table>
        </details>
      </section>

      <Section title="Coverage: what is and is not in these numbers">
        <ul className="pv-notes">
          <li><strong>Measured:</strong> The Claude work behind this library ({nf(m.s.calls)} requests) and the time we spent on it, all work included: {hrs(m.allPeopleH)} from {dt(START)} to the last update on {dt((COST as { builtAt?: string }).builtAt || COST.time.lastMessage)}. This includes all work, even tasks not counted in the cost (demo pages, cost page, token editor and library restore), and {v.review}% extra for reviewing the outputs. About 2 hours went to learning skills in the library.</li>
          <li><strong>Not measured:</strong> Time it took Jessica and Vivek to get tokens set up.</li>
          <li><strong>Not included:</strong> Figma seats and credits, and hosting.</li>
          <li><strong>Estimate:</strong> If we pay a flat monthly plan instead of per use, read this as the value of the usage, not a bill.</li>
        </ul>
      </Section>

      <Section title="Where the measured cost went" note={`${mil(m.s.cr)} cache-read, ${mil(m.s.cw)} cache-write, ${nf(m.s.out)} output and ${nf(m.s.inp)} uncached input tokens over ${nf(m.s.calls)} model calls. Cache reads dominate because every step re-reads the whole conversation.`}>
        <div className="pv-hbars">
          {bars.map(([k, n]) => (
            <div key={k} className="pv-hbar"><code>{k}</code><span><i style={{ inlineSize: `${(n / maxPart) * 100}%` }} /></span><em>{usd(n)}</em></div>
          ))}
        </div>
      </Section>
    </>
  )
}
