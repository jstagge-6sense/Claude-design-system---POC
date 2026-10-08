import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Action/Button',
  component: Button,
  parameters: { tier: 1, group: 'Action', description: 'Triggers an action or submits data. One primary per task area.' },
  args: { children: 'Save changes' },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

const PRIORITIES = ['primary', 'secondary', 'tertiary', 'destructive'] as const
const STATES = [undefined, 'hover', 'pressed', 'focus'] as const

export const Priorities: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      {PRIORITIES.map((p) => <Button key={p} {...args} priority={p}>{p[0].toUpperCase() + p.slice(1)}</Button>)}
    </div>
  ),
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, max-content)', gap: 16, alignItems: 'center' }}>
      {PRIORITIES.map((p) => (
        <>
          {STATES.map((s) => <Button key={p + s} {...args} priority={p} data-state={s}>{s ?? 'Default'}</Button>)}
          <Button key={p + 'dis'} {...args} priority={p} disabled>Disabled</Button>
        </>
      ))}
    </div>
  ),
}
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['small', 'medium', 'large'] as const).map((s) => <Button key={s} {...args} size={s}>{s}</Button>)}
    </div>
  ),
}
export const WithIcons: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Button {...args} priority="secondary" icon={<Icon name="plus" />}>Create segment</Button>
      <Button {...args} priority="tertiary" trailingIcon={<Icon name="chevronDown" />}>More</Button>
      <Button {...args} priority="secondary" iconOnly icon={<Icon name="copy" />} aria-label="Copy" />
      <Button {...args} priority="tertiary" iconOnly icon={<Icon name="settings" />} aria-label="Settings" />
    </div>
  ),
}
export const Loading: Story = { args: { loading: true, children: 'Saving' } }
export const Disabled: Story = { args: { disabled: true, unavailableReason: 'Add a segment name first.' } }
