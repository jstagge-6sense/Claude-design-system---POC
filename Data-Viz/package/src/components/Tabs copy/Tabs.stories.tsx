import { useEffect, useState, type ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabList, Tab, TabPanel } from './Tabs'
import { Icon } from '../../icons'

const meta = {
  title: 'Navigation and structure/Tabs',
  component: Tabs,
  parameters: { tier: 1, group: 'Navigation and structure', description: 'Switch between related panels of content within the same page context.' },
  args: { defaultValue: 'overview' },
} satisfies Meta<typeof Tabs>
export default meta
type Story = StoryObj<typeof meta>

type TabsArgs = ComponentProps<typeof Tabs>

const Basic = (props: TabsArgs) => (
  <Tabs {...props}>
    <TabList aria-label="Account sections">
      <Tab value="overview">Overview</Tab>
      <Tab value="contacts">Contacts</Tab>
      <Tab value="activity">Activity</Tab>
      <Tab value="settings">Settings</Tab>
    </TabList>
    <TabPanel value="overview">Overview shows firmographics, buying stage and the account owner.</TabPanel>
    <TabPanel value="contacts">Contacts lists the people at this account and their engagement.</TabPanel>
    <TabPanel value="activity">Activity shows visits, form fills and ad clicks from the last 90 days.</TabPanel>
    <TabPanel value="settings">Settings controls sync and visibility for this account.</TabPanel>
  </Tabs>
)

export const Standard: Story = { render: (args) => <Basic {...args} variant="standard" /> }
export const Filled: Story = { render: (args) => <Basic {...args} variant="filled" /> }
export const Compact: Story = { render: (args) => <Basic {...args} variant="compact" /> }
export const Vertical: Story = { render: (args) => <Basic {...args} variant="vertical" /> }

export const WithIcons: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Segment views">
        <Tab value="overview" icon={<Icon name="grid" />}>Overview</Tab>
        <Tab value="list" icon={<Icon name="list" />}>Accounts</Tab>
        <Tab value="people" icon={<Icon name="users" />}>People</Tab>
      </TabList>
      <TabPanel value="overview">Summary charts for this segment.</TabPanel>
      <TabPanel value="list">Every account in this segment.</TabPanel>
      <TabPanel value="people">Contacts at those accounts.</TabPanel>
    </Tabs>
  ),
}
export const WithBadges: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['standard', 'filled', 'compact'] as const).map((v) => (
        <Tabs key={v} {...args} variant={v} defaultValue="inbox">
          <TabList aria-label={`Alerts (${v})`}>
            <Tab value="inbox" badge={12}>Inbox</Tab>
            <Tab value="mentions" badge={3} icon={<Icon name="bell" />}>Mentions</Tab>
            <Tab value="archived" badge={240}>Archived</Tab>
            <Tab value="muted" badge={1} disabled>Muted</Tab>
          </TabList>
          <TabPanel value="inbox">12 unread alerts.</TabPanel>
          <TabPanel value="mentions">3 mentions.</TabPanel>
          <TabPanel value="archived">240 archived alerts.</TabPanel>
          <TabPanel value="muted">Muted alerts.</TabPanel>
        </Tabs>
      ))}
    </div>
  ),
}
export const DisabledTab: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList aria-label="Account sections">
        <Tab value="overview">Overview</Tab>
        <Tab value="contacts">Contacts</Tab>
        <Tab value="billing" disabled disabledReason="Billing is available to workspace admins.">Billing</Tab>
      </TabList>
      <TabPanel value="overview">Focus Billing with the arrow keys to hear why it is unavailable.</TabPanel>
      <TabPanel value="contacts">Contacts.</TabPanel>
      <TabPanel value="billing">Billing.</TabPanel>
    </Tabs>
  ),
}

const MANY = ['Overview', 'Accounts', 'Contacts', 'Activity', 'Campaigns', 'Segments', 'Reports', 'Integrations', 'Audiences', 'Playbooks', 'Billing', 'Settings']
export const Scrollable: Story = {
  render: (args) => (
    <div style={{ inlineSize: 380 }}>
      <Tabs {...args} scrollable defaultValue="Overview">
        <TabList aria-label="Workspace sections">
          {MANY.map((m) => <Tab key={m} value={m}>{m}</Tab>)}
        </TabList>
        {MANY.map((m) => <TabPanel key={m} value={m}>{m} content.</TabPanel>)}
      </Tabs>
    </div>
  ),
}

const STATES = [undefined, 'hover', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['standard', 'filled', 'compact', 'vertical'] as const).map((v) => (
        <Tabs key={v} variant={v} defaultValue="selected">
          <TabList aria-label={`State matrix (${v})`}>
            <Tab value="selected" badge={4}>Selected</Tab>
            {STATES.map((s) => <Tab key={String(s)} value={`s-${s}`} data-state={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'Default'}</Tab>)}
            <Tab value="disabled" disabled badge={2}>Disabled</Tab>
          </TabList>
          <TabPanel value="selected">The {v} variant.</TabPanel>
        </Tabs>
      ))}
    </div>
  ),
}

export const ManualActivation: Story = {
  render: (args) => <Basic {...args} activation="manual" />,
}

function ControlledDemo() {
  const [v, setV] = useState('contacts')
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Tabs value={v} onValueChange={setV}>
        <TabList aria-label="Account sections">
          <Tab value="overview">Overview</Tab>
          <Tab value="contacts">Contacts</Tab>
        </TabList>
        <TabPanel value="overview">Overview.</TabPanel>
        <TabPanel value="contacts">Contacts.</TabPanel>
      </Tabs>
      <span>Selected tab: {v}</span>
    </div>
  )
}
export const Controlled: Story = { render: () => <ControlledDemo /> }

function Slow({ delay }: { delay: number }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), delay); return () => clearTimeout(t) }, [delay])
  return ready ? <p>Loaded after {delay} ms. Screen readers hear a polite "content loaded" message.</p> : null
}
export const LazyPanels: Story = {
  render: (args) => (
    <Tabs {...args} lazy defaultValue="a">
      <TabList aria-label="Lazy panels">
        <Tab value="a">Loaded first</Tab>
        <Tab value="b">Loaded on first visit</Tab>
        <Tab value="c">Still loading</Tab>
      </TabList>
      <TabPanel value="a">This panel mounted with the page.</TabPanel>
      <TabPanel value="b"><Slow delay={300} /></TabPanel>
      <TabPanel value="c" loading>Hidden while loading.</TabPanel>
    </Tabs>
  ),
}
