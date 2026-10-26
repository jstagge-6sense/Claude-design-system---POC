import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'
import type { MenuEntry } from '../Menu'

const STAGES: MenuEntry[] = [
  { value: 'awareness', label: 'Awareness' }, { value: 'consideration', label: 'Consideration' }, { value: 'decision', label: 'Decision' },
  { value: 'purchase', label: 'Purchase' }, { value: 'retention', label: 'Retention' },
]
const GROUPED: MenuEntry[] = [
  { type: 'group', label: 'Americas', items: [{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }, { value: 'br', label: 'Brazil' }] },
  { type: 'group', label: 'Europe', items: [{ value: 'uk', label: 'United Kingdom' }, { value: 'de', label: 'Germany' }, { value: 'fr', label: 'France' }] },
]

const meta = {
  title: 'Data entry/Select',
  component: Select,
  parameters: { tier: 1, group: 'Data entry', description: 'Choose exactly one option from a list. Built on Menu in selection mode and the shared field shell.' },
  args: { label: 'Buying stage', items: STAGES, placeholder: 'Choose a stage', helperText: 'Used to group accounts in reports.' },
  decorators: [(Story) => <div style={{ maxInlineSize: 360, position: 'relative' }}><Story /></div>],
} satisfies Meta<typeof Select>
export default meta
type Story = StoryObj<typeof meta>

const col = { display: 'grid', gap: 24, maxInlineSize: 360 } as const
/** Space under the field so an open list renders in place without overlapping the next story. */
const open = { defaultOpen: true, portal: false } as const
const tall = { minBlockSize: 380 } as const

export const Standard: Story = { render: (args) => <div style={tall}><Select {...args} {...open} defaultValue="consideration" /></div> }
export const Closed: Story = { args: { defaultValue: 'decision' } }
export const Searchable: Story = { render: (args) => <div style={tall}><Select {...args} {...open} searchable label="Country" items={GROUPED} placeholder="Search countries" /></div> }
export const WithGroups: Story = { render: (args) => <div style={tall}><Select {...args} {...open} label="Country" items={GROUPED} defaultValue="de" helperText={undefined} /></div> }
export const WithCreateOption: Story = {
  render: (args) => {
    function Demo() {
      const [items, setItems] = useState<MenuEntry[]>(STAGES)
      const [value, setValue] = useState('')
      return (
        <div style={tall}>
          <Select
            {...args}
            {...open}
            searchable
            label="Segment owner team"
            items={items}
            value={value}
            onValueChange={setValue}
            onCreate={(q) => { const v = q.toLowerCase().replace(/\s+/g, '-'); setItems([...items, { value: v, label: q }]); setValue(v) }}
          />
        </div>
      )
    }
    return <Demo />
  },
}
export const Small: Story = { render: (args) => <div style={tall}><Select {...args} {...open} size="small" defaultValue="awareness" /></div> }
export const Loading: Story = { render: (args) => <div style={tall}><Select {...args} {...open} loading items={[]} placeholder="Loading stages" helperText={undefined} /></div> }
export const Disabled: Story = { args: { disabled: true, defaultValue: 'purchase', helperText: 'Stages are locked while the import runs.' } }
export const ErrorState: Story = { args: { error: 'Choose a buying stage to continue.', requirement: 'required' } }
export const StateMatrix: Story = {
  name: 'States (forced)',
  decorators: [(Story) => <Story />],
  render: (args) => (
    <div style={col}>
      <Select {...args} label="Default" helperText={undefined} />
      <Select {...args} label="Hover" data-state="hover" helperText={undefined} />
      <Select {...args} label="Focused" data-state="focus" helperText={undefined} />
      <Select {...args} label="Selected" defaultValue="decision" helperText={undefined} />
      <Select {...args} label="Error" error="Choose a buying stage." helperText={undefined} />
      <Select {...args} label="Disabled" disabled helperText={undefined} />
    </div>
  ),
}
