import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TopBar, TopBarAction, type TopBarApp, type TopBarNavItem, type TopBarProps } from './TopBar'
import { Icon } from '../../icons'

const meta = {
  title: 'Navigation and structure/TopBar',
  component: TopBar,
  parameters: {
    tier: 1,
    group: 'Navigation and structure',
    description: 'Persistent application header: skip link, logo, primary navigation, search, notifications, app switcher and profile menu. Collapses to a hamburger on small containers.',
  },
} satisfies Meta<typeof TopBar>
export default meta
type Story = StoryObj<typeof meta>

const Logo = () => <a href="#home" aria-label="Home" style={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>Northwind</a>
const NAV: TopBarNavItem[] = [
  { id: 'accounts', label: 'Accounts', href: '#accounts', current: true },
  { id: 'segments', label: 'Segments', href: '#segments' },
  { id: 'campaigns', label: 'Campaigns', href: '#campaigns' },
  { id: 'reports', label: 'Reports', href: '#reports' },
]
const APPS: TopBarApp[] = [
  { id: 'intent', label: 'Intent', href: '#intent', icon: <Icon name="trendUp" /> },
  { id: 'orchestration', label: 'Orchestration', href: '#orch', icon: <Icon name="sparkle" /> },
  { id: 'revenue', label: 'Revenue', href: '#revenue', icon: <Icon name="star" /> },
  { id: 'data', label: 'Data', href: '#data', icon: <Icon name="grid" /> },
  { id: 'admin', label: 'Admin', href: '#admin', icon: <Icon name="settings" /> },
]
const USER = { name: 'Priya Raman', email: 'priya.raman@example.com' }

const Page = ({ children, minHeight = '16rem' }: { children: ReactNode; minHeight?: string }) => (
  <div style={{ border: '1px dashed currentColor', minBlockSize: minHeight }}>
    {children}
    <main id="main-content" style={{ padding: '1rem' }}>
      <h1 style={{ margin: 0 }}>Accounts</h1>
      <p>Tab once to reveal the skip link, then press Enter to jump here. Press / to focus search when it is available.</p>
    </main>
  </div>
)

const base: Partial<TopBarProps> = { logo: <Logo />, navItems: NAV, user: USER, sticky: false, scrolled: false }

export const Standard: Story = {
  args: { logo: <Logo /> },
  render: () => (
    <Page>
      <TopBar {...(base as TopBarProps)} search={<input aria-label="Search" placeholder="Search" style={{ inlineSize: '100%' }} />} />
    </Page>
  ),
}

export const WithAppSwitcher: Story = {
  name: 'With app switcher (open)',
  args: { logo: <Logo /> },
  render: () => (
    <Page minHeight="22rem">
      <TopBar {...(base as TopBarProps)} apps={APPS} defaultAppSwitcherOpen />
    </Page>
  ),
}

function NotificationDemo(args: TopBarProps) {
  const [count, setCount] = useState(3)
  return (
    <Page>
      <TopBar {...args} notifications={{ count, onClick: () => setCount(0) }} />
      <p style={{ padding: '0 1rem' }}>
        <button type="button" onClick={() => setCount((c) => c + 1)}>Simulate a new notification</button> Clicking the bell clears the count. The change is announced politely.
      </p>
    </Page>
  )
}
export const WithNotificationCenter: Story = {
  args: { logo: <Logo /> },
  render: (args) => <NotificationDemo {...(base as TopBarProps)} {...args} />,
}

export const WithGlobalSearch: Story = {
  args: { logo: <Logo /> },
  render: () => (
    <Page>
      <TopBar
        {...(base as TopBarProps)}
        searchProps={{ placeholder: 'Search accounts, segments, campaigns', results: [{ id: '1', label: 'Acme Corp', description: 'Account' }, { id: '2', label: 'Acme expansion', description: 'Segment' }], defaultOpen: true, defaultValue: 'Acme' }}
        notifications={{ count: 12 }}
      />
    </Page>
  ),
}

export const ProfileMenuOpen: Story = {
  name: 'Profile menu (open)',
  args: { logo: <Logo /> },
  render: () => (
    <Page minHeight="22rem">
      <TopBar {...(base as TopBarProps)} notifications={{ count: 0 }} defaultProfileMenuOpen />
    </Page>
  ),
}

export const Scrolled: Story = {
  args: { logo: <Logo /> },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Page minHeight="8rem"><TopBar {...(base as TopBarProps)} scrolled={false} /></Page>
      <Page minHeight="8rem"><TopBar {...(base as TopBarProps)} scrolled /></Page>
    </div>
  ),
}

export const Responsive: Story = {
  name: 'Responsive (hamburger, search icon)',
  args: { logo: <Logo /> },
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ inlineSize: '23rem' }}>
        <Page minHeight="20rem">
          <TopBar {...(base as TopBarProps)} defaultMenuOpen apps={APPS} notifications={{ count: 4 }} searchProps={{ placeholder: 'Search' }} />
        </Page>
      </div>
      <div style={{ inlineSize: '23rem' }}>
        <Page minHeight="20rem">
          <TopBar {...(base as TopBarProps)} notifications={{ count: 4 }} searchProps={{ placeholder: 'Search' }} />
        </Page>
      </div>
    </div>
  ),
}

export const RightToLeft: Story = {
  name: 'RTL',
  args: { logo: <Logo /> },
  render: () => (
    <div dir="rtl">
      <Page><TopBar {...(base as TopBarProps)} notifications={{ count: 5 }} apps={APPS} /></Page>
    </div>
  ),
}

const ST = [undefined, 'hover', 'pressed', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  args: { logo: <Logo /> },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <TopBar
        {...(base as TopBarProps)}
        user={undefined}
        sticky={false}
        navItems={[
          { id: 'a', label: 'Default', href: '#a' },
          { id: 'b', label: 'Hover', href: '#b', state: 'hover' },
          { id: 'c', label: 'Pressed', href: '#c', state: 'pressed' },
          { id: 'd', label: 'Focus', href: '#d', state: 'focus' },
          { id: 'e', label: 'Current', href: '#e', current: true },
        ]}
      />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {ST.map((s) => <TopBarAction key={String(s)} label={`Action ${s ?? 'default'}`} icon={<Icon name="settings" />} data-state={s} />)}
        <TopBarAction label="Action expanded" icon={<Icon name="settings" />} aria-expanded />
      </div>
    </div>
  ),
}
