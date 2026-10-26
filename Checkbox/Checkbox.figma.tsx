// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Checkbox } from './Checkbox'

figma.connect(Checkbox, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    description: figma.boolean('Description', { true: figma.string('Description text'), false: undefined }),
    checked: figma.enum('Value', { Checked: true, Unchecked: false }),
    indeterminate: figma.enum('Value', { Indeterminate: true }),
    disabled: figma.enum('State', { Disabled: true }),
    error: figma.enum('State', { Error: true }),
  },
  example: ({ label, description, checked, indeterminate, disabled, error }) => (
    <Checkbox label={label} description={description} defaultChecked={checked} indeterminate={indeterminate} disabled={disabled} error={error} />
  ),
})
