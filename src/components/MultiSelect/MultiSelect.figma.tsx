// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { MultiSelect } from './MultiSelect'

figma.connect(MultiSelect, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    placeholder: figma.string('Placeholder'),
    helperText: figma.string('Helper text'),
    size: figma.enum('Size', { Medium: 'medium', Small: 'small' }),
    searchable: figma.boolean('Searchable'),
    showChips: figma.boolean('Chips'),
    selectAll: figma.boolean('Select all'),
    disabled: figma.enum('State', { Disabled: true }),
  },
  example: ({ label, placeholder, helperText, size, searchable, showChips, selectAll, disabled }) => (
    <MultiSelect label={label} placeholder={placeholder} helperText={helperText} size={size} searchable={searchable} showChips={showChips} selectAll={selectAll} disabled={disabled} items={[]} />
  ),
})
