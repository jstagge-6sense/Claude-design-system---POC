// Story helpers shared by the Wave 2 overlay stories (Dialog, Drawer, SidePanel, Toast, Banner). Not exported from the library.
import type { CSSProperties, ReactNode } from 'react'
import { Button } from '../Button'
import { Badge } from '../Badge'
import { Icon } from '../../icons'

/** A positioned frame so in-place overlays (portal={false}) have something to sit on. Layout styles only. */
export function Frame({ children, height = 520, width, style }: { children: ReactNode; height?: number | string; width?: number | string; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'relative', overflow: 'hidden', isolation: 'isolate', blockSize: height, inlineSize: width ?? '100%',
        border: '1px solid var(--core-color-border-standard)', borderRadius: 'var(--core-dimension-radius-surface-medium)',
        background: 'var(--core-color-surface-page)', ...style,
      }}
    >
      {children}
    </div>
  )
}

const ROWS = [
  { name: 'Enterprise SaaS, North America', accounts: '1,284', status: 'Active' },
  { name: 'Mid-market fintech, EMEA', accounts: '642', status: 'Active' },
  { name: 'Healthcare, new buying group', accounts: '318', status: 'Paused' },
  { name: 'Churn risk, last 90 days', accounts: '97', status: 'Active' },
]

/** Synthetic sample page behind overlays. */
export function SamplePage({ title = 'Target segments', action = true }: { title?: string; action?: boolean }) {
  return (
    <div style={{ padding: 'var(--core-dimension-space-spacious)', display: 'flex', flexDirection: 'column', gap: 'var(--core-dimension-space-standard)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--core-dimension-space-standard)' }}>
        <h1 style={{ margin: 0, font: 'var(--core-typography-heading-2-font, inherit)' }}>{title}</h1>
        {action ? <Button priority="primary" icon={<Icon name="plus" />}>Create segment</Button> : null}
      </div>
      <p style={{ margin: 0 }}>Segments group accounts by fit and intent so campaigns reach the right buying groups.</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--core-dimension-space-compact)' }}>
        {ROWS.map((r) => (
          <li key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--core-dimension-space-standard)', padding: 'var(--core-dimension-space-comfortable)', background: 'var(--core-color-surface-card)', borderRadius: 'var(--core-dimension-radius-control-medium)' }}>
            <span>{r.name}</span>
            <span style={{ display: 'flex', gap: 'var(--core-dimension-space-compact)', alignItems: 'center' }}>
              <span>{r.accounts} accounts</span>
              <Badge kind="status" tone={r.status === 'Active' ? 'success' : 'neutral'}>{r.status}</Badge>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
