// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Sticky } from './Sticky'

figma.connect(Sticky, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    edge: figma.enum('Edge', { Top: 'top', Bottom: 'bottom', Start: 'start' }),
  },
  example: ({ edge }) => <Sticky edge={edge}>Sticky content</Sticky>,
})
