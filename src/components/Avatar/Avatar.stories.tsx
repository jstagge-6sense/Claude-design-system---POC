import { Fragment } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta = {
  title: 'Feedback/Avatar',
  component: Avatar,
  parameters: { tier: 2, group: 'Feedback and status', description: 'Visual identity for a person. Initials are preferred over a generic icon.' },
  args: { name: 'Maya Okafor' },
} satisfies Meta<typeof Avatar>
export default meta
type Story = StoryObj<typeof meta>

// Inline SVG photo so the story renders offline.
const PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#73DCE7"/><circle cx="32" cy="25" r="11" fill="#214D50"/><path d="M10 64c2-16 12-22 22-22s20 6 22 22z" fill="#214D50"/></svg>',
)
const row = { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' } as const
const SIZES = ['small', 'medium', 'large', 'xl'] as const

export const Image: Story = { args: { src: PHOTO } }
export const Initials: Story = {
  render: () => (
    <div style={row}>
      {SIZES.map((s) => <Avatar key={s} name="Maya Okafor" size={s} />)}
    </div>
  ),
}
export const Placeholder: Story = {
  render: () => (
    <div style={row}>
      {SIZES.map((s) => <Avatar key={s} name="Unknown user" size={s} placeholder />)}
    </div>
  ),
}
export const Sizes: Story = {
  render: () => (
    <div style={row}>
      {SIZES.map((s) => <Avatar key={s} name="Daniel Reyes" size={s} src={PHOTO} />)}
      {SIZES.map((s) => <Avatar key={s + 'i'} name="Daniel Reyes" size={s} />)}
    </div>
  ),
}
export const WithStatus: Story = {
  render: () => (
    <div style={row}>
      {(['online', 'away', 'busy', 'offline'] as const).map((st) => (
        <Fragment key={st}>
          <Avatar name="Priya Nair" size="large" status={st} />
          <Avatar name="Priya Nair" size="small" src={PHOTO} status={st} />
        </Fragment>
      ))}
    </div>
  ),
}
export const DropdownTrigger: Story = {
  render: () => (
    <div style={row}>
      <Avatar name="Maya Okafor" size="large" onClick={() => undefined} aria-haspopup="menu" aria-expanded={false} />
      <Avatar name="Maya Okafor" size="medium" src={PHOTO} onClick={() => undefined} aria-haspopup="menu" aria-expanded={false} />
    </div>
  ),
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={row}>
      {[undefined, 'hover', 'pressed', 'focus'].map((s) => (
        <div key={String(s)} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <Avatar name="Maya Okafor" size="large" onClick={() => undefined} data-state={s as 'hover' | 'pressed' | 'focus' | undefined} />
          <span>{s ?? 'Default'}</span>
        </div>
      ))}
    </div>
  ),
}
