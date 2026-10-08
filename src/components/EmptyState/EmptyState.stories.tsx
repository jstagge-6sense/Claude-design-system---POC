import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState, type EmptyStateVariant } from './EmptyState'
import { Button } from '../Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { tier: 2, group: 'Feedback and status', description: 'Explains why content is absent and always gives a way forward: an action, links or a retry.' },
  args: { title: 'No segments yet', action: <Button icon={<Icon name="plus" />}>Create segment</Button> },
  decorators: [(Story) => <div style={{ maxInlineSize: 640 }}><Story /></div>],
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>

export const NoData: Story = {
  args: {
    variant: 'noData',
    title: 'No segments yet',
    description: 'Segments group accounts that share traits. Create your first segment to start targeting.',
  },
}
export const FirstUse: Story = {
  args: {
    variant: 'firstUse',
    title: 'Welcome to Audiences',
    description: 'Connect a data source, then build your first audience from the accounts you already track.',
    action: <Button icon={<Icon name="plus" />}>Connect data source</Button>,
    links: [{ label: 'Read the setup guide', href: '#guide' }],
  },
}
export const NoResults: Story = {
  args: {
    variant: 'noResults',
    title: 'No accounts match “Acme West”',
    description: 'Check the spelling, remove a filter or search by domain instead.',
    action: <Button priority="secondary">Clear filters</Button>,
    links: [{ label: 'Search by domain', href: '#domain' }],
  },
}
export const ErrorWithRetry: Story = {
  name: 'Error with retry',
  args: {
    variant: 'error',
    title: 'We couldn’t load your accounts',
    description: 'The connection timed out. Try again, and contact support if it keeps happening.',
    action: undefined,
    onRetry: () => undefined,
    links: [{ label: 'Contact support', href: '#support' }],
  },
}
export const NoPermission: Story = {
  args: {
    variant: 'noPermission',
    title: 'You don’t have access to billing',
    description: 'Ask a workspace admin to give you the Billing viewer role.',
    action: <Button priority="secondary">Request access</Button>,
    links: [{ label: 'See who the admins are', href: '#admins' }],
  },
}
export const WithIllustration: Story = {
  name: 'With illustration slot',
  args: {
    title: 'No campaigns this quarter',
    description: 'Plan a campaign to reach accounts that are showing buying intent.',
    illustration: (
      <svg width="160" height="96" viewBox="0 0 160 96" role="presentation" focusable="false">
        <rect x="8" y="16" width="144" height="64" rx="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        <circle cx="80" cy="48" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
}
export const Minimal: Story = {
  args: { minimal: true, action: undefined, title: 'No notes yet', description: 'Add a note from the account page.' },
  decorators: [(Story) => <div style={{ maxInlineSize: 320 }}><Story /></div>],
}
export const WithoutIllustration: Story = {
  args: { illustration: false, title: 'No team members match this role', description: 'Invite people or choose another role.', action: <Button priority="secondary">Invite people</Button> },
}
export const VariantMatrix: Story = {
  name: 'Variants (all states)',
  render: () => {
    const rows: Array<{ v: EmptyStateVariant; title: string; description: string }> = [
      { v: 'firstUse', title: 'Welcome to Reports', description: 'Build your first report from a saved view.' },
      { v: 'noResults', title: 'No reports match', description: 'Try fewer keywords or clear a filter.' },
      { v: 'error', title: 'We couldn’t load reports', description: 'Check your connection and try again.' },
      { v: 'noData', title: 'No reports yet', description: 'Create a report to track pipeline.' },
      { v: 'noPermission', title: 'Reports are restricted', description: 'Ask an admin for the Analyst role.' },
    ]
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {rows.map((r) => (
          <EmptyState key={r.v} variant={r.v} size="compact" title={r.title} description={r.description} action={<Button size="small" priority="secondary">{r.v === 'error' ? 'Try again' : 'Create report'}</Button>} />
        ))}
      </div>
    )
  },
}
