// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Slider } from './Slider'

figma.connect(Slider, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    discrete: figma.enum('Type', { Discrete: true, Continuous: false }),
    showValueLabel: figma.boolean('Value label'),
    withInput: figma.boolean('With input'),
    disabled: figma.enum('State', { Disabled: true }),
    label: figma.string('Label'),
    helperText: figma.string('Helper text'),
  },
  example: ({ discrete, showValueLabel, withInput, disabled, label, helperText }) => (
    <Slider discrete={discrete} showValueLabel={showValueLabel} withInput={withInput} disabled={disabled} label={label} helperText={helperText} />
  ),
})
