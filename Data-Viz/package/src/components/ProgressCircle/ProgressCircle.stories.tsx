import type { Meta, StoryObj } from '@storybook/react'
import { ProgressCircle } from './ProgressCircle'
import { Icon } from '../../icons'

const meta = {
  title: 'Feedback/ProgressCircle',
  component: ProgressCircle,
  parameters: { tier: 0, group: 'Feedback and status', description: 'Compact circular completion indicator for dashboards and metrics. Not for loading states.' },
  args: { label: 'Profile completeness', value: 65 },
} satisfies Meta<typeof ProgressCircle>
export default meta
type Story = StoryObj<typeof meta>

const row = { display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' } as const

export const Standard: Story = {}
export const CenterLabel: Story = {
  render: () => (
    <div style={row}>
      <ProgressCircle label="Onboarding tasks" value={60} size="large" centerLabel="12/20" valueText="12 of 20 tasks" />
      <ProgressCircle label="Quota attainment" value={82} size="large" centerLabel={<Icon name="trendUp" />} valueText="82% of quota" />
    </div>
  ),
}
export const Sizes: Story = {
  render: () => (
    <div style={row}>
      {(['small', 'medium', 'large'] as const).map((s) => <ProgressCircle key={s} label={`Coverage ${s}`} value={45} size={s} />)}
    </div>
  ),
}
export const Complete: Story = { args: { value: 100, label: 'Setup complete', size: 'large' } }
export const ErrorState: Story = { name: 'Error', args: { value: 40, state: 'error', label: 'Sync progress', size: 'large' } }
export const Matrix: Story = {
  name: 'States (matrix)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 24, alignItems: 'center' }}>
      {(['small', 'medium', 'large'] as const).map((s) => (
        <>
          <ProgressCircle key={s + 'a'} label="Default" value={25} size={s} />
          <ProgressCircle key={s + 'b'} label="Half" value={50} size={s} />
          <ProgressCircle key={s + 'c'} label="Complete" value={100} size={s} />
          <ProgressCircle key={s + 'd'} label="Error" value={70} size={s} state="error" />
        </>
      ))}
    </div>
  ),
}
