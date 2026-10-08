import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MultiSelect } from './MultiSelect'
import type { MenuEntry } from '../Menu'

const INDUSTRIES: MenuEntry[] = [
  { value: 'saas', label: 'Software and SaaS' }, { value: 'fin', label: 'Financial services' }, { value: 'health', label: 'Healthcare' },
  { value: 'mfg', label: 'Manufacturing' }, { value: 'retail', label: 'Retail and ecommerce' }, { value: 'edu', label: 'Education' },
]
const GROUPED: MenuEntry[] = [
  { type: 'group', label: 'Technology', items: [{ value: 'saas', label: 'Software and SaaS' }, { value: 'hw', label: 'Hardware' }, { value: 'sec', label: 'Cybersecurity' }] },
  { type: 'group', label: 'Services', items: [{ value: 'fin', label: 'Financial services' }, { value: 'health', label: 'Healthcare' }, { value: 'edu', label: 'Education' }] },
]
const MANY: MenuEntry[] = Array.from({ length: 48 }, (_, i) => ({ value: `acct-${i + 1}`, label: `Territory ${String(i + 1).padStart(2, '0')}` }))

const meta = {
  title: 'Data entry/Multi-select',
  component: MultiSelect,
  parameters: { tier: 2, group: 'Data entry', description: 'Choose several options. The list stays open, with Select all, Clear all, a count and dismissible chips.' },
  args: { label: 'Industries', items: INDUSTRIES, placeholder: 'Choose industries', helperText: 'Targeting applies to every selected industry.' },
  decorators: [(Story) => <div style={{ maxInlineSize: 420, position: 'relative' }}><Story /></div>],
} satisfies Meta<typeof MultiSelect>
export default meta
type Story = StoryObj<typeof meta>

const open = { defaultOpen: true, portal: false } as const
const tall = { minBlockSize: 460 } as const

export const Standard: Story = { render: (args) => <div style={tall}><MultiSelect {...args} {...open} defaultValue={['saas', 'health']} /></div> }
export const Closed: Story = { args: { defaultValue: ['saas', 'fin'] } }
export const Empty: Story = { args: {} }
export const Searchable: Story = { render: (args) => <div style={tall}><MultiSelect {...args} {...open} searchable defaultValue={['edu']} /></div> }
export const WithGroups: Story = { render: (args) => <div style={tall}><MultiSelect {...args} {...open} items={GROUPED} defaultValue={['hw', 'fin']} /></div> }
export const AllSelected: Story = { args: { defaultValue: INDUSTRIES.map((i) => ('value' in i ? i.value : '')) } }
export const ManySelections: Story = {
  name: 'Many selections (count and chip overflow)',
  render: (args) => {
    function Demo() {
      const [value, setValue] = useState(MANY.slice(0, 31).map((i) => ('value' in i ? i.value : '')))
      return <div style={tall}><MultiSelect {...args} {...open} label="Sales territories" items={MANY} value={value} onValueChange={setValue} helperText="Use Selected only to review a long selection." /></div>
    }
    return <Demo />
  },
}
export const ErrorState: Story = { args: { error: 'Choose at least one industry.', requirement: 'required' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: ['saas', 'fin'], helperText: 'Industries are locked while the list syncs.' } }
export const Loading: Story = { render: (args) => <div style={tall}><MultiSelect {...args} {...open} loading items={[]} placeholder="Loading industries" helperText={undefined} /></div> }
export const Small: Story = { args: { size: 'small', defaultValue: ['saas'] } }
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gap: 24, maxInlineSize: 420 }}>
      <MultiSelect {...args} label="Default" helperText={undefined} />
      <MultiSelect {...args} label="Hover" data-state="hover" helperText={undefined} />
      <MultiSelect {...args} label="Focused" data-state="focus" helperText={undefined} />
      <MultiSelect {...args} label="Partially selected" defaultValue={['saas', 'fin']} helperText={undefined} />
      <MultiSelect {...args} label="All selected" defaultValue={INDUSTRIES.map((i) => ('value' in i ? i.value : ''))} helperText={undefined} />
      <MultiSelect {...args} label="Error" error="Choose at least one industry." helperText={undefined} />
      <MultiSelect {...args} label="Disabled" disabled defaultValue={['saas']} helperText={undefined} />
    </div>
  ),
}
