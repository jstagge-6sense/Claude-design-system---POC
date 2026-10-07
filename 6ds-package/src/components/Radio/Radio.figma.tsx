// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Radio, RadioGroup } from './Radio'

figma.connect(Radio, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    description: figma.boolean('Description', { true: figma.string('Description text'), false: undefined }),
    disabled: figma.enum('State', { Disabled: true }),
  },
  example: ({ label, description, disabled }) => (
    <RadioGroup legend="Group label" defaultValue="a">
      <Radio value="a" label={label} description={description} disabled={disabled} />
    </RadioGroup>
  ),
})
