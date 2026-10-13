import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ProgressSteps, type ProgressStep } from './ProgressSteps'
import { Button } from '../Button'

const meta = {
  title: 'Navigation and structure/ProgressSteps',
  component: ProgressSteps,
  parameters: {
    tier: 2,
    group: 'Navigation and structure',
    description: 'Shows position in a multi-step process. Use 5 to 7 steps at most, always with text, and never make future steps clickable when they need earlier steps.',
  },
} satisfies Meta<typeof ProgressSteps>
export default meta
type Story = StoryObj<typeof meta>

const STEPS: ProgressStep[] = [
  { id: 'account', label: 'Account details', description: 'Name and owner' },
  { id: 'data', label: 'Connect data', description: 'CRM and ad platforms' },
  { id: 'audience', label: 'Choose audience' },
  { id: 'review', label: 'Review' },
  { id: 'launch', label: 'Launch', optional: true },
]

function Interactive(args: Parameters<typeof ProgressSteps>[0]) {
  const [current, setCurrent] = useState(2)
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ProgressSteps {...args} current={current} onCurrentChange={setCurrent} />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button priority="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Back</Button>
        <Button disabled={current === args.steps.length - 1} onClick={() => setCurrent((c) => c + 1)}>Continue</Button>
      </div>
    </div>
  )
}

/** Horizontal: desktop workflows, checkout and setup flows. Click a completed step to go back. */
export const Horizontal: Story = { args: { steps: STEPS, orientation: 'horizontal' }, render: (a) => <Interactive {...a} /> }

/** Vertical: long processes, mobile and sidebars. */
export const Vertical: Story = { args: { steps: STEPS, orientation: 'vertical' }, render: (a) => <Interactive {...a} /> }

/** Compact: numbers only for limited space. The active step keeps its text. */
export const Compact: Story = { args: { steps: STEPS, compact: true }, render: (a) => <Interactive {...a} /> }

/** Linear: future steps are non-interactive until reached. */
export const Linear: Story = { args: { steps: STEPS, mode: 'linear', current: 2 } }

/** Non-linear is rare: any available step can be opened. Document why the order does not matter before using it. */
export const NonLinear: Story = {
  args: {
    mode: 'nonLinear',
    current: 1,
    steps: [{ id: 'profile', label: 'Profile' }, { id: 'billing', label: 'Billing' }, { id: 'team', label: 'Team' }, { id: 'security', label: 'Security', status: 'disabled' }],
  },
}

export const WithError: Story = {
  args: {
    current: 3,
    steps: [
      STEPS[0],
      { ...STEPS[1], status: 'error', errorMessage: 'The CRM connection expired. Reconnect to continue.' },
      STEPS[2],
      STEPS[3],
      STEPS[4],
    ],
  },
}

export const WithDisabled: Story = {
  args: { current: 1, steps: [STEPS[0], STEPS[1], { ...STEPS[2], status: 'disabled', description: 'Not in this plan' }, STEPS[3]] },
}

export const AllStatuses: Story = {
  name: 'States (forced)',
  args: { current: 1 },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <ProgressSteps
        aria-label="Status overview"
        current={1}
        steps={[
          { id: 'a', label: 'Completed', status: 'completed' },
          { id: 'b', label: 'Active', status: 'active' },
          { id: 'c', label: 'Upcoming', status: 'upcoming' },
          { id: 'd', label: 'Error', status: 'error', errorMessage: 'Fix the highlighted fields.' },
          { id: 'e', label: 'Disabled', status: 'disabled' },
        ]}
      />
      <ProgressSteps
        aria-label="Interactive states"
        current={3}
        steps={[
          { id: 'a', label: 'Default', status: 'completed' },
          { id: 'b', label: 'Hover', status: 'completed', 'data-state': 'hover' },
          { id: 'c', label: 'Pressed', status: 'completed', 'data-state': 'pressed' },
          { id: 'd', label: 'Focus', status: 'completed', 'data-state': 'focus' },
          { id: 'e', label: 'Current', status: 'active' },
        ]}
      />
    </div>
  ),
}

export const RightToLeft: Story = { name: 'RTL (direction reverses)', args: { steps: STEPS, current: 2 }, render: (a) => <div dir="rtl"><ProgressSteps {...a} /></div> }
