import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Menu, MenuTrigger } from './Menu'
import { MenuItem, type MenuEntry } from './MenuList'
import { Button } from '../Button'
import { Icon } from '../../icons'

const ACTIONS: MenuEntry[] = [
  { value: 'edit', label: 'Edit segment', icon: <Icon name="edit" />, shortcut: 'E' },
  { value: 'duplicate', label: 'Duplicate', icon: <Icon name="copy" />, shortcut: 'D' },
  { value: 'export', label: 'Export as CSV', icon: <Icon name="download" /> },
  { value: 'archive', label: 'Archive', icon: <Icon name="inbox" />, disabled: true },
  { type: 'divider' },
  { value: 'delete', label: 'Delete segment', icon: <Icon name="trash" />, destructive: true },
]
const GROUPED: MenuEntry[] = [
  { type: 'group', label: 'Account lists', items: [{ value: 'target', label: 'Target accounts' }, { value: 'expansion', label: 'Expansion accounts' }] },
  { type: 'group', label: 'Contact lists', items: [{ value: 'champions', label: 'Champions' }, { value: 'execs', label: 'Executive sponsors' }, { value: 'blocked', label: 'Do not contact', disabled: true }] },
]
const INDUSTRIES: MenuEntry[] = [
  { value: 'saas', label: 'Software and SaaS' }, { value: 'fin', label: 'Financial services' }, { value: 'health', label: 'Healthcare' },
  { value: 'mfg', label: 'Manufacturing' }, { value: 'retail', label: 'Retail and ecommerce' }, { value: 'edu', label: 'Education' },
]
const NESTED: MenuEntry[] = [
  { value: 'rename', label: 'Rename' },
  { value: 'move', label: 'Move to folder', icon: <Icon name="file" />, items: [{ value: 'f1', label: 'Q4 campaigns' }, { value: 'f2', label: 'Enterprise plays' }, { value: 'f3', label: 'Archive' }] },
  { type: 'divider' },
  { value: 'delete', label: 'Delete', destructive: true },
]

const meta = {
  title: 'Action/Menu',
  component: Menu,
  parameters: { tier: 1, group: 'Action', description: 'List of actions or options in an overlay. Action mode runs commands. Selection mode picks one or many.' },
  args: { label: 'Segment actions', items: ACTIONS, defaultOpen: true, portal: false, trigger: <MenuTrigger>Actions</MenuTrigger> },
} satisfies Meta<typeof Menu>
export default meta
type Story = StoryObj<typeof meta>

/** Docs frame: positioned and tall enough for the open panel, so the overlay renders in place. */
const frame = { position: 'relative', minBlockSize: 340, padding: 16 } as const

export const ActionMenu: Story = { render: (args) => <div style={frame}><Menu {...args} /></div> }
export const IconOnlyTrigger: Story = {
  render: (args) => (
    <div style={frame}>
      <Menu {...args} trigger={<Button priority="secondary" iconOnly icon={<Icon name="moreVertical" />} aria-label="More actions" />} />
    </div>
  ),
}
export const GroupsAndDividers: Story = { render: (args) => <div style={frame}><Menu {...args} label="Lists" items={GROUPED} mode="single" defaultValue={['champions']} trigger={<MenuTrigger>Choose a list</MenuTrigger>} /></div> }
export const SingleSelection: Story = {
  name: 'Selection (single, radio behavior)',
  render: (args) => <div style={frame}><Menu {...args} label="Industry" items={INDUSTRIES} mode="single" defaultValue={['health']} trigger={<MenuTrigger>Industry</MenuTrigger>} /></div>,
}
export const MultiSelection: Story = {
  name: 'Selection (multi, checkbox behavior)',
  render: (args) => <div style={frame}><Menu {...args} label="Industries" items={INDUSTRIES} mode="multi" defaultValue={['saas', 'fin']} trigger={<MenuTrigger>Industries</MenuTrigger>} /></div>,
}
export const Searchable: Story = {
  render: (args) => {
    function Demo() {
      const [q, setQ] = useState('an')
      return <div style={frame}><Menu {...args} label="Industries" items={INDUSTRIES} mode="single" searchable query={q} onQueryChange={setQ} trigger={<MenuTrigger>Industry</MenuTrigger>} /></div>
    }
    return <Demo />
  },
}
export const NoResults: Story = {
  render: (args) => <div style={frame}><Menu {...args} label="Industries" items={INDUSTRIES} mode="single" searchable query="zzz" trigger={<MenuTrigger>Industry</MenuTrigger>} /></div>,
}
export const WithCreateOption: Story = {
  render: (args) => <div style={frame}><Menu {...args} label="Industries" items={INDUSTRIES} mode="single" searchable query="Aerospace" onCreate={() => undefined} trigger={<MenuTrigger>Industry</MenuTrigger>} /></div>,
}
export const Loading: Story = {
  render: (args) => <div style={frame}><Menu {...args} label="Industries" items={[]} mode="single" loading trigger={<MenuTrigger>Industry</MenuTrigger>} /></div>,
}
export const NestedSubmenu: Story = {
  name: 'Nested submenu (one level)',
  render: (args) => <div style={{ ...frame, minBlockSize: 280 }}><Menu {...args} label="Row actions" items={NESTED} defaultOpenSubmenu="move" trigger={<MenuTrigger>Row actions</MenuTrigger>} /></div>,
}

const STATES = [undefined, 'hover', 'focus', 'pressed'] as const
export const ItemStates: Story = {
  name: 'Item states (forced)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 24 }}>
      {(['none', 'single', 'multi'] as const).map((sel) => (
        <ul key={sel} role={sel === 'none' ? 'menu' : 'listbox'} aria-label={`Item states, ${sel}`} aria-multiselectable={sel === 'multi' || undefined} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
          {STATES.map((s) => <MenuItem key={String(s)} label={s ? `${s[0].toUpperCase()}${s.slice(1)}` : 'Default'} selection={sel} data-state={s} icon={sel === 'none' ? <Icon name="edit" /> : undefined} />)}
          <MenuItem label="Selected" selection={sel === 'none' ? 'single' : sel} selected />
          <MenuItem label="Disabled" selection={sel} disabled description="Not available on this plan" />
          <MenuItem label="Destructive" selection={sel} destructive icon={sel === 'none' ? <Icon name="trash" /> : undefined} />
        </ul>
      ))}
    </div>
  ),
}
export const Interactive: Story = {
  name: 'Interactive (portal)',
  args: { defaultOpen: false, portal: true },
  render: (args) => <div style={{ padding: 16 }}><Menu {...args} /></div>,
}
