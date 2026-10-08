import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem } from './Accordion'
import { Badge } from '../Badge'

const meta = {
  title: 'Container/Accordion',
  component: Accordion,
  parameters: { tier: 2, group: 'Container', description: 'Progressive disclosure that shows and hides sections of related content.' },
  args: { defaultValue: ['firmographics'] },
  decorators: [(Story) => <div style={{ maxInlineSize: '36rem' }}><Story /></div>],
} satisfies Meta<typeof Accordion>
export default meta
type Story = StoryObj<typeof meta>

const items = (
  <>
    <AccordionItem value="firmographics" title="Firmographics" description="Industry, size and region">
      Match accounts by industry, employee count, annual revenue and headquarters region.
    </AccordionItem>
    <AccordionItem value="technographics" title="Technographics" description="Installed technology">
      Match accounts by the marketing, sales and data tools detected on their domains.
    </AccordionItem>
    <AccordionItem value="intent" title="Buying intent" meta={<Badge kind="count" count={3} />}>
      Match accounts researching your category keywords in the last 30 days.
    </AccordionItem>
  </>
)

export const MultiExpand: Story = { name: 'Multi expand (default)', render: (args) => <Accordion {...args}>{items}</Accordion> }
export const SingleExpand: Story = { name: 'Single expand', args: { type: 'single', defaultValue: ['technographics'] }, render: (args) => <Accordion {...args}>{items}</Accordion> }
export const ExpandCollapseAll: Story = { name: 'Expand and collapse all', args: { expandAll: true }, render: (args) => <Accordion {...args}>{items}</Accordion> }
export const WithCheckbox: Story = {
  name: 'With checkbox',
  args: { checkbox: true, defaultCheckedValues: ['firmographics'], defaultValue: ['firmographics', 'intent'] },
  render: (args) => <Accordion {...args}>{items}</Accordion>,
}
export const Disabled: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="firmographics" title="Firmographics">Match accounts by industry and size.</AccordionItem>
      <AccordionItem value="locked" title="Custom fields" description="Available on the Enterprise plan" disabled>Not available.</AccordionItem>
    </Accordion>
  ),
}
export const LoadingContent: Story = {
  name: 'Loading content',
  args: { defaultValue: ['intent'] },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="firmographics" title="Firmographics">Match accounts by industry and size.</AccordionItem>
      <AccordionItem value="intent" title="Buying intent" loading>Loaded content.</AccordionItem>
    </Accordion>
  ),
}

export const StateMatrix: Story = {
  name: 'States (forced)',
  args: { defaultValue: ['expanded'] },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="collapsed" title="Collapsed">Hidden until opened.</AccordionItem>
      <AccordionItem value="expanded" title="Expanded">Visible content for the open panel.</AccordionItem>
      <AccordionItem value="hover" title="Hover" data-state="hover">Hover state forced.</AccordionItem>
      <AccordionItem value="focus" title="Focus" data-state="focus">Focus state forced.</AccordionItem>
      <AccordionItem value="disabled" title="Disabled" disabled>Not available.</AccordionItem>
      <AccordionItem value="loading" title="Loading" loading>Loaded content.</AccordionItem>
    </Accordion>
  ),
}
