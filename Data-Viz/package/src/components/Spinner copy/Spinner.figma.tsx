// Code Connect. Replace FILE_KEY and NODE_ID from the Figma state ledger.
import figma from '@figma/code-connect'
import { Spinner } from './Spinner'

figma.connect(Spinner, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: { size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }), label: figma.string('Label') },
  example: ({ size, label }) => <Spinner size={size} label={label} />,
})
