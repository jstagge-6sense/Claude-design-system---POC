// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { SkeletonLoader } from './SkeletonLoader'

figma.connect(SkeletonLoader, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Text: 'text', Card: 'card', Table: 'table', Custom: 'custom' }),
    lines: figma.string('Lines'),
  },
  example: ({ variant }) => <SkeletonLoader variant={variant} />,
})
