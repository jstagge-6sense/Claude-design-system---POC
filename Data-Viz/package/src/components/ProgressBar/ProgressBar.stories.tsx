import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  parameters: { tier: 2, group: 'Feedback and status', description: 'Measurable progress for actions longer than about 10 seconds. Use indeterminate only when progress cannot be measured.' },
  args: { label: 'Importing accounts', value: 45 },
} satisfies Meta<typeof ProgressBar>
export default meta
type Story = StoryObj<typeof meta>

const frame = { inlineSize: 420, display: 'grid', gap: 24 } as const

export const Determinate: Story = { render: (args) => <div style={frame}><ProgressBar {...args} /></div> }
export const Indeterminate: Story = {
  render: () => <div style={frame}><ProgressBar label="Syncing with your CRM" statusText="This can take a few minutes." value={undefined} /></div>,
}
export const Complete: Story = {
  render: () => <div style={frame}><ProgressBar label="Importing accounts" value={100} showValue statusText="2,480 accounts imported." /></div>,
}
export const ErrorState: Story = {
  name: 'Error',
  render: () => <div style={frame}><ProgressBar label="Importing accounts" value={62} state="error" showValue statusText="Import stopped at row 1,540. Fix the file and try again." /></div>,
}
export const WithPercentageLabel: Story = { render: () => <div style={frame}><ProgressBar label="Uploading file" value={72} showValue /></div> }
export const WithStatusText: Story = {
  render: () => <div style={frame}><ProgressBar label="Building audience" value={38} showValue statusText="Matching 12,000 contacts to accounts." /></div>,
}
export const MultiStep: Story = {
  render: () => (
    <div style={frame}>
      <ProgressBar label="Launching campaign" steps={4} currentStep={3} value={50} statusText="Syncing audiences" />
    </div>
  ),
}
export const Matrix: Story = {
  name: 'States (matrix)',
  render: () => (
    <div style={frame}>
      <ProgressBar label="Default" value={35} showValue statusText="In progress" />
      <ProgressBar label="Indeterminate" statusText="Working on it" />
      <ProgressBar label="Complete" value={100} showValue />
      <ProgressBar label="Error" value={60} state="error" showValue />
      <ProgressBar label="Multi-step" steps={3} currentStep={2} value={40} showValue />
    </div>
  ),
}
