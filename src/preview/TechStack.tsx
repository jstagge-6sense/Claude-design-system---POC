import type { ReactNode } from 'react'
import MAP from './stackMap.json'

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <section className="pv-section"><h2>{title}</h2>{note ? <p className="pv-muted">{note}</p> : null}{children}</section>
}
type Row = [string, string, string]
function Table({ head, rows }: { head: [string, string, string]; rows: Row[] }) {
  return (
    <table className="pv-table">
      <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map(([a, b, c]) => <tr key={a}><td><strong>{a}</strong></td><td>{b}</td><td>{c}</td></tr>)}</tbody>
    </table>
  )
}

// Sources: docs/source/design-system-project-knowledge.md (Tools and Resources), package.json, and the repo folders.
const STACK: Row[] = [
  ['Claude and GitHub', 'The team builds and maintains the whole stack using skills built in Claude. GitHub stores it.', 'The team created every part of this stack by leveraging skills built in Claude, and can edit any of it the same way: tokens, components, scripts, tests, charts and this preview. Tokens use the three-layer Primitive, Semantic, Component names, held as DTCG JSON in tokens/primitive, semantic and component. Edits made in this preview are exported and applied to the source files through those skills, then checked and sent to GitHub through a pull request.'],
  ['Storybook', 'Reference for component props and states.', 'The team, leveraging skills built in Claude, produced a CSF3 stories file for every component (51) and the storybook scripts are in package.json. Storybook has not been run in our build environment, so treat it as unverified.'],
  ['React 18+ and TypeScript', 'Product UI code.', 'The team, leveraging skills built in Claude, built the full library of 62 typed items (51 components, 8 charts, Icon, Portal and Visually Hidden; the overall count of 78 adds 16 product components from the DS sheet), with CSS Modules, 8 shared primitives (Portal, VisuallyHidden, controllable state, refs, hooks) and an icon set. React is a peer dependency, so product apps bring their own copy.'],
  ['Vite library build', 'Packaging for product teams.', 'vite.config.ts builds the library as an ES module with type declarations and one styles.css. React is external. Real Vite has not run in our build environment. npm run verify builds the same entry with esbuild, which does run here.'],
  ['npm package', 'How product teams install the library.', '@6sense/design-system 0.1.0: an exports map for the library, styles.css and the token files, a files list that publishes dist only, and npm run check:package. The publish workflow runs on a version tag. Not published yet: it needs the NPM_TOKEN secret.'],
  ['Codemod', 'Moving product code onto tokens.', 'npm run codemod finds hard-coded colors, spacing, radii and border widths and swaps exact matches for semantic tokens. It lists the rest for a person to decide. It has 9 passing tests.'],
  ['Library verification', 'Checks that the package is sound.', 'npm run verify checks the build, bundle size, tree-shaking, server-side import with no window, focus rings and full-width fields. npm run smoke:ssr renders all 462 stories with no browser globals.'],
  ['Vitest and Testing Library', 'Component tests.', 'The team, leveraging skills built in Claude, produced a test file for every component (51). Not run in our build environment.'],
  ['Highcharts (Data-Viz package)', 'Charts and data visualization.', '8 chart components (area, bar, donut, funnel, line, Pareto, stacked and grouped bar, DBA) read their colors from a generated palette that comes from the tokens.'],
  ['GitHub and GitHub Pages', 'Source control and the hosted preview.', 'scripts/publish.mjs runs every check, then opens a pull request. It only pushes when we pass --approve and never pushes to main. The preview is one HTML file that Pages can host.'],
  ['Confluence', 'Token documentation.', 'Not connected. The docs folder and the preview Analytics and Gaps pages hold the same facts in a form that can be pasted there.'],
  ['Style Dictionary', 'Possible future token transform.', 'Not adopted. build-tokens.mjs does the job today and writes CSS, a JSON map and TypeScript types.'],
  ['Windsurf and Claude (AI-assisted work)', 'Generating components and variants.', 'docs/COMPONENT_AUTHORING.md and scripts/new-component.mjs give an AI agent the rules and a template, so generated components follow the same file layout and token rules.'],
]

// Tools that are in use in this build. Rows marked as not adopted or not connected are listed on the page but not counted.
export const STACK_IN_USE = STACK.filter((r) => !/^Not (adopted|connected)/.test(r[2]))

