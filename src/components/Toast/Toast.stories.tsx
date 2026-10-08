import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toast } from './Toast'
import { ToastProvider, useToast, type ToastOptions } from './ToastProvider'
import { Frame, SamplePage } from '../Dialog/storyFrame'
import { Button } from '../Button'

const meta = {
  title: 'Feedback and status/Toast',
  component: Toast,
  parameters: { tier: 1, group: 'Feedback and status', description: 'Brief, non-blocking notification that confirms an action or surfaces non-critical information, then dismisses itself.' },
  args: { title: 'Segment saved' },
} satisfies Meta<typeof Toast>
export default meta
type Story = StoryObj<typeof meta>

/** Docs only: keep the toasts on screen. Product toasts use the default timing. */
const HOLD = { duration: null, closable: false } as const

const Stage = ({ toasts, children, height = 420, max }: { toasts: ToastOptions[]; children?: ReactNode; height?: number; max?: number }) => (
  <Frame height={height}>
    <ToastProvider portal={false} initialToasts={toasts} max={max}>
      <SamplePage />
      {children}
    </ToastProvider>
  </Frame>
)

export const Severities: Story = {
  render: () => (
    <Stage height={460} toasts={[
      { severity: 'info', title: 'Settings saved', ...HOLD },
      { severity: 'success', title: '3 workflows published', ...HOLD },
      { severity: 'warning', title: 'API rate limit approaching', description: 'You have used 90% of today\'s requests.', ...HOLD },
      { severity: 'error', title: 'Export failed', description: 'The file was too large. Choose fewer columns and try again.', duration: null, action: { label: 'Retry', onClick: () => {} } },
    ]} />
  ),
}

export const WithActions: Story = {
  render: () => (
    <Stage toasts={[
      { severity: 'success', title: 'Segment deleted', action: { label: 'Undo', onClick: () => {} }, ...HOLD },
      { severity: 'error', title: 'Sync failed', action: { label: 'Retry', onClick: () => {} }, duration: null },
      { severity: 'info', title: 'Report is ready', action: { label: 'View report', onClick: () => {} }, ...HOLD },
    ]} />
  ),
}

export const StackMaxThree: Story = {
  name: 'Stack (max 3 visible, rest queue)',
  render: () => (
    <Stage toasts={Array.from({ length: 5 }, (_, i) => ({ severity: 'info' as const, title: `Import ${i + 1} finished`, ...HOLD }))} />
  ),
}

const Controls = () => {
  const t = useToast()
  return (
    <div style={{ position: 'absolute', insetBlockStart: 16, insetInlineEnd: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <Button priority="secondary" size="small" onClick={() => t.success((n) => (n === 1 ? 'Workflow published' : `${n} workflows published`), { aggregateKey: 'publish' })}>Publish workflow</Button>
      <Button priority="secondary" size="small" onClick={() => t.info('Settings saved')}>Save settings</Button>
      <Button priority="secondary" size="small" onClick={() => t.warning('API rate limit approaching')}>Warn</Button>
      <Button priority="secondary" size="small" onClick={() => t.error('Export failed', { description: 'Choose fewer columns and try again.', action: { label: 'Retry', onClick: () => {} } })}>Fail export</Button>
      <Button priority="tertiary" size="small" onClick={t.dismissAll}>Clear all</Button>
    </div>
  )
}
export const Aggregation: Story = {
  name: 'Interactive (aggregation and timing)',
  render: () => (
    <Stage toasts={[]} height={460}>
      <Controls />
    </Stage>
  ),
}

const STATES = [undefined, 'hover', 'pressed', 'focus'] as const
export const ControlStates: Story = {
  name: 'Action and close states (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      {STATES.map((s) => (
        <Toast key={s ?? 'default'} {...args} severity="error" title={`State: ${s ?? 'default'}`} description="Forced states on the action and close controls."
          action={{ label: 'Retry', onClick: () => {} }} closable actionButtonProps={{ 'data-state': s }} closeButtonProps={{ 'data-state': s }} />
      ))}
    </div>
  ),
}
