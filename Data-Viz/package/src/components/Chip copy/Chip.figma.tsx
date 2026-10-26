// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Chip } from './Chip'

figma.connect(Chip, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Type', { Dismissible: 'dismissible', Choice: 'choice', 'View-only': 'viewOnly' }),
    selected: figma.enum('State', { Selected: true }),
    disabled: figma.enum('State', { Disabled: true }),
    label: figma.string('Label'),
    leading: figma.instance('Leading icon or avatar'),
  },
  example: ({ variant, selected, disabled, label, leading }) => (
    <Chip variant={variant} selected={selected} disabled={disabled} leading={leading}>{label}</Chip>
  ),
})
