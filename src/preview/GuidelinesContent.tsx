import type { ReactNode } from 'react'
import { Accordion, AccordionItem } from '../components/Accordion'
import { GUIDELINES } from './guidelines'
import { ANATOMY_DIAGRAMS, LiveAnatomy } from './AnatomyDiagram'
import './guidelines.css'

/** The guidelines for one component: purpose block and collapsed sections. Shared by the preview modal and the Storybook page. */
export function GuidelinesContent({ folder, renderPreview }: { folder: string; renderPreview?: (story?: string) => ReactNode }) {
  const g = GUIDELINES[folder]
  if (!g) return null
  return (
    <>
      <section className="pv-guide-purpose" aria-labelledby="pv-guide-purpose-h">
        <h5 id="pv-guide-purpose-h">Purpose</h5>
        <p>{g.summary}</p>
        {g.usedFor || g.why ? (
          <dl>
            {g.usedFor ? <><dt>Used for</dt><dd>{g.usedFor}</dd></> : null}
            {g.why ? <><dt>Why it works this way</dt><dd>{g.why}</dd></> : null}
          </dl>
        ) : null}
      </section>
      <Accordion key={folder} type="multiple" expandAll headingLevel={3}>
        {g.sections.map((s) => (
          <AccordionItem key={s.title} value={s.title} title={s.title} description={s.intro || undefined}>
            <div className="pv-guide-sec">
              {s.anatomy ? (() => { const D = ANATOMY_DIAGRAMS[s.anatomy.diagram]; const live = s.anatomy.diagram === 'live' && renderPreview ? renderPreview(s.anatomy.story) : null; return (
                <>
                  {D ? <D /> : live ? <LiveAnatomy parts={s.anatomy.parts}>{live}</LiveAnatomy> : null}
                  <ol className="pv-anat-list">{s.anatomy.parts.map((a, i) => <li key={a.name}><span className="pv-anat-n" aria-hidden="true">{i + 1}</span><div><h4>{a.name}</h4><p>{a.text}</p></div></li>)}</ol>
                </>) })() : null}
              {s.bullets ? <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}
              {s.groups?.map((gr) => <div key={gr.label}><h4>{gr.label}</h4><ul>{gr.bullets.map((b) => <li key={b}>{b}</li>)}</ul></div>)}
              {s.table ? <table><thead><tr>{s.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{s.table.rows.map((r) => <tr key={r[0]}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody></table> : null}
              {s.props ? <p className="pv-guide-props">{s.props.map((p) => <code key={p}>{p}</code>)}</p> : null}
              {s.note ? <p><strong>{s.note.label}.</strong> {s.note.text}</p> : null}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}
