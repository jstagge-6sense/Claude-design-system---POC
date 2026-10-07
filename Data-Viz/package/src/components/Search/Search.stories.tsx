import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Search, type SearchResult } from './Search'
import { Button } from '../Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Data entry/Search',
  component: Search,
  parameters: { tier: 1, group: 'Data entry', description: 'Find content, records or filters by keyword. Debounced search, inline loader, keyboard-navigable results, scope slot.' },
  args: { label: 'Search segments', placeholder: 'Search segments' },
  decorators: [(Story) => <div style={{ maxInlineSize: 420, minBlockSize: 120 }}><Story /></div>],
} satisfies Meta<typeof Search>
export default meta
type Story = StoryObj<typeof meta>

const DATA: SearchResult[] = [
  { id: '1', label: 'Enterprise accounts in EMEA', description: '1,240 accounts', icon: <Icon name="building" /> },
  { id: '2', label: 'Enterprise renewals Q4', description: '312 accounts', icon: <Icon name="building" /> },
  { id: '3', label: 'Enterprise champions', description: '86 contacts', icon: <Icon name="users" /> },
  { id: '4', label: 'Mid-market, late-stage intent', description: '2,031 accounts', icon: <Icon name="trendUp" /> },
]
const col = { display: 'grid', gap: 24, maxInlineSize: 420 } as const

export const Basic: Story = {}
export const WithClearButton: Story = { args: { defaultValue: 'enterprise' } }
export const WithResults: Story = {
  name: 'Results listbox (open)',
  args: { defaultValue: 'enterprise', results: DATA, defaultOpen: true },
  decorators: [(Story) => <div style={{ maxInlineSize: 420, minBlockSize: 340 }}><Story /></div>],
}
export const NoResults: Story = {
  name: 'No results (open)',
  args: { defaultValue: 'zzz', results: [], defaultOpen: true },
  decorators: [(Story) => <div style={{ maxInlineSize: 420, minBlockSize: 160 }}><Story /></div>],
}
export const Searching: Story = { name: 'Searching (inline loader)', args: { defaultValue: 'enterprise', loading: true } }
export const LiveDebounced: Story = {
  name: 'Live: debounced search with loader',
  render: (args) => {
    const Demo = () => {
      const [results, setResults] = useState<SearchResult[] | undefined>(undefined)
      const [loading, setLoading] = useState(false)
      const [last, setLast] = useState('')
      return (
        <div style={col}>
          <Search
            {...args}
            helperText={last ? `Last search: “${last}” (fires 300 ms after you stop typing)` : 'Type "enterprise" or something else.'}
            loading={loading}
            results={results}
            onSearch={(q) => {
              setLast(q)
              if (!q) { setResults(undefined); setLoading(false); return }
              setLoading(true)
              setTimeout(() => { setResults(DATA.filter((d) => d.label.toLowerCase().includes(q.toLowerCase()))); setLoading(false) }, 600)
            }}
          />
        </div>
      )
    }
    return <div style={{ minBlockSize: 340 }}><Demo /></div>
  },
}
export const WithScope: Story = {
  name: 'With scope filter',
  args: {
    scope: <Button priority="tertiary" size="small" trailingIcon={<Icon name="chevronDown" />}>All objects</Button>,
    defaultValue: 'renewals',
  },
}
export const GlobalVsContextual: Story = {
  name: 'Global vs contextual',
  render: (args) => (
    <div style={col}>
      <Search {...args} variant="global" label="Search everything" placeholder="Search accounts, segments, campaigns" helperText="Global: pill shape, sits above the page. Searches the whole workspace." />
      <Search {...args} variant="contextual" label="Filter this table" placeholder="Filter accounts" helperText="Contextual: filters the table next to it." />
    </div>
  ),
}
export const Sizes: Story = {
  render: (args) => (
    <div style={col}>
      <Search {...args} size="medium" label="Search (medium)" />
      <Search {...args} size="small" label="Search (small, dense layouts)" />
    </div>
  ),
}
export const Disabled: Story = { args: { disabled: true, defaultValue: 'enterprise' } }

const ROWS: Array<{ name: string; props: Record<string, unknown>; state?: 'hover' | 'focus' }> = [
  { name: 'Default', props: {} },
  { name: 'Hover (forced)', props: {}, state: 'hover' },
  { name: 'Focus (forced)', props: {}, state: 'focus' },
  { name: 'Filled', props: { defaultValue: 'enterprise' } },
  { name: 'Searching', props: { defaultValue: 'enterprise', loading: true } },
  { name: 'Disabled', props: { disabled: true } },
]
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))', gap: 24 }}>
      {['contextual', 'global'].flatMap((v) => ROWS.map((r) => (
        <Search key={v + r.name} {...args} {...r.props} variant={v as 'global' | 'contextual'} label={`${v} ${r.name}`} showLabel data-state={r.state} />
      )))}
    </div>
  ),
}
