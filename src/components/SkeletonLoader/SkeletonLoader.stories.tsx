import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SkeletonLoader, SkeletonText, SkeletonBlock } from './SkeletonLoader'
import { Button } from '../Button'

const meta = {
  title: 'Feedback/SkeletonLoader',
  component: SkeletonLoader,
  parameters: { tier: 2, group: 'Feedback and status', description: 'Placeholder that mimics incoming content. Calm shimmer, static for reduced motion. Never combine with a spinner.' },
} satisfies Meta<typeof SkeletonLoader>
export default meta
type Story = StoryObj<typeof meta>

const frame = { inlineSize: 420 } as const

export const Text: Story = { render: () => <div style={frame}><SkeletonLoader variant="text" lines={4} /></div> }
export const Card: Story = { render: () => <div style={frame}><SkeletonLoader variant="card" lines={3} label="Loading account summary" /></div> }
export const Table: Story = { render: () => <div style={{ inlineSize: 560 }}><SkeletonLoader variant="table" rows={5} columns={4} label="Loading accounts" /></div> }
export const Custom: Story = {
  render: () => (
    <div style={frame}>
      <SkeletonLoader variant="custom" label="Loading profile">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <SkeletonBlock shape="circle" width={48} height={48} />
          <div style={{ flex: 1 }}><SkeletonText lines={2} /></div>
        </div>
        <SkeletonBlock height={96} />
      </SkeletonLoader>
    </div>
  ),
}

function LoadedDemo() {
  const [loading, setLoading] = useState(true)
  return (
    <div style={{ ...frame, display: 'grid', gap: 16 }}>
      <Button priority="secondary" size="small" onClick={() => setLoading(!loading)}>{loading ? 'Show loaded content' : 'Show skeleton'}</Button>
      <SkeletonLoader variant="card" loading={loading} label="Loading account summary">
        <div>
          <strong>Northwind Logistics</strong>
          <p style={{ margin: '4px 0 0' }}>Late buying stage. 12 contacts engaged this week.</p>
        </div>
      </SkeletonLoader>
    </div>
  )
}
export const LoadedTransition: Story = { render: () => <LoadedDemo /> }

export const Variants: Story = {
  name: 'Variants (matrix)',
  render: () => (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(2, minmax(0, 360px))' }}>
      <SkeletonLoader variant="text" lines={3} />
      <SkeletonLoader variant="card" />
      <SkeletonLoader variant="table" rows={3} columns={3} />
      <SkeletonLoader variant="custom"><SkeletonBlock shape="circle" width={40} height={40} /><SkeletonText lines={2} /></SkeletonLoader>
    </div>
  ),
}
