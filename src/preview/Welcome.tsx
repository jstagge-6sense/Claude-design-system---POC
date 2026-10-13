import type { ReactNode } from 'react'
import { DATA, EXTRA_COMPONENTS, PRODUCT_COMPONENTS } from './data'
import { STACK_IN_USE } from './TechStack'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="pv-section"><h2>{title}</h2>{children}</section>
}
function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return <div className="pv-card pv-stat"><span className="pv-stat-value">{value}</span><strong>{label}</strong>{note ? <span className="pv-muted">{note}</span> : null}</div>
}

export function WelcomePage() {
  const a = DATA.analytics
  const nf = (n: number) => n.toLocaleString('en-US')
  return (
    <>
      <Section title="Welcome to the 6sense design system">
        <p>This is the living preview of the React component library and the tokens behind it. Every component here is built from three token layers (primitive, then semantic, then component), so a change to a token shows up everywhere it is used. Nothing on this page is saved to the library: edits stay in our browser.</p>
        {a ? (
          <div className="pv-statgrid">
            <Stat label="Tokens" value={nf(a.header.all)} note={`${nf(a.header.component)} component, ${nf(a.header.core)} primitive and semantic (repeats counted once)`} />
            <Stat label="Components" value={nf(a.components.total + EXTRA_COMPONENTS.length + PRODUCT_COMPONENTS.length)} note={`${nf(a.components.total + EXTRA_COMPONENTS.length)} built here, plus ${PRODUCT_COMPONENTS.length} product components. ${nf(a.components.stories)} stories`} />
          </div>
        ) : null}
      </Section>
      <Section title="Components hold no values of their own">
        <p>No component carries unique properties. Every color, space, size, radius, border, type style, effect and motion setting in a component refers to a token, so one change to a token updates every component that uses it. That is what makes the library easy to control: change a primitive to restyle everything, a semantic token to change a role, or a component token to adjust one component. The token lint blocks hard-coded colors, direct use of primitive tokens and token names that do not exist. A few raw minimum and maximum width limits (44 lint warnings) are still in component CSS and are tracked for conversion to tokens.</p>
      </Section>
      <Section title="A full React library, not a single React file">
        <p>This is a complete, installable React library. It is not one React file or one example screen. It ships {EXTRA_COMPONENTS.length + 51} typed components, charts, icons and shared pieces, each with its own styling, stories and tests, all driven by one set of design tokens, with build scripts, checks and a publish flow around them. The {STACK_IN_USE.length} tech stacks in use are below. <a href="#/i/stack">Tech stack created and used</a> has the full detail. They have all been created, but not all are connected to outputs yet. The header count of {EXTRA_COMPONENTS.length + 51 + PRODUCT_COMPONENTS.length} also includes {PRODUCT_COMPONENTS.length} product components from the DS component sheet (Revvy, explainability and shared pieces) that live in product code, not in this repo.</p>
        <ul className="pv-notes">
          {STACK_IN_USE.map(([name, role]) => <li key={name}><strong>{name}</strong>: {role}</li>)}
        </ul>
      </Section>
      <Section title="Index">
        <ul className="pv-notes">
          <li><a href="#/i/cost">Cost to build</a>: what the model usage behind this library cost, per token and per component.</li>
          <li><a href="#/i/analytics">Analytics</a>: token counts, usage, component coverage, modes and accessibility.</li>
          <li><a href="#/i/gaps">Gaps and conflicts</a>: open token gaps and documentation conflicts that need a decision.</li>
        </ul>
      </Section>
      <Section title="Find the way around">
        <ul className="pv-notes">
          <li><strong>Foundations:</strong> colors, typography, space, shadows and motion.</li>
          <li><strong>Data visualization:</strong> the chart set built on the same tokens.</li>
          <li><strong>Components:</strong> grouped by tier, each with every story. Use Light, Dark, Density, RTL and Background in the top bar to test them.</li>
        </ul>
      </Section>
      <Section title="Try a token change">
        <ul className="pv-notes">
          <li>Open <strong>Token editor</strong> in the top bar, pick a token and change its value or alias. Every component updates live.</li>
          <li><strong>Upload JSON</strong>, <strong>Paste JSON</strong> or drop a .json file on the editor to preview a token file. Tokens that are not in the library yet are added to the preview only.</li>
          <li>Turn on <strong>See edits only</strong> to review just what we changed.</li>
          <li><strong>Copy edits</strong> or <strong>Download zip</strong> to hand the changes back as JSON, a table and a prompt.</li>
        </ul>
      </Section>
    </>
  )
}
