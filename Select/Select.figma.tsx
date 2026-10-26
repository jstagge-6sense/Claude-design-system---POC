// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Select } from './Select'

figma.connect(Select, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    placeholder: figma.string('Placeholder'),
    helperText: figma.string('Helper text'),
    size: figma.enum('Size', { Medium: 'medium', Small: 'small' }),
    searchable: figma.boolean('Searchable'),
    disabled: figma.enum('State', { Disabled: true }),
    loading: figma.enum('State', { Loading: true }),
  },
  example: ({ label, placeholder, helperText, size, searchable, disabled, loading }) => (
    <Select label={label} placeholder={placeholder} helperText={helperText} size={size} searchable={searchable} disabled={disabled} loading={loading} items={[]} />
  ),
})
