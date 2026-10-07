import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader, type PageAction } from './PageHeader'
import { Tabs, TabList, Tab } from '../Tabs'
import { Icon } from '../../icons'

const meta = {
  title: 'Navigation and structure/PageHeader',
  component: PageHeader,
  parameters: {
    tier: 1,
    group: 'Navigation and structure',
    description: 'Page-level header: title, breadcrumb, description, right-aligned actions, tabs and metadata. Action limit: 1 primary and 2 others visible, 5 in total.',
  },
  args: { title: 'Q4 expansion accounts' },
} satisfies Meta<typeof PageHeader>
export default meta
type Story = StoryObj<typeof meta>

const CRUMBS = [{ label: 'Home', href: '#home' }, { label: 'Segments', href: '#segments' }, { label: 'Q4 expansion accounts' }]
const ACTIONS: PageAction[] = [
  { id: 'create', label: 'Create segment', priority: 'primary', icon: <Icon name="plus" /> },
  { id: 'export', label: 'Export list', priority: 'secondary', icon: <Icon name="download" /> },
  { id: 'share', label: 'Share segment', priority: 'tertiary' },
  { id: 'duplicate', label: 'Duplicate segment', priority: 'tertiary' },
  { id: 'delete', label: 'Delete segment', priority: 'destructive', icon: <Icon name="trash" /> },
]
const DESC = 'Accounts with rising intent in the last 30 days that are not in an open opportunity.'

export const Simple: Story = {}

export const WithBreadcrumb: Story = { args: { breadcrumb: CRUMBS, description: DESC } }

/** Action count limit: one primary and up to two other actions are visible. Everything after that, up to 5 in total, goes to More actions. Below 768px only the first action stays visible. */
export const WithActions: Story = { args: { description: DESC, actions: ACTIONS } }

function TabsHeader(args: Parameters<typeof PageHeader>[0]) {
  const [tab, setTab] = useState('overview')
  return (
    <PageHeader
      {...args}
      tabs={(
        <Tabs value={tab} onValueChange={setTab}>
          <TabList aria-label="Segment sections">
            <Tab value="overview">Overview</Tab>
            <Tab value="accounts" badge={248}>Accounts</Tab>
            <Tab value="activity">Activity</Tab>
            <Tab value="settings">Settings</Tab>
          </TabList>
        </Tabs>
      )}
    />
  )
}
export const WithTabs: Story = {
  args: { breadcrumb: CRUMBS, actions: ACTIONS.slice(0, 2) },
  render: (args) => <TabsHeader {...args} />,
}

export const WithMetadata: Story = {
  args: {
    breadcrumb: CRUMBS,
    description: DESC,
    status: { label: 'Active', tone: 'success' },
    lastModified: 'Oct 2, 2026 at 3:40 PM',
    owner: { name: 'Priya Raman' },
    actions: ACTIONS.slice(0, 3),
  },
}

export const Loading: Story = { args: { loading: true, breadcrumb: CRUMBS, actions: ACTIONS } }

export const Sticky: Story = {
  args: { sticky: true, stuck: true, actions: ACTIONS.slice(0, 2), description: DESC },
  render: (args) => (
    <div style={{ blockSize: '16rem', overflow: 'auto', border: '1px dashed currentColor' }}>
      <PageHeader {...args} />
      {Array.from({ length: 12 }, (_, i) => <p key={i} style={{ padding: '0 1.5rem' }}>Row {i + 1}. Content scrolls under the header, which stays in view.</p>)}
    </div>
  ),
}

export const Narrow: Story = {
  name: 'Narrow container (actions in overflow, open)',
  args: { title: 'Q4 expansion accounts', description: DESC, actions: ACTIONS.slice(0, 3), defaultOverflowOpen: true },
  render: (args) => <div style={{ inlineSize: '22rem', minBlockSize: '22rem' }}><PageHeader {...args} /></div>,
}

export const HeadingLevels: Story = {
  name: 'Heading level',
  args: { title: 'Nested page title', headingLevel: 2, description: 'Use a lower level when the header sits inside a region that already has an h1.' },
}

export const RightToLeft: Story = {
  name: 'RTL',
  args: { breadcrumb: CRUMBS, description: DESC, actions: ACTIONS.slice(0, 2), status: { label: 'Active', tone: 'success' }, owner: { name: 'Priya Raman' } },
  render: (args) => <div dir="rtl"><PageHeader {...args} /></div>,
}
