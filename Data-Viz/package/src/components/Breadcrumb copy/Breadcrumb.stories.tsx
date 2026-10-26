import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb'

const meta = {
  title: 'Navigation and structure/Breadcrumb',
  component: Breadcrumb,
  parameters: { tier: 2, group: 'Navigation and structure', description: 'Shows where the user is in the hierarchy and links to each parent level.' },
} satisfies Meta<typeof Breadcrumb>
export default meta
type Story = StoryObj<typeof meta>

const SHORT: BreadcrumbItem[] = [
  { label: 'Accounts', href: '#accounts' },
  { label: 'Acme Corp', href: '#acme' },
  { label: 'Buying committee' },
]
const DEEP: BreadcrumbItem[] = [
  { label: 'Workspace', href: '#workspace' },
  { label: 'Segments', href: '#segments' },
  { label: 'Enterprise', href: '#enterprise' },
  { label: 'North America', href: '#na' },
  { label: 'Software and SaaS', href: '#saas' },
  { label: 'Q4 expansion targets' },
]

export const Standard: Story = { args: { items: SHORT } }
export const WithHomeIcon: Story = { args: { items: [{ label: 'Home', href: '#home' }, ...SHORT], homeIcon: true } }
export const Truncated: Story = { args: { items: DEEP, truncate: true } }
export const TruncatedExpanded: Story = { args: { items: DEEP, truncate: true, defaultExpanded: true } }
export const TruncatedTail3: Story = { args: { items: DEEP, truncate: true, tailCount: 3, homeIcon: true } }

export const Responsive: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div><p>Wide container</p><div style={{ inlineSize: 640 }}><Breadcrumb items={DEEP.slice(0, 4)} /></div></div>
      <div><p>Narrow container: parent and current only</p><div style={{ inlineSize: 280 }}><Breadcrumb items={DEEP.slice(0, 4)} /></div></div>
    </div>
  ),
}
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" lang="ar">
      <Breadcrumb items={[{ label: 'الحسابات', href: '#a' }, { label: 'شركة أكمي', href: '#b' }, { label: 'لجنة الشراء' }]} aria-label="مسار التنقل" />
    </div>
  ),
}

export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Breadcrumb items={[{ label: 'Default', href: '#a' }, { label: 'Hover', href: '#b', 'data-state': 'hover' }, { label: 'Focus', href: '#c', 'data-state': 'focus' }, { label: 'Current page' }]} />
      <Breadcrumb items={DEEP} truncate responsive={false} />
    </div>
  ),
}
