// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { DatePicker } from './DatePicker'

figma.connect(DatePicker, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    mode: figma.enum('Variant', { 'Single date': 'single', 'Date range': 'range' }),
    presets: figma.enum('Variant', { 'With presets': true }),
    withTime: figma.enum('Variant', { 'With time': true }),
    disabled: figma.enum('State', { Disabled: true }),
    helperText: figma.string('Helper text'),
  },
  example: ({ label, mode, presets, withTime, disabled, helperText }) => (
    <DatePicker label={label} mode={mode} presets={presets} withTime={withTime} disabled={disabled} helperText={helperText} />
  ),
})
