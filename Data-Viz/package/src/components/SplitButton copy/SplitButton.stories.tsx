import { Fragment } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SplitButton } from './SplitButton'
import type { MenuEntry } from '../Menu'
import { Icon } from '../../icons'

const SAVE: MenuEntry[] = [
  { value: 'save-as', label: 'Save as new segment' },
  { value: 'save-close', label: 'Save and close' },
  { value: 'save-template', label: 'Save as template' },
]

const meta = {
  title: 'Action/Split button',
  component: SplitButton,
  parameters: { tier: 2, group: 'Action', description: 'A default action joined to a chevron that opens related alternatives. Two independent controls.' },
  args: { children: 'Save segment', items: SAVE, portal: false },
} satisfies Meta<typeof SplitButton>
export default meta
type Story = StoryObj<typeof meta>

const frame = { position: 'relative', minBlockSize: 200, padding: 16 } as const

export const Primary: Story = { render: (args) => <div style={frame}><SplitButton {...args} priority="primary" /></div> }
export const Secondary: Story = { render: (args) => <div style={frame}><SplitButton {...args} priority="secondary" /></div> }
export const WithIcon: Story = { render: (args) => <div style={frame}><SplitButton {...args} priority="secondary" icon={<Icon name="download" />} items={[{ value: 'csv', label: 'Export as CSV' }, { value: 'xlsx', label: 'Export as Excel' }]}>Export</SplitButton></div> }
export const Sizes: Story = {
  render: (args) => (
    <div style={{ ...frame, minBlockSize: 0, display: 'flex', gap: 24, alignItems: 'center' }}>
      {(['small', 'medium', 'large'] as const).map((s) => <SplitButton key={s} {...args} size={s}>{s}</SplitButton>)}
    </div>
  ),
}
export const Open: Story = { render: (args) => <div style={frame}><SplitButton {...args} defaultOpen /></div> }
export const OpenSecondary: Story = { render: (args) => <div style={frame}><SplitButton {...args} priority="secondary" defaultOpen /></div> }
export const Disabled: Story = { render: (args) => <div style={{ ...frame, minBlockSize: 0, display: 'flex', gap: 24 }}><SplitButton {...args} disabled unavailableReason="Add a segment name first." /><SplitButton {...args} priority="secondary" disabled>Save segment</SplitButton></div> }
export const Loading: Story = { render: (args) => <div style={{ ...frame, minBlockSize: 0 }}><SplitButton {...args} loading>Saving</SplitButton></div> }
export const Rtl: Story = {
  name: 'Right to left',
  render: (args) => <div dir="rtl" style={frame}><SplitButton {...args} defaultOpen>Save segment</SplitButton></div>,
}

const SECTIONS = [
  { label: 'Default', primary: undefined, trigger: undefined },
  { label: 'Primary hover', primary: 'hover', trigger: undefined },
  { label: 'Trigger hover', primary: undefined, trigger: 'hover' },
  { label: 'Primary pressed', primary: 'pressed', trigger: undefined },
  { label: 'Trigger pressed', primary: undefined, trigger: 'pressed' },
  { label: 'Primary focus', primary: 'focus', trigger: undefined },
  { label: 'Trigger focus', primary: undefined, trigger: 'focus' },
] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 24, alignItems: 'center' }}>
      {(['primary', 'secondary'] as const).map((p) => (
        <Fragment key={p}>
          {SECTIONS.map((s) => (
            <div key={p + s.label} style={{ display: 'grid', gap: 8 }}>
              <small>{p} / {s.label}</small>
              <SplitButton {...args} priority={p} data-state={s.primary} data-trigger-state={s.trigger} />
            </div>
          ))}
          <div key={p + 'dis'} style={{ display: 'grid', gap: 8 }}>
            <small>{p} / Disabled</small>
            <SplitButton {...args} priority={p} disabled />
          </div>
        </Fragment>
      ))}
    </div>
  ),
}
