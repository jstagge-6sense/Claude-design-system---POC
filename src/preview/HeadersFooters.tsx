import { useState, type ReactNode } from 'react'
import { TopBar, type TopBarProps } from '../components/TopBar'
import { PageHeader, type PageAction } from '../components/PageHeader'
import { Tabs, TabList, Tab } from '../components/Tabs'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <section className="pv-section"><h2>{title}</h2>{note ? <p className="pv-muted">{note}</p> : null}<div style={{ display: 'grid', gap: 24 }}>{children}</div></section>
}
const Frame = ({ label, children }: { label: string; children: ReactNode }) => (
  <div><small className="pv-muted">{label}</small><div style={{ border: '1px solid var(--pv-line)', borderRadius: 8, overflow: 'hidden', background: 'var(--pv-panel)', marginBlockStart: 4 }}>{children}</div></div>
)

const NAV = [{ id: 'a', label: 'Accounts', href: '#', current: true }, { id: 'b', label: 'Segments', href: '#' }, { id: 'c', label: 'Campaigns', href: '#' }, { id: 'd', label: 'Reports', href: '#' }]
const USER = { name: 'Priya Shah', email: 'priya@example.com' }
const logo = <a href="#" aria-label="Home" style={{ fontWeight: 700 }}>6sense</a>
const base: Partial<TopBarProps> = { logo, sticky: false, scrolled: false }
const TOPBARS: Array<[string, Partial<TopBarProps>]> = [
  ['Logo only', {}],
  ['Logo, navigation and profile', { navItems: NAV, user: USER }],
  ['With search', { navItems: NAV, user: USER, searchProps: { variant: 'global', label: 'Search', placeholder: 'Search' } as TopBarProps['searchProps'] }],
  ['With notifications', { navItems: NAV, user: USER, notifications: { count: 3 } }],
  ['With app switcher', { navItems: NAV, user: USER, notifications: { count: 0 }, apps: [{ id: 'x', label: 'Analytics' }, { id: 'y', label: 'Orchestration' }] }],
  ['Scrolled (elevated)', { navItems: NAV, user: USER, scrolled: true }],
]

const ACTIONS: PageAction[] = [
  { id: 'p', label: 'Create segment', priority: 'primary' },
  { id: 's', label: 'Export', priority: 'secondary' },
  { id: 't', label: 'Share', priority: 'tertiary' },
  { id: 'd', label: 'Archive', priority: 'destructive' },
]
const CRUMBS = [{ label: 'Segments', href: '#' }, { label: 'Enterprise accounts' }]

function TabsHeader() {
  const [tab, setTab] = useState('overview')
  return (
    <PageHeader title="Enterprise accounts" breadcrumb={CRUMBS} actions={ACTIONS.slice(0, 2)} tabs={(
      <Tabs value={tab} onValueChange={setTab}>
        <TabList aria-label="Segment sections"><Tab value="overview">Overview</Tab><Tab value="accounts" badge={248}>Accounts</Tab><Tab value="activity">Activity</Tab></TabList>
      </Tabs>
    )} />
  )
}

export function HeadersFootersPage() {
  return (
    <>
      <section className="pv-section">
        <h2>Headers and footers</h2>
        <p className="pv-muted">Every header and footer option in the library. There is no page-level footer component yet; footers exist on Card, Drawer and SidePanel, and Card is shown below.</p>
      </section>
      <Section title="Application header (TopBar)" note="Persistent bar with logo, navigation, search, notifications, app switcher and profile menu. Shown unfixed here.">
        {TOPBARS.map(([label, p]) => <Frame key={label} label={label}><TopBar {...base} {...p} /></Frame>)}
      </Section>
      <Section title="Page header (PageHeader)" note="Title with optional breadcrumb, description, actions, tabs and metadata.">
        <Frame label="Title only"><PageHeader title="Enterprise accounts" /></Frame>
        <Frame label="Breadcrumb, description and actions"><PageHeader title="Enterprise accounts" breadcrumb={CRUMBS} description="Accounts that match the enterprise rules." actions={ACTIONS.slice(0, 3)} /></Frame>
        <Frame label="Actions overflow into the More actions menu"><PageHeader title="Enterprise accounts" actions={ACTIONS} maxVisibleActions={2} /></Frame>
        <Frame label="Status, last modified and owner"><PageHeader title="Enterprise accounts" status={{ label: 'Active', tone: 'success' }} lastModified="Updated Oct 8, 2026" owner={{ name: 'Priya Shah' }} actions={ACTIONS.slice(0, 1)} /></Frame>
        <Frame label="With tabs"><TabsHeader /></Frame>
        <Frame label="Loading"><PageHeader title="Loading" loading /></Frame>
      </Section>
      <Section title="Card header and footer (Card)" note="Card header: title, subtitle and a header action. Footer: metadata on the left, actions on the right.">
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', alignItems: 'start' }}>
          <Card title="Header only" subtitle="Subtitle under the title" />
          <Card title="Header action" subtitle="Badge at the end of the header" headerAction={<Badge tone="success">Active</Badge>} />
          <Card title="Footer metadata" subtitle="Left side of the footer" footer="Updated Oct 8, 2026" />
          <Card title="Footer actions" subtitle="Right side of the footer" actions={<><Button priority="tertiary">Cancel</Button><Button>Save</Button></>} />
          <Card title="Footer metadata and actions" subtitle="Both sides" headerAction={<Badge tone="info">Draft</Badge>} footer="Updated Oct 8, 2026" actions={<Button>Publish</Button>} />
          <Card compact title="Compact" subtitle="Dense layout" footer="Updated Oct 8, 2026" actions={<Button>Open</Button>} />
        </div>
      </Section>
    </>
  )
}
