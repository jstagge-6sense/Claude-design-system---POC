import { Input } from '../components/Input'

type Opts = Record<string, unknown>
const HELP = 'This is the help text. It opens in a popover when you hover the icon.'
const MARKERS: Array<[string, Opts]> = [
  ['No marker', {}],
  ['Required (red * in front)', { requirement: 'required' }],
  ['Optional (after the label)', { requirement: 'optional' }],
]
const STATES: Array<[string, Opts]> = [
  ['Helper text', { helperText: 'We send sign-in links to this address.' }],
  ['Info', { info: 'Use your company address.' }],
  ['Success', { success: 'This address is available.' }],
  ['Warning', { warning: 'This looks like a personal address.' }],
  ['Error', { error: 'Enter an email address like name@company.com.' }],
]
const render = (o: Opts) => <Input label="Work email" placeholder="name@company.com" {...o} />
const gridFor = (cols: number) => ({ display: 'grid', gap: '20px 32px', gridTemplateColumns: `160px repeat(${cols}, minmax(240px, 1fr))`, alignItems: 'start', minInlineSize: 160 + cols * 272 } as const)
const cell = { display: 'grid', gap: 4, alignContent: 'start' } as const

function Matrix({ rows, second, headers }: { rows: Array<[string, Opts]>; second?: (o: Opts) => Opts; headers: [string, string?] }) {
  return (
    <div style={{ overflowX: 'auto', paddingBlockEnd: 8 }}><div style={gridFor(second ? 2 : 1)}>
      <span /><strong>{headers[0]}</strong>{second ? <strong>{headers[1]}</strong> : null}
      {rows.map(([label, o]) => (
        <div key={label} style={{ display: 'contents' }}>
          <small className="pv-muted" style={{ paddingBlockStart: 4 }}>{label}</small>
          <div style={cell}>{render(o)}</div>
          {second ? <div style={cell}>{render(second(o))}</div> : null}
        </div>
      ))}
    </div></div>
  )
}

export function FieldLabelsPage() {
  return (
    <div>
      <section className="pv-section">
        <h2>Field labels and helper text</h2>
        <p className="pv-muted">Shown on Input. Required shows a red * in front of the label. Optional shows (optional) after it. <code>help</code> adds an info icon at the end of the label; hover or focus it to open the help text in a popover.</p>
      </section>
      <section className="pv-section">
        <h2>Label markers</h2>
        <Matrix rows={MARKERS} second={(o) => ({ ...o, help: HELP })} headers={['Label only', 'Label with help icon']} />
      </section>
      <section className="pv-section">
        <h2>Helper text states</h2>
        <p className="pv-muted"><code>info</code>, <code>success</code>, <code>warning</code> and <code>error</code> each show a message with an icon and color. When one is set, the helper text is not shown.</p>
        <Matrix rows={STATES} headers={['Helper text states']} />
      </section>
    </div>
  )
}
