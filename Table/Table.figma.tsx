// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Table, type TableColumn } from './Table'

type Row = { id: string; name: string; owner: string }
const columns: TableColumn<Row>[] = [
  { id: 'name', header: 'Account', sortable: true, rowHeader: true },
  { id: 'owner', header: 'Owner' },
]

figma.connect(Table, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    density: figma.enum('Density', { Default: 'default', Compact: 'dense' }),
    selectionMode: figma.enum('Selection', { None: 'none', Single: 'single', Bulk: 'multiple' }),
    loading: figma.enum('State', { Loading: true }),
    stickyHeader: figma.boolean('Sticky header'),
  },
  example: ({ density, selectionMode, loading, stickyHeader }) => (
    <Table<Row>
      caption="Accounts"
      columns={columns}
      rows={[]}
      getRowId={(r) => r.id}
      density={density}
      selectionMode={selectionMode}
      loading={loading}
      stickyHeader={stickyHeader}
    />
  ),
})
