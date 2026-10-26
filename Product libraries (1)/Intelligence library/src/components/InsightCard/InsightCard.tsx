import type { ReactNode } from 'react'
import { Badge, Button, Card } from '../../base'
import styles from './InsightCard.module.css'

export interface InsightCardProps {
  /** What the insight says, in one line. */
  title: string
  /** Why it matters, in a sentence or two. */
  summary: ReactNode
  /** Where the insight comes from, for example "Intent signals". */
  source?: string
  /** Label for the main action. Verb plus noun. */
  actionLabel?: string
  onAction?: () => void
}

/** Example composed component: base Card, Badge and Button only. No styles of its own except through base tokens. */
export function InsightCard({ title, summary, source, actionLabel = 'View account', onAction }: InsightCardProps) {
  return (
    <Card compact title={title} headerAction={source ? <Badge kind="category">{source}</Badge> : undefined}
      actions={<Button priority="secondary" size="small" onClick={onAction}>{actionLabel}</Button>}>
      <p className={styles.summary}>{summary}</p>
    </Card>
  )
}
