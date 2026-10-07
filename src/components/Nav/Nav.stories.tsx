import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Nav, type NavGroup, type NavProps } from './Nav'
import { useNavCollapsed } from './useNavCollapsed'
import { Icon } from '../../icons'

const meta = {
  title: 'Navigation and structure/Nav',
  component: Nav,
  parameters: {
    tier: 1,
    group: 'Navigation and structure',
    description: 'Sidebar for page navigation: fixed or collapsible to an icon rail, groups, badges and two levels of nesting. Interim until the Information Architecture redesign.',
  },
} satisfies Meta<typeof Nav>
export default meta
type Story = StoryObj<typeof meta>

const icon = (name: Parameters<typeof Icon>[0]['name']) => <Icon name={name} />

const GROUPS: NavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Dashboard', icon: icon('home'), href: '#dashboard' },
      { id: 'accounts', label: 'Accounts', icon: icon('building'), href: '#accounts', badge: 12, badgeLabel: '12 need review' },
      { id: 'segments', label: 'Segments', icon: icon('users'), href: '#segments' },
    ],
  },
  {
    id: 'engage',
    label: 'Engage',
    items: [
      { id: 'campaigns', label: 'Campaigns', icon: icon('sparkle'), href: '#campaigns' },
      { id: 'inbox', label: 'Inbox', icon: icon('inbox'), href: '#inbox', badge: 3, badgeLabel: '3 unread' },
      { id: 'reports', label: 'Reports', icon: icon('trendUp'), href: '#reports' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { id: 'settings', label: 'Settings', icon: icon('settings'), href: '#settings' },
      { id: 'billing', label: 'Billing', icon: icon('file'), disabled: true },
    ],
  },
]

const NESTED: NavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Dashboard', icon: icon('home'), href: '#dashboard' },
      {
        id: 'accounts', label: 'Accounts', icon: icon('building'),
        children: [
          { id: 'accounts-all', label: 'All accounts', href: '#accounts' },
          { id: 'accounts-watch', label: 'Watchlist', href: '#watchlist', badge: 4, badgeLabel: '4 changes' },
          { id: 'accounts-import', label: 'Imports', href: '#imports' },
        ],
      },
      {
        id: 'reports', label: 'Reports', icon: icon('trendUp'),
        children: [
          { id: 'reports-pipeline', label: 'Pipeline', href: '#pipeline' },
          { id: 'reports-intent', label: 'Intent trends', href: '#intent' },
        ],
      },
      { id: 'settings', label: 'Settings', icon: icon('settings'), href: '#settings' },
    ],
  },
]

function Frame({ children, dir }: { children: ReactNode; dir?: 'rtl' | 'ltr' }) {
  return (
    <div dir={dir} style={{ display: 'flex', blockSize: '26rem', border: '1px dashed currentColor', overflow: 'hidden' }}>
      {children}
      <main style={{ flex: 1, padding: '1rem' }}>
        <h2 style={{ margin: 0 }}>Segments</h2>
        <p>Page content sits beside the navigation. Use Tab to enter the sidebar, then the arrow keys to move between items.</p>
      </main>
    </div>
  )
}

export const Fixed: Story = {
  args: { groups: GROUPS, currentId: 'segments' },
  render: (args) => <Frame><Nav {...args} /></Frame>,
}

function CollapsibleDemo(args: NavProps) {
  const [collapsed, setCollapsed] = useNavCollapsed(false, 'ds.nav.story')
  const [current, setCurrent] = useState('segments')
  return (
    <Frame>
      <Nav {...args} collapsible collapsed={collapsed} onCollapsedChange={setCollapsed} currentId={current} onNavigate={(item, e) => { e.preventDefault(); setCurrent(item.id) }} />
    </Frame>
  )
}
export const Collapsible: Story = {
  args: { groups: GROUPS },
  render: (args) => <CollapsibleDemo {...args} />,
}

export const CollapsedRail: Story = {
  name: 'Collapsed (icon rail)',
  args: { groups: GROUPS, currentId: 'campaigns', collapsible: true, collapsed: true },
  render: (args) => <Frame><Nav {...args} /></Frame>,
}

export const WithGroups: Story = {
  args: { groups: [GROUPS[0], { ...GROUPS[1], label: undefined }, GROUPS[2]], currentId: 'home' },
  render: (args) => <Frame><Nav {...args} /></Frame>,
}

export const WithBadges: Story = {
  args: { groups: GROUPS, currentId: 'inbox' },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Frame><Nav {...args} /></Frame>
      <Frame><Nav {...args} collapsible collapsed /></Frame>
    </div>
  ),
}

export const WithNestedItems: Story = {
  args: { groups: NESTED, currentId: 'accounts-watch' },
  render: (args) => <Frame><Nav {...args} /></Frame>,
}

export const RightToLeft: Story = {
  name: 'RTL (nav on the end edge)',
  args: { groups: GROUPS, currentId: 'segments', collapsible: true },
  render: (args) => <Frame dir="rtl"><Nav {...args} /></Frame>,
}

const matrixGroups = (state?: 'hover' | 'pressed' | 'focus'): NavGroup[] => [
  { id: 'm', items: [{ id: 'm-item', label: state ? state[0].toUpperCase() + state.slice(1) : 'Default', icon: icon('home'), href: '#', state }] },
]
export const StateMatrix: Story = {
  name: 'States (forced)',
  args: { groups: GROUPS },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 15rem)', gap: 16, alignItems: 'start' }}>
      {([undefined, 'hover', 'pressed', 'focus'] as const).map((s) => (
        <Nav key={String(s)} aria-label={`State ${s ?? 'default'}`} groups={matrixGroups(s)} responsive={false} style={{ blockSize: 'auto' }} />
      ))}
      <Nav aria-label="State current" groups={[{ id: 'c', items: [{ id: 'cur', label: 'Active, current page', icon: icon('home'), href: '#' }] }]} currentId="cur" responsive={false} style={{ blockSize: 'auto' }} />
      <Nav aria-label="State disabled" groups={[{ id: 'd', items: [{ id: 'dis', label: 'Disabled', icon: icon('home'), disabled: true }] }]} responsive={false} style={{ blockSize: 'auto' }} />
    </div>
  ),
}
