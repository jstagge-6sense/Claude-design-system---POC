import type { Meta, StoryObj } from '@storybook/react'
import { Truncate } from './Truncate'

const meta = {
  title: 'Navigation and structure/Truncate',
  component: Truncate,
  parameters: { tier: 0, group: 'Patterns', description: 'Text overflow pattern: single-line, multi-line clamp, middle and expandable. Full text is always available.' },
  args: { children: 'Q3 enterprise expansion campaign for accounts in the late buying stage across North America' },
} satisfies Meta<typeof Truncate>
export default meta
type Story = StoryObj<typeof meta>

const box = { inlineSize: 280, display: 'grid', gap: 16 } as const
const LONG = 'Q3 enterprise expansion campaign for accounts in the late buying stage across North America and EMEA, including renewals and partner-sourced opportunities.'

export const SingleLine: Story = { render: () => <div style={box}><Truncate>{LONG}</Truncate></div> }
export const MultiLine: Story = { render: () => <div style={box}><Truncate lines={3}>{LONG}</Truncate></div> }
export const Middle: Story = {
  render: () => (
    <div style={box}>
      <Truncate middle endChars={14}>/exports/2026/q3/enterprise-accounts-late-stage-export-final.csv</Truncate>
      <Truncate middle endChars={12}>https://app.example.com/segments/8f3a1c2e-77b4-4a0e-9d51-2c6e1b9a0f43/overview</Truncate>
    </div>
  ),
}
export const Expandable: Story = { render: () => <div style={box}><Truncate lines={2} expandable>{LONG}</Truncate></div> }
export const Matrix: Story = {
  name: 'Variants (matrix)',
  render: () => (
    <div style={box}>
      <Truncate>{LONG}</Truncate>
      <Truncate lines={2}>{LONG}</Truncate>
      <Truncate middle endChars={12}>/exports/2026/q3/enterprise-accounts-final.csv</Truncate>
      <Truncate lines={2} expandable expanded>{LONG}</Truncate>
      <Truncate>Short text fits.</Truncate>
    </div>
  ),
}
