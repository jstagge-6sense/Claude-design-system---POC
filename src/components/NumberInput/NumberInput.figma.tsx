// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { NumberInput } from './NumberInput'

figma.connect(NumberInput, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    size: figma.enum('Size', { Small: 'small', Medium: 'medium' }),
    steppers: figma.boolean('Steppers'),
    unit: figma.string('Unit'),
    disabled: figma.enum('State', { Disabled: true }),
    readOnly: figma.enum('State', { 'Read-only': true }),
    label: figma.string('Label'),
    helperText: figma.string('Helper text'),
  },
  example: ({ size, steppers, unit, disabled, readOnly, label, helperText }) => (
    <NumberInput size={size} steppers={steppers} unit={unit} disabled={disabled} readOnly={readOnly} label={label} helperText={helperText} />
  ),
})
