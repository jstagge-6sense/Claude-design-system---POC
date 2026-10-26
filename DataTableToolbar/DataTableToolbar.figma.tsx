// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { DataTableToolbar } from './DataTableToolbar'

figma.connect(DataTableToolbar, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    search: figma.boolean('Search'),
    activeFilterCount: figma.enum('State', { Filtered: 3 }),
    selectedCount: figma.enum('State', { 'Bulk selection': 3 }),
  },
  example: ({ search, activeFilterCount, selectedCount }) => (
    <DataTableToolbar search={search} activeFilterCount={activeFilterCount} selectedCount={selectedCount} onExport={() => undefined} />
  ),
})
