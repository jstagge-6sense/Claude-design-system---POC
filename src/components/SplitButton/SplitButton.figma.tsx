// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { SplitButton } from './SplitButton'

figma.connect(SplitButton, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    priority: figma.enum('Priority', { Primary: 'primary', Secondary: 'secondary' }),
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }),
    disabled: figma.enum('State', { Disabled: true }),
    label: figma.string('Label'),
  },
  example: ({ priority, size, disabled, label }) => (
    <SplitButton priority={priority} size={size} disabled={disabled} items={[]}>{label}</SplitButton>
  ),
})
