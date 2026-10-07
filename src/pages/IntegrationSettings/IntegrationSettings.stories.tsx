import type { Meta, StoryObj } from '@storybook/react'
import { IntegrationSettings } from './IntegrationSettings'

const meta = {
  title: 'Pages/Integration settings',
  component: IntegrationSettings,
  parameters: {
    tier: 4,
    group: 'Pages',
    layout: 'fullscreen',
    description: 'CRM integration settings, API settings tab (Figma Integration Library, node 23:82656). Built only from library components. Sample copy is placeholder text from the design.',
  },
} satisfies Meta<typeof IntegrationSettings>
export default meta
type Story = StoryObj<typeof meta>

export const ApiSettings: Story = { name: 'API settings', args: {} }
export const ConnectionOpen: Story = { name: 'Connection open', args: { connectionOpen: true } }
