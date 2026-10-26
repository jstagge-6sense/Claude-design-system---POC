import { InsightCard } from '../components/InsightCard'

export function App() {
  return (
    <main style={{ padding: 24, display: 'grid', gap: 16, maxInlineSize: 560, fontFamily: 'var(--core-typography-fontFamily-sans)' }}>
      <h1>Intelligence library</h1>
      <InsightCard title="Acme Corp is researching your category" summary="Three buying-group members visited pricing pages this week." source="Intent signals" />
      <InsightCard title="Northwind went quiet after the demo" summary="No replies in 14 days. A follow-up from the account owner is due." source="Revvy AI" actionLabel="Draft follow-up" />
    </main>
  )
}
