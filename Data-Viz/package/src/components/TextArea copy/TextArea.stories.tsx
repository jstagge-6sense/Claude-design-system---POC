import type { Meta, StoryObj } from '@storybook/react'
import { TextArea } from './TextArea'
import { Button } from '../Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Data entry/Text area',
  component: TextArea,
  parameters: { tier: 2, group: 'Data entry', description: 'Multi-line text field. Inherits Input states, validation timing and helper layout.' },
  args: { label: 'Description', placeholder: 'What is this segment for?' },
  decorators: [(Story) => <div style={{ maxInlineSize: 420 }}><Story /></div>],
} satisfies Meta<typeof TextArea>
export default meta
type Story = StoryObj<typeof meta>

const LONG = 'Accounts with 500 to 5,000 employees in the EMEA region that visited the pricing page twice in the last 14 days.\nExclude existing customers and open opportunities.\nRefresh weekly and notify the regional owner when an account enters the segment.\nReview the match criteria each quarter.\nShare the results with sales development.\nCheck overlaps with the APAC segment.\nConfirm the intent keywords.\nArchive when the campaign ends.'

export const Standard: Story = { args: { rows: 4, helperText: 'Fixed height. Scrolls when the text is longer.' } }
export const WithCharacterCounter: Story = { args: { maxLength: 200, defaultValue: 'Mid-market SaaS accounts showing late-stage buying intent.', rows: 3, helperText: 'Visible in segment lists.' } }
export const AutoResize: Story = { args: { autoResize: true, rows: 2, maxRows: 5, defaultValue: LONG, helperText: 'Grows to 5 rows, then scrolls.' } }
export const ResizeHandle: Story = { args: { rows: 3, resize: 'vertical', helperText: 'Drag the corner, or press Alt+Arrow Down / Alt+Arrow Up to resize.' } }
export const Optional: Story = { args: { requirement: 'optional', rows: 3 } }
export const WithInlineActions: Story = {
  args: {
    rows: 4,
    defaultValue: 'Write a short description of this audience.',
    actions: (
      <>
        <Button priority="tertiary" size="small" icon={<Icon name="sparkle" />}>Generate with AI</Button>
        <Button priority="tertiary" size="small" iconOnly icon={<Icon name="bold" />} aria-label="Bold" />
        <Button priority="tertiary" size="small" iconOnly icon={<Icon name="italic" />} aria-label="Italic" />
        <Button priority="tertiary" size="small" iconOnly icon={<Icon name="link" />} aria-label="Insert link" />
      </>
    ),
  },
}
const tag = (t: string) => <Button key={t} priority="secondary" size="small" trailingIcon={<Icon name="close" />}>{t}</Button>
export const RichWithTags: Story = {
  name: 'Rich textarea with tags',
  args: {
    label: 'Email body',
    rows: 4,
    defaultValue: 'Hi, we noticed your team has been researching our platform.',
    tags: <>{tag('First name')}{tag('Account')}{tag('Owner')}</>,
    actions: <Button priority="tertiary" size="small" icon={<Icon name="sparkle" />}>Rewrite</Button>,
  },
}
export const Error: Story = { args: { defaultValue: 'x', error: 'Enter at least 20 characters so teammates know what this segment is for.', rows: 3 } }
export const Disabled: Story = {
  args: { disabled: true, rows: 3, defaultValue: 'Locked while the segment syncs.', tags: <>{tag('First name')}{tag('Account')}</>, actions: <Button priority="tertiary" size="small" icon={<Icon name="sparkle" />}>Generate with AI</Button> },
}
export const ReadOnly: Story = { args: { readOnly: true, rows: 3, defaultValue: 'Imported from CRM. Edit the source record to change this text.', helperText: 'Read-only.' } }

const ROWS: Array<{ name: string; props: Record<string, unknown>; state?: 'hover' | 'focus' }> = [
  { name: 'Default', props: {} },
  { name: 'Hover (forced)', props: {}, state: 'hover' },
  { name: 'Focus (forced)', props: {}, state: 'focus' },
  { name: 'Filled', props: { defaultValue: 'Enterprise accounts in EMEA.' } },
  { name: 'Error', props: { defaultValue: 'x', error: 'Enter at least 20 characters.' } },
  { name: 'Disabled', props: { defaultValue: 'Enterprise accounts in EMEA.', disabled: true } },
  { name: 'Read-only', props: { defaultValue: 'Imported from CRM.', readOnly: true } },
]
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: 24 }}>
      {ROWS.map((r) => <TextArea key={r.name} {...args} rows={3} {...r.props} label={r.name} data-state={r.state} />)}
    </div>
  ),
}
