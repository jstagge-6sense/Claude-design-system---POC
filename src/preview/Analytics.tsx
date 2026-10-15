import type { ReactNode } from 'react'
import { DATA, type Pairs, EXTRA_COMPONENTS, PRODUCT_COMPONENTS } from './data'

const nf = (n: number) => n.toLocaleString('en-US')

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <section className="pv-section"><h2>{title}</h2>{note ? <p className="pv-muted">{note}</p> : null}{children}</section>
}

function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="pv-card pv-stat">
      <span className="pv-stat-value">{typeof value === 'number' ? nf(value) : value}</span>
      <strong>{label}</strong>
      {note ? <span className="pv-muted">{note}</span> : null}
    </div>
  )
}

function Bars({ rows, max, suffix = '' }: { rows: Pairs; max?: number; suffix?: string }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r[1]))
  return (
    <div className="pv-hbars">
      {rows.map(([k, v]) => (
        <div key={k} className="pv-hbar"><code>{k}</code><span><i style={{ inlineSize: `${(v / top) * 100}%` }} /></span><em>{nf(v)}{suffix}</em></div>
      ))}
    </div>
  )
}

const entries = (o: Record<string, number>): Pairs => Object.entries(o).sort((a, b) => b[1] - a[1])
const TIER = ['Unassigned', 'Tier 1 critical', 'Tier 2', 'Tier 3']

export function AnalyticsPage() {
  const a = DATA.analytics
  if (!a) return <Section title="Analytics"><p className="pv-muted">No analytics were embedded in this build. Re-run the preview build.</p></Section>
  const c = a.components
  const layers = (['primitive', 'semantic', 'component'] as const).map((l) => [l, a.byLayer[l]] as const)
  return (
    <>
      <Section title="Modes and accessibility">
        <div className="pv-statgrid">
          <Stat label="Dark mode overrides" value={a.modes.darkOverrides} />
          <Stat label="Contrast pairs passing" value={`${a.modes.contrastPass} / ${a.modes.contrastPairs}`} note="WCAG checks in dark and light" />
          <Stat label="Density modes" value={2} note="compact and spacious" />
        </div>
      </Section>

      <Section title="Tokens" note="Counts of named tokens, and the same counts when tokens that resolve to the same value are counted once.">
        <div className="pv-statgrid">
          <Stat label="All tokens" value={a.total} note="named tokens in the source" />
          <Stat label="Unique values" value={a.header.all} note="reused values counted once (header total)" />
          {layers.map(([l, v]) => <Stat key={l} label={`${l[0].toUpperCase()}${l.slice(1)}`} value={v.total} note={`${nf(v.distinct)} distinct values`} />)}
        </div>
        <div className="pv-twocol">
          <div><h3>Primitive by group</h3><Bars rows={entries(a.primGroups)} /></div>
          <div><h3>Semantic by group</h3><Bars rows={entries(a.semGroups)} /></div>
        </div>
        <div className="pv-twocol">
          <div><h3>Component tokens, top 12 of {a.compTokenComponents} components</h3><Bars rows={a.compTokenCounts} /></div>
          <div>{layers.map(([l, v]) => <div key={l}><h3>{l[0].toUpperCase() + l.slice(1)} by kind</h3><Bars rows={entries(v.kinds)} max={v.total} /></div>)}</div>
        </div>
      </Section>

      <Section title="Usage" note="Which tokens the React component source (CSS and TSX, not stories or tests) references directly.">
        <div className="pv-statgrid">
          <Stat label="Referenced directly" value={a.usage.usedDirect} note={`of ${nf(a.total)} tokens`} />
          <Stat label="Component layer" value={a.usage.byLayerDirect.component ?? 0} note={`of ${nf(a.byLayer.component.total)}`} />
          <Stat label="Semantic layer" value={a.usage.byLayerDirect.semantic ?? 0} note={`of ${nf(a.byLayer.semantic.total)}`} />
          <Stat label="Unused (semantic and component)" value={a.usage.unusedNonPrimitive} note="nothing references or aliases them" />
        </div>
        {a.usage.unusedList.length ? <p className="pv-muted">Unused: {a.usage.unusedList.map((n) => <code key={n}>{n} </code>)}</p> : null}
        <div className="pv-twocol">
          <div><h3>Most shared tokens (components using each)</h3><Bars rows={a.usage.mostShared} /></div>
          <div><h3>Components using the most distinct tokens</h3><Bars rows={a.usage.tokensPerComponent} /></div>
        </div>
      </Section>

      <Section title="Components and variants" note="Variants are counted from the component props: structural means variant, type, orientation, mode, layout. Sizes, density and tone are styling variants.">
        <div className="pv-statgrid">
          <Stat label="Components" value={c.total + EXTRA_COMPONENTS.length + PRODUCT_COMPONENTS.length} note={`${c.total + EXTRA_COMPONENTS.length} built here, plus ${PRODUCT_COMPONENTS.length} product components. Stories, variants and motion below cover the ${c.total}.`} />
          <Stat label="Stories rendered" value={c.stories} />
          <Stat label="Counting structural variants" value={c.structuralVariantCount} note={`${c.withStructuralVariants} components have them`} />
          <Stat label="Counting all variants" value={c.allVariantCount} note="adds sizes, density, tone" />
        </div>
        <div className="pv-twocol">
          <div><h3>Components by tier</h3><Bars rows={Object.entries(c.tiers).map(([t, n]) => [TIER[Number(t)] ?? `Tier ${t}`, n] as [string, number])} /></div>
          <div><h3>Most stories</h3><Bars rows={c.storiesPerComponent} /></div>
        </div>
      </Section>

      <Section title="Motion" note="How far the motion tokens (core.motion.*) have rolled out.">
        <div className="pv-statgrid">
          <Stat label="Motion tokens" value={a.motionTokens} />
          <Stat label="Components that animate" value={c.motion.animated} note={`of ${c.total}`} />
          <Stat label="On the new motion tokens" value={c.motion.onMotionTokens.length} note={c.motion.onMotionTokens.join(', ')} />
          <Stat label="On the --ds-motion aliases" value={c.motion.onAliases} note="follow the tokens and reduced motion automatically" />
          <Stat label="Still hardcoded" value={c.motion.hardcoded.length} note={c.motion.hardcoded.join(', ') || 'none'} />
          <Stat label="Static" value={c.motion.static} note="no transition or animation" />
        </div>
      </Section>

    </>
  )
}
