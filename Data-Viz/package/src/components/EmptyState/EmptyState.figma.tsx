// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { EmptyState } from './EmptyState'
import { Button } from '../Button'

figma.connect(EmptyState, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('State', { 'First use': 'firstUse', 'No results': 'noResults', Error: 'error', 'No data': 'noData', 'No permission': 'noPermission' }),
    title: figma.string('Title'),
    description: figma.string('Description'),
    illustration: figma.instance('Illustration'),
  },
  example: ({ variant, title, description, illustration }) => (
    <EmptyState variant={variant} title={title} description={description} illustration={illustration} action={<Button>Create item</Button>} />
  ),
})
