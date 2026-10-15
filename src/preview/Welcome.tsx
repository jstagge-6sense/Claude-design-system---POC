import type { ReactNode } from 'react'
import { Badge } from '../components/Badge'
import { Icon } from '../icons'
import { DATA, EXTRA_COMPONENTS, PRODUCT_COMPONENTS } from './data'

function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
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
      <Section title={<>Codemod check <Badge kind="status" tone="success" icon={<Icon name="check" />}>Passed</Badge></>}>
        <p>We ran the token codemod (<code>scripts/codemod-tokens.mjs</code>) as a dry run over the code that ships in the package. It looks for hard-coded colors, spacing, radii and border widths that should be tokens, and changes nothing unless told to.</p>
        <table className="pv-table">
          <caption className="pv-sr">Codemod dry run results by folder</caption>
          <thead><tr><th scope="col">Folder</th><th scope="col">To replace</th><th scope="col">To decide</th><th scope="col">No token</th><th scope="col">Result</th></tr></thead>
          <tbody>
            <tr><th scope="row">src/components (51 components)</th><td>0</td><td>0</td><td>0</td><td><Icon name="check" label="Pass" /></td></tr>
            <tr><th scope="row">src/primitives</th><td>0</td><td>0</td><td>0</td><td><Icon name="check" label="Pass" /></td></tr>
            <tr><th scope="row">src/foundations</th><td>0</td><td>0</td><td>0</td><td><Icon name="check" label="Pass" /></td></tr>
            <tr><th scope="row">src/icons</th><td>0</td><td>0</td><td>0</td><td><Icon name="check" label="Pass" /></td></tr>
          </tbody>
        </table>
        <p>Why it passes: every color, space, radius and border width in these folders already refers to a token, so there is nothing left for the codemod to swap. A related check confirms that every CSS variable used in component CSS is defined. Six one-pixel alignment offsets in Table, Sticky and DataTableToolbar have no matching token on purpose. They are marked <code>codemod-ignore</code> as intentional exceptions and the codemod skips them. The codemod also passes its own 10 tests.</p>
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
