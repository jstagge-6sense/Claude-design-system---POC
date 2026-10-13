// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Button } from './Button'

figma.connect(Button, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    priority: figma.enum('Priority', { Primary: 'primary', Secondary: 'secondary', Tertiary: 'tertiary', Destructive: 'destructive' }),
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }),
    disabled: figma.enum('State', { Disabled: true }),
    label: figma.string('Label'),
    icon: figma.instance('Leading icon'),
  },
  example: ({ priority, size, disabled, label, icon }) => (
    <Button priority={priority} size={size} disabled={disabled} icon={icon}>{label}</Button>
  ),
})