const TOKENS: Row[] = [
  ['Primitive tokens (141)', 'tokens/primitive: color, dimension, effect, gradient, motion, typography.', 'Raw values. Nothing in a component refers to these directly.'],
  ['Semantic tokens (133)', 'tokens/semantic: color, dimension, effect, motion, typography.', 'Meaning, such as content, surface, border and action, aliasing primitives.'],
  ['Component tokens (405)', 'tokens/component: one JSON file per component.', 'The values each component reads. Edit these to restyle one component.'],
  ['Dark mode and density', 'tokens/modes/dark.json and density.json.', 'Overrides that build into dist/modes.css, with a WCAG contrast check during the build.'],
  ['Built outputs', 'dist/: primitive.css, semantic.css, component.css, modes.css, tokens.json, tokens.d.ts, gaps.json and lean/.', 'The CSS variables the components use, a typed token map, and a leaner build with duplicate values collapsed.'],
  ['Change log', 'tokens/CHANGELOG.md.', 'Written by the token edit tool for each applied change.'],
]

const SCRIPTS: Row[] = [
  ['verify-lib', 'npm run verify', 'Builds the library with esbuild, checks bundle size and tree-shaking, imports it in Node with no window, and checks focus rings, disabled states and full-width fields.'],
  ['check-package', 'npm run check:package', 'After a build: every file the package points at exists, and only dist is published.'],
  ['codemod-tokens', 'npm run codemod -- src [--write]', 'Replaces exact hard-coded colors, spacing, radii and border widths with semantic tokens. Dry run by default.'],
  ['gen-stack-map', 'runs inside npm run preview', 'Reads the component folders and writes the stack table and component map on this page and docs/COMPONENT_MAP.md.'],
  ['build-tokens', 'npm run build:tokens', 'Turns the token JSON into CSS variables, tokens.json and TypeScript types.'],
  ['build-modes', 'npm run build:modes', 'Builds dark mode and density CSS, validates that overridden tokens and aliases exist, and checks WCAG AA contrast.'],
  ['lean-tokens', 'npm run build:lean', 'Builds a lean token set that drops component tokens that only pass through to one semantic token. Source JSON is untouched.'],
  ['lint-tokens', 'npm run lint:tokens', 'Lints component CSS: errors on hard-coded colors, primitive tokens used directly, var() names that do not exist and bad z-index values. Warns on raw px, rem and ms values.'],
  ['check-components', 'npm run check:components', 'Compile-checks components with esbuild: TSX syntax, imports, CSS Modules and stories.'],
  ['smoke-test', 'npm run smoke', 'Runs every story through a minimal fake React to catch missing exports and bad props. It does not replace a browser test.'],
  ['new-component', 'npm run new:component', 'Creates a new component folder from the template.'],
  ['gen-index', 'npm run gen:index', 'Generates src/index.ts (the public exports) and fails on duplicate export names.'],
  ['apply-token-edits', 'npm run tokens:apply', 'Applies a token-edits file from the preview editor to the source token files and logs it.'],
  ['build-preview', 'npm run preview', 'Builds this preview as one HTML file with the token data and cost data inside.'],
  ['cost-report', 'runs inside the preview build', 'Reads usage logs, time windows and git history to feed the Cost page.'],
  ['publish', 'npm run publish:approved', 'Runs all checks and opens a pull request, only after approval.'],
]

const PREVIEW: Row[] = [
  ['Welcome', 'Index', 'Summary numbers and a map of the menu.'],
  ['Cost to build', 'Index', 'Model usage and people time, split into Claude and people, per token and per component.'],
  ['Analytics', 'Index', 'Token and component counts and coverage.'],
  ['Gaps and conflicts', 'Index', 'Tokens or decisions that disagree or are missing.'],
  ['Tech stack created and used', 'Index', 'This page.'],
  ['Foundations', 'Menu', 'Color, typography, spacing, effects and motion shown live from the tokens.'],
  ['Components', 'Menu', 'The full library of 62 items: 51 components, 8 charts, Icon, Portal and Visually Hidden, plus 16 product components counted from the DS sheet (78 in all). Component states are driven by the stories files.'],
  ['Data-Viz', 'Menu', 'The chart components.'],
  ['Token editor', 'Tool', 'Change any token in the preview, see it live, save edits in the browser, import or export them, and download an edits zip for Claude to apply.'],
]

