import type { Meta, StoryObj } from '@storybook/react'
import { Banner } from './Banner'
import { BannerStack, type BannerStackItem } from './BannerStack'
import { Frame, SamplePage } from '../Dialog/storyFrame'

const meta = {
  title: 'Feedback and status/Banner',
  component: Banner,
  parameters: { tier: 1, group: 'Feedback and status', description: 'Persistent, contextual message for important information, warnings or required actions. Merges Alert and Banner.' },
  args: { title: 'Salesforce sync paused', children: 'Reconnect your account to resume syncing 1,284 target accounts.', severity: 'info' },
} satisfies Meta<typeof Banner>
export default meta
type Story = StoryObj<typeof meta>

const col = { display: 'flex', flexDirection: 'column', gap: 16 } as const

export const Severities: Story = {
  render: () => (
    <div style={col}>
      <Banner severity="info" title="New scoring model available" actionLabel="Review changes" onAction={() => {}}>Scores update tonight at 2:00 AM UTC.</Banner>
      <Banner severity="success" title="Segment published" actionLabel="View segment" onAction={() => {}}>Mid-market fintech, EMEA is now live in 3 campaigns.</Banner>
      <Banner severity="warning" title="Sync is falling behind" actionLabel="Review settings" onAction={() => {}} dismissible>Salesforce has not synced for 6 hours. Check the connection to avoid stale data.</Banner>
      <Banner severity="error" priority="P2" title="Cannot publish campaign" actionLabel="Fix errors" onAction={() => {}} dismissible>2 required fields are empty. Add them to publish.</Banner>
      <Banner severity="error" priority="P1" title="Platform outage" actionLabel="Check status page" actionHref="#status">Dashboards are unavailable. We are working on a fix and will update this banner.</Banner>
    </div>
  ),
}

export const Placements: Story = {
  render: () => (
    <Frame height="auto" style={{ paddingBlockEnd: 16 }}>
      <Banner placement="global" severity="warning" title="Scheduled maintenance tonight from 10:00 PM to 11:00 PM UTC" />
      <div style={{ ...col, padding: 16 }}>
        <Banner placement="page" severity="info" title="Page level" actionLabel="Learn about segments" actionHref="#docs">Applies to everything on this page.</Banner>
        <SamplePage action={false} title="Segments" />
        <Banner placement="section" severity="success">Section level: your changes to this section were saved.</Banner>
        <Banner placement="inline" severity="error" title="Inline">Enter a valid CRM field name.</Banner>
      </div>
    </Frame>
  ),
}

export const ContentVariants: Story = {
  name: 'Title only, body only, both',
  render: () => (
    <div style={col}>
      <Banner severity="info" title="Scores refresh nightly at 2:00 AM UTC" />
      <Banner severity="info">Scores refresh nightly at 2:00 AM UTC. Changes to rules appear after the next refresh.</Banner>
      <Banner severity="info" title="Scoring rules changed">Scores refresh nightly at 2:00 AM UTC.</Banner>
    </div>
  ),
}

export const Actions: Story = {
  render: () => (
    <div style={col}>
      <Banner severity="warning" title="Connection expires in 3 days" actionLabel="Reconnect Salesforce" onAction={() => {}} />
      <Banner severity="warning" title="Connection expires in 3 days" actionLabel="Read the guide" actionHref="#guide" />
    </div>
  ),
}

export const Dismissible: Story = {
  render: () => (
    <div style={col}>
      <Banner severity="info" dismissible title="Tip: press / to search" />
      <Banner severity="error" priority="P1" dismissible title="P1 banners ignore dismissible">The close control is not shown for critical banners.</Banner>
    </div>
  ),
}

const ITEMS: BannerStackItem[] = [
  { id: 'a', severity: 'info', title: 'New scoring model available', dismissible: true },
  { id: 'b', severity: 'error', priority: 'P1', title: 'Platform outage', children: 'Dashboards are unavailable. We are working on a fix.' },
  { id: 'c', severity: 'warning', title: 'Sync is falling behind', actionLabel: 'Review settings', dismissible: true },
  { id: 'd', severity: 'error', priority: 'P1', title: 'Second P1 is shown as P2', children: 'Only one P1 banner renders at a time.' },
  { id: 'e', severity: 'success', title: 'Segment published', dismissible: true },
]
export const StackCollapsed: Story = {
  name: 'Stack (collapsed with count)',
  render: () => <BannerStack items={ITEMS} />,
}
export const StackExpanded: Story = {
  name: 'Stack (expanded)',
  render: () => <BannerStack items={ITEMS} defaultExpanded />,
}

const STATES = [undefined, 'hover', 'pressed', 'focus'] as const
export const ControlStates: Story = {
  name: 'Action and close states (forced)',
  render: () => (
    <div style={col}>
      {STATES.map((s) => (
        <Banner key={s ?? 'default'} severity="warning" dismissible title={`State: ${s ?? 'default'}`} actionLabel="Review settings"
          actionButtonProps={{ 'data-state': s }} closeButtonProps={{ 'data-state': s }}>Forced states on the action and close controls.</Banner>
      ))}
    </div>
  ),
}
