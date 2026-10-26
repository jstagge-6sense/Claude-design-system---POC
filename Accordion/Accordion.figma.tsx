// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { AccordionItem } from './Accordion'

figma.connect(AccordionItem, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    title: figma.string('Title'),
    description: figma.string('Description'),
    disabled: figma.enum('State', { Disabled: true }),
    loading: figma.enum('State', { Loading: true }),
    checkbox: figma.boolean('With checkbox'),
  },
  example: ({ title, description, disabled, loading, checkbox }) => (
    <AccordionItem value="item" title={title} description={description} disabled={disabled} loading={loading} checkbox={checkbox}>
      Panel content
    </AccordionItem>
  ),
})
