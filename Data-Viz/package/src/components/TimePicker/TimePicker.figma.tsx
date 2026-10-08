// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { TimePicker } from './TimePicker'

figma.connect(TimePicker, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    granular: figma.enum('Variant', { Granular: true }),
    presets: figma.enum('Variant', { 'With presets': true }),
    hourCycle: figma.enum('Hour cycle', { '12h': 'h12', '24h': 'h23' }),
    disabled: figma.enum('State', { Disabled: true }),
    helperText: figma.string('Helper text'),
  },
  example: ({ label, granular, presets, hourCycle, disabled, helperText }) => (
    <TimePicker label={label} granular={granular} presets={presets} hourCycle={hourCycle} disabled={disabled} helperText={helperText} />
  ),
})
