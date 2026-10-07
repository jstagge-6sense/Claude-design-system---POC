// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Divider } from './Divider'

figma.connect(Divider, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    orientation: figma.enum('Orientation', { Horizontal: 'horizontal', Vertical: 'vertical' }),
    inset: figma.boolean('Inset'),
    label: figma.string('Label'),
  },
  example: ({ orientation, inset, label }) => <Divider orientation={orientation} inset={inset} label={label} />,
})
