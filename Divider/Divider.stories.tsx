import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './Divider'

const meta = {
  title: 'Navigation and structure/Divider',
  component: Divider,
  parameters: { tier: 3, group: 'Navigation and structure', description: 'Quiet separator between sections or list items. Use sparingly: whitespace is usually enough.' },
} satisfies Meta<typeof Divider>
export default meta
type Story = StoryObj<typeof meta>

const frame = { inlineSize: 360, display: 'grid', gap: 12 } as const

export const Horizontal: Story = {
  render: () => (
    <div style={frame}>
      <span>Account details</span>
      <Divider />
      <span>Billing contacts</span>
    </div>
  ),
}
export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', blockSize: 32 }}>
      <span>Overview</span>
      <Divider orientation="vertical" />
      <span>Activity</span>
      <Divider orientation="vertical" />
      <span>Settings</span>
    </div>
  ),
}
export const WithLabel: Story = {
  render: () => (
    <div style={frame}>
      <span>Continue with email</span>
      <Divider label="or" />
      <span>Continue with single sign-on</span>
      <Divider label="Recent segments" />
    </div>
  ),
}
export const Inset: Story = {
  render: () => (
    <div style={{ ...frame, gap: 0 }}>
      {['Northwest enterprise', 'Mid-market SaaS', 'Healthcare accounts'].map((n, i, a) => (
        <div key={n}>
          <div style={{ padding: '12px 16px' }}>{n}</div>
          {i < a.length - 1 ? <Divider inset /> : null}
        </div>
      ))}
    </div>
  ),
}
export const Decorative: Story = {
  render: () => (
    <div style={frame}>
      <span>Hidden from screen readers</span>
      <Divider decorative />
      <span>Use when whitespace already groups the content</span>
    </div>
  ),
}
export const Matrix: Story = {
  name: 'Variants (matrix)',
  render: () => (
    <div style={{ ...frame, gap: 20 }}>
      <Divider />
      <Divider inset />
      <Divider label="Label" />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', blockSize: 24 }}>
        <span>Left</span><Divider orientation="vertical" /><span>Right</span>
      </div>
    </div>
  ),
}
