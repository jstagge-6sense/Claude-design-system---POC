import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup } from './ButtonGroup'
import { Icon } from '../../icons'

const VIEWS = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]

const meta = {
  title: 'Action/Button group',
  component: ButtonGroup,
  parameters: { tier: 2, group: 'Action', description: 'A connected set of 2 to 5 buttons. One component with two modes: action groups run commands, selection groups choose a state.' },
  args: { 'aria-label': 'Report period', items: VIEWS },
} satisfies Meta<typeof ButtonGroup>
export default meta
type Story = StoryObj<typeof meta>

const row = { display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' } as const

export const ActionGroup: Story = {
  args: { mode: 'action', 'aria-label': 'Page actions', items: [{ value: 'save', label: 'Save' }, { value: 'cancel', label: 'Cancel' }, { value: 'publish', label: 'Publish' }] },
}
export const SelectionSingle: Story = { args: { mode: 'selection', selectionMode: 'single', defaultValue: ['week'] } }
export const SelectionMulti: Story = {
  args: { mode: 'selection', selectionMode: 'multi', 'aria-label': 'Channels', defaultValue: ['email', 'ads'], items: [{ value: 'email', label: 'Email' }, { value: 'ads', label: 'Ads' }, { value: 'web', label: 'Web' }, { value: 'sms', label: 'SMS' }] },
}
export const WithIcons: Story = {
  args: {
    mode: 'selection', 'aria-label': 'Layout', defaultValue: ['list'],
    items: [{ value: 'list', label: 'List', icon: <Icon name="list" /> }, { value: 'grid', label: 'Grid', icon: <Icon name="grid" /> }, { value: 'columns', label: 'Columns', icon: <Icon name="columns" /> }],
  },
}
export const IconOnly: Story = {
  args: {
    mode: 'selection', 'aria-label': 'Text alignment', defaultValue: ['left'],
    items: [
      { value: 'left', icon: <Icon name="alignLeft" />, 'aria-label': 'Align left' },
      { value: 'center', icon: <Icon name="alignCenter" />, 'aria-label': 'Align center' },
      { value: 'right', icon: <Icon name="alignRight" />, 'aria-label': 'Align right' },
    ],
  },
}
export const DisabledSegment: Story = {
  args: { mode: 'selection', defaultValue: ['day'], items: [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month', disabled: true }] },
}
export const Sizes: Story = {
  render: (args) => <div style={row}>{(['small', 'medium', 'large'] as const).map((s) => <ButtonGroup key={s} {...args} mode="selection" defaultValue={['week']} size={s} aria-label={`Report period, ${s}`} />)}</div>,
}
export const Stacked: Story = {
  args: { mode: 'selection', stack: true, defaultValue: ['week'], 'aria-label': 'Report period, stacked' },
}
export const Interactive: Story = {
  render: (args) => {
    function Demo() {
      const [v, setV] = useState(['week'])
      return <div style={{ display: 'grid', gap: 8 }}><ButtonGroup {...args} mode="selection" value={v} onValueChange={setV} /><span>Selected: {v.join(', ')}</span></div>
    }
    return <Demo />
  },
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <ButtonGroup aria-label="Default and hover" mode="selection" defaultValue={['b']} items={[{ value: 'a', label: 'Default' }, { value: 'b', label: 'Selected' }, { value: 'c', label: 'Hover', 'data-state': 'hover' }, { value: 'd', label: 'Pressed', 'data-state': 'pressed' }, { value: 'e', label: 'Disabled', disabled: true }]} />
      <ButtonGroup aria-label="Focus and selected hover" mode="selection" defaultValue={['b']} items={[{ value: 'a', label: 'Focus', 'data-state': 'focus' }, { value: 'b', label: 'Selected hover', 'data-state': 'hover' }, { value: 'c', label: 'Selected focus', 'data-state': 'focus' }]} />
      <ButtonGroup aria-label="Action group" mode="action" items={[{ value: 'a', label: 'Default' }, { value: 'b', label: 'Hover', 'data-state': 'hover' }, { value: 'c', label: 'Pressed', 'data-state': 'pressed' }, { value: 'd', label: 'Disabled', disabled: true }]} />
    </div>
  ),
}
