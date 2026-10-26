import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { InfiniteScroll, type InfiniteScrollStatus } from './InfiniteScroll'

const meta = {
  title: 'Patterns/Infinite Scroll',
  component: InfiniteScroll,
  parameters: {
    tier: 0,
    group: 'Patterns',
    description: 'Loads more content as the user scrolls, with a Load more button as the always-available keyboard alternative.',
  },
  args: { onLoadMore: () => undefined, children: null },
} satisfies Meta<typeof InfiniteScroll>
export default meta
type Story = StoryObj<typeof meta>

const row = { padding: '12px 0', margin: 0 } as const
const frame = { blockSize: 360, overflowY: 'auto', maxInlineSize: 480, boxSizing: 'border-box' } as const

const Items = ({ count }: { count: number }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {Array.from({ length: count }, (_, i) => <li key={i} style={row}>Account list item {i + 1}</li>)}
  </ul>
)

const TOTAL = 200
const BATCH = 20

/** Live demo. The footer slot note: content a user must reach (links, legal, actions) goes in `footer`, which stays pinned inside the scroll area while the list grows. */
const LiveDemo = ({ failFirst = false, withFooter = true }: { failFirst?: boolean; withFooter?: boolean }) => {
  const [count, setCount] = useState(40)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const failed = useRef(!failFirst)
  const scroller = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const load = () => {
    if (loading) return
    setError(false)
    setLoading(true)
    timer.current = setTimeout(() => {
      setLoading(false)
      if (!failed.current) { failed.current = true; setError(true); return }
      setCount((c) => Math.min(TOTAL, c + BATCH))
    }, 900)
  }
  return (
    <div ref={scroller} style={frame}>
      <InfiniteScroll
        onLoadMore={load}
        loading={loading}
        error={error}
        hasMore={count < TOTAL}
        count={count}
        total={TOTAL}
        getScrollParent={() => scroller.current}
        footer={withFooter ? <span>Footer: terms, privacy and support stay reachable.</span> : undefined}
      >
        <Items count={count} />
      </InfiniteScroll>
    </div>
  )
}

export const Interactive: Story = { render: () => <LiveDemo />, parameters: { description: 'Scroll the frame or use Load more. 40 of 200 items start loaded. The footer slot stays pinned so it remains reachable.' } }
export const ErrorThenRetry: Story = { name: 'Error then retry', render: () => <LiveDemo failFirst /> }

const STATES: Array<{ status: InfiniteScrollStatus; title: string; count: number; hasMore: boolean }> = [
  { status: 'idle', title: 'Idle', count: 40, hasMore: true },
  { status: 'loading', title: 'Loading', count: 40, hasMore: true },
  { status: 'loaded', title: 'Loaded', count: 60, hasMore: true },
  { status: 'end', title: 'End of content', count: 200, hasMore: false },
  { status: 'error', title: 'Error', count: 40, hasMore: true },
]
const forcedStory = (s: (typeof STATES)[number]): Story => ({
  render: () => (
    <div style={{ maxInlineSize: 480 }}>
      <InfiniteScroll onLoadMore={() => undefined} status={s.status} hasMore={s.hasMore} count={s.count} total={TOTAL}>
        <Items count={3} />
      </InfiniteScroll>
    </div>
  ),
})
export const Idle: Story = forcedStory(STATES[0])
export const Loading: Story = forcedStory(STATES[1])
export const Loaded: Story = forcedStory(STATES[2])
export const EndOfContent: Story = { ...forcedStory(STATES[3]), name: 'End of content' }
export const ErrorState: Story = { ...forcedStory(STATES[4]), name: 'Error' }

export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, maxInlineSize: 960 }}>
      {STATES.map((s) => (
        <section key={s.status} aria-label={s.title}>
          <h4 style={{ margin: '0 0 8px' }}>{s.title}</h4>
          <InfiniteScroll onLoadMore={() => undefined} status={s.status} hasMore={s.hasMore} count={s.count} total={TOTAL}>
            <Items count={2} />
          </InfiniteScroll>
        </section>
      ))}
    </div>
  ),
}
