// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Toggle } from './Toggle'

figma.connect(Toggle, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    description: figma.boolean('Description', { true: figma.string('Description text'), false: undefined }),
    size: figma.enum('Size', { Small: 'small', Medium: 'medium' }),
    checked: figma.enum('Value', { On: true, Off: false }),
    disabled: figma.enum('State', { Disabled: true }),
    loading: figma.enum('State', { Loading: true }),
  },
  example: ({ label, description, size, checked, disabled, loading }) => (
    <Toggle label={label} description={description} size={size} defaultChecked={checked} disabled={disabled} loading={loading} />
  ),
})