type Comp = (typeof MAP.components)[number]
const yn = (b: boolean) => (b ? 'Yes' : '-')
const RUNTIME: Row[] = [
  ['React 18+', `${MAP.runtime.react} of ${MAP.components.length} components`, 'Peer dependency. Product apps bring their own copy.'],
  ['React DOM 18+', `${MAP.runtime['react-dom'].join(', ')} and ${MAP.runtime.primitives.join(', ')} (portals)`, 'Peer dependency, used only to render pop-ups on top of the page.'],
  ['Highcharts', 'The 8 charts (Data-Viz package)', 'Installed by the Data-Viz package, not by the main library. The main library has no other runtime library.'],
]

export function TechStackPage() {
  return (
    <div>
      <Section title="Tech stack created and used" note="The team created this whole stack in this workspace by leveraging skills built in Claude: the tokens, the 51 components with their CSS, stories and tests, the build and check scripts, the charts, and this preview. The same skills can edit any part of it on request, and GitHub holds the result. Below, each 6sense tool is matched to what was built to support it. Some pieces have not been run in the build environment, which has no real browser, tsc or Vitest, and they are marked.">
        <Table head={['Tool', 'Role at 6sense', 'How this build supports it']} rows={STACK} />
      </Section>
      <Section title="Tokens" note="The source of truth. Components only read tokens.">
        <Table head={['Item', 'Where', 'What it does']} rows={TOKENS} />
      </Section>
      <Section title="Component files (51 component folders)" note="Each component has the same five files, so any one can be read like any other.">
        <Table head={['File', 'Count', 'What it does']} rows={[
          ['Name.tsx', '51', 'The React component, typed, with typed props.'],
          ['Name.module.css', '51', 'Styling that reads only component tokens.'],
          ['Name.stories.tsx', '51', 'Storybook stories that also drive this preview.'],
          ['Name.test.tsx', '51', 'Tests for behavior and accessibility.'],
                  ['index.ts', '51', 'Public export.'],
        ]} />
      </Section>
      <Section title="Runtime libraries beyond React" note="What the library needs when it runs in a product. Generated from the component imports.">
        <Table head={['Library', 'Used by', 'How it is provided']} rows={RUNTIME} />
      </Section>
      <Section title="Components and the stack they use" note="What each component is built with. Counts are the distinct tokens its CSS reads. Generated by scripts/gen-stack-map.mjs.">
        <div style={{ overflowX: 'auto' }}>
          <table className="pv-table">
            <thead><tr>{['Component', 'CSS Module', 'Stories', 'Tests', 'Code Connect', 'Component tokens', 'Core tokens', 'Icons', 'Runtime'].map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{MAP.components.map((c: Comp) => <tr key={c.name}><td><strong>{c.name}</strong></td><td>{yn(c.files.cssModule)}</td><td>{yn(c.files.stories)}</td><td>{yn(c.files.tests)}</td><td>{yn(c.files.codeConnect)}</td><td>{c.componentTokens}</td><td>{c.coreTokens}</td><td>{yn(c.usesIcons)}</td><td>{c.runtime.join(', ') || '-'}</td></tr>)}</tbody>
          </table>
        </div>
      </Section>
      <Section title="Which components use each other" note="Built from the imports in each component. A change to a component can reach everything in its Used by column.">
        <table className="pv-table">
          <thead><tr><th scope="col">Component</th><th scope="col">Uses</th><th scope="col">Used by</th></tr></thead>
          <tbody>{MAP.components.map((c: Comp) => <tr key={c.name}><td><strong>{c.name}</strong></td><td>{c.uses.join(', ') || '-'}</td><td>{c.usedBy.join(', ') || '-'}</td></tr>)}</tbody>
        </table>
      </Section>
      <Section title="Build scripts and tools" note="All live in scripts/ and run through npm.">
        <Table head={['Script', 'Command', 'What it does']} rows={SCRIPTS} />
      </Section>
      <Section title="This preview" note="Pages and tools in the preview app.">
        <Table head={['Page', 'Where', 'What it does']} rows={PREVIEW} />
      </Section>
    </div>
  )
}
