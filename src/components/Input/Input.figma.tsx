// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Input } from './Input'

figma.connect(Input, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    size: figma.enum('Size', { Small: 'small', Medium: 'medium' }),
    disabled: figma.enum('State', { Disabled: true }),
    readOnly: figma.enum('State', { 'Read-only': true }),
    label: figma.string('Label'),
    helperText: figma.string('Helper text'),
    placeholder: figma.string('Placeholder'),
    leadingIcon: figma.instance('Leading icon'),
    trailingIcon: figma.instance('Trailing icon'),
  },
  example: ({ size, disabled, readOnly, label, helperText, placeholder, leadingIcon, trailingIcon }) => (
    <Input size={size} disabled={disabled} readOnly={readOnly} label={label} helperText={helperText} placeholder={placeholder} leadingIcon={leadingIcon} trailingIcon={trailingIcon} />
  ),
})
