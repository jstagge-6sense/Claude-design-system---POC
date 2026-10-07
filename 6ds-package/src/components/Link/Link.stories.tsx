import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './Link'
import { Icon } from '../../icons'

const meta = {
  title: 'Action/Link',
  component: Link,
  parameters: { tier: 3, group: 'Action', description: 'Navigates to another page, section, document or site. Links navigate, buttons act.' },
  args: { href: '#segments', children: 'View segment details' },
} satisfies Meta<typeof Link>
export default meta
type Story = StoryObj<typeof meta>

const STATES = [undefined, 'hover', 'pressed', 'focus', 'visited'] as const

export const Inline: Story = {
  render: () => (
    <p style={{ maxInlineSize: 480, margin: 0 }}>
      Your account list refreshes every night. Read the <Link variant="inline" href="#scoring">scoring guide</Link> to see how
      buying stages are assigned, or <Link variant="inline" href="#audiences">review your audiences</Link> before you launch a campaign.
    </p>
  ),
}
export const Standalone: Story = { args: { variant: 'standalone', children: 'Go to account settings' } }
export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <Link href="#back" icon={<Icon name="arrowLeft" />}>Back to segments</Link>
      <Link href="#next" trailingIcon={<Icon name="arrowRight" />}>Continue to review</Link>
      <Link href="#export.csv" icon={<Icon name="download" />}>Download report</Link>
    </div>
  ),
}
export const External: Story = {
  args: { href: 'https://example.com/docs', external: true, children: 'Read the API docs' },
}
export const Destructive: Story = { args: { variant: 'destructive', href: '#delete-workspace', children: 'Go to delete workspace' } }
export const Disabled: Story = { args: { disabled: true, children: 'Export unavailable' } }

export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, max-content)', gap: 16, alignItems: 'center' }}>
      {(['inline', 'standalone', 'destructive'] as const).map((v) => (
        <>
          {STATES.map((s) => <Link key={v + s} variant={v} href="#state" data-state={s}>{s ?? 'Default'}</Link>)}
          <Link key={v + 'dis'} variant={v} disabled>Disabled</Link>
        </>
      ))}
    </div>
  ),
}
