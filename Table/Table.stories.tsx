import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Table, type TableColumn, type TableSort } from './Table'
import { useTableColumns } from './useTableColumns'
import { ACCOUNTS, type Account } from './sampleData'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { EmptyState } from '../EmptyState'
import { DataTableToolbar } from '../DataTableToolbar'
import { Icon } from '../../icons'

const meta = {
  title: 'Navigation and structure/Table',
  component: Table,
  parameters: {
    tier: 1,
    group: 'Navigation and structure',
    description: 'Semantic data table: sorting, single and bulk selection, loading, empty and error states, expandable rows, inline editing, sticky header and first column.',
  },
} satisfies Meta<typeof Table>
export default meta
type Story = StoryObj<typeof meta>

const TONE = { Target: 'neutral', Engaged: 'info', Opportunity: 'warning', Customer: 'success' } as const
const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const COLUMNS: TableColumn<Account>[] = [
  { id: 'name', header: 'Account', sortable: true, rowHeader: true, sizing: 'minmax', minWidth: 180, maxWidth: 280 },
  { id: 'owner', header: 'Owner', sortable: true, sizing: 'fluid' },
  { id: 'stage', header: 'Stage', cell: (r) => <Badge tone={TONE[r.stage]}>{r.stage}</Badge>, sizing: 'fixed', width: 140 },
  { id: 'score', header: 'Fit score', sortable: true, align: 'end', sizing: 'fixed', width: 120 },
  { id: 'arr', header: 'ARR', sortable: true, align: 'end', cell: (r) => money(r.arr), sizing: 'fixed', width: 140 },
  { id: 'domain', header: 'Domain', secondary: true, truncate: true, sizing: 'minmax', minWidth: 160, maxWidth: 220 },
]

function sortRows(rows: Account[], sort: TableSort | null) {
  if (!sort) return rows
  const k = sort.columnId as keyof Account
  const dir = sort.direction === 'ascending' ? 1 : -1
  return [...rows].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir)
}

const footer = (n: number) => <span>Showing 1 to {n} of 240 accounts</span>
const PagePlaceholder = () => <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}><span>Showing 1 to 8 of 240 accounts</span><span style={{ display: 'flex', gap: 8 }}><Button size="small" priority="secondary" disabled>Previous</Button><Button size="small" priority="secondary">Next</Button></span></div>

export const Standard: Story = {
  args: { caption: 'Accounts', columns: COLUMNS as TableColumn<unknown>[], rows: [], getRowId: () => '' },
  render: () => <Table caption="Accounts" columns={COLUMNS} rows={ACCOUNTS.slice(0, 8)} getRowId={(r) => r.id} footer={footer(8)} />,
}

export const SelectionAndBulkActions: Story = {
  name: 'Selection and bulk actions',
  args: Standard.args,
  render: () => {
    const [selected, setSelected] = useState<string[]>(['acct-2', 'acct-3'])
    return (
      <Table
        caption="Accounts with selection"
        columns={COLUMNS}
        rows={ACCOUNTS.slice(0, 8)}
        getRowId={(r) => r.id}
        selectionMode="multiple"
        selectedIds={selected}
        onSelectionChange={setSelected}
        toolbar={
          <DataTableToolbar
            search={false}
            selectedCount={selected.length}
            onClearSelection={() => setSelected([])}
            onExport={() => undefined}
            bulkActions={<><Button size="small" priority="secondary" icon={<Icon name="users" />}>Assign owner</Button><Button size="small" priority="destructive" icon={<Icon name="trash" />}>Remove accounts</Button></>}
          />
        }
      />
    )
  },
}

export const SingleSelection: Story = {
  args: Standard.args,
  render: () => <Table caption="Pick one account" columns={COLUMNS.slice(0, 4)} rows={ACCOUNTS.slice(0, 5)} getRowId={(r) => r.id} selectionMode="single" defaultSelectedIds={['acct-1']} />,
}

export const Sorting: Story = {
  args: Standard.args,
  render: () => {
    const [sort, setSort] = useState<TableSort | null>({ columnId: 'arr', direction: 'descending' })
    return <Table caption="Accounts sorted" columns={COLUMNS} rows={sortRows(ACCOUNTS.slice(0, 8), sort)} getRowId={(r) => r.id} sort={sort} onSortChange={setSort} />
  },
}

export const Loading: Story = {
  args: Standard.args,
  render: () => <Table caption="Accounts loading" columns={COLUMNS} rows={[]} getRowId={(r: Account) => r.id} loading loadingRows={6} />,
}

export const Empty: Story = {
  args: Standard.args,
  render: () => (
    <Table
      caption="Accounts empty"
      columns={COLUMNS}
      rows={[]}
      getRowId={(r: Account) => r.id}
      emptyState={<EmptyState variant="noResults" title="No accounts match your filters" description="Clear a filter or search by domain to see more accounts." action={<Button priority="secondary">Clear filters</Button>} />}
    />
  ),
}

export const TableError: Story = {
  name: 'Error (table-level)',
  args: Standard.args,
  render: () => <Table caption="Accounts failed" columns={COLUMNS} rows={[]} getRowId={(r: Account) => r.id} error={{ onRetry: () => undefined }} />,
}

export const RowError: Story = {
  name: 'Error (row-level)',
  args: Standard.args,
  render: () => (
    <Table
      caption="Accounts with a failed row"
      columns={COLUMNS}
      rows={ACCOUNTS.slice(0, 5)}
      getRowId={(r) => r.id}
      rowErrors={{ 'acct-2': 'We couldn’t sync Globex Industries. Retry, or check the CRM connection.' }}
      onRowRetry={() => undefined}
    />
  ),
}

export const Dense: Story = {
  args: Standard.args,
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Table caption="Accounts dense" density="dense" columns={COLUMNS} rows={ACCOUNTS.slice(0, 8)} getRowId={(r) => r.id} />
      <Table caption="Accounts dense with selection" density="dense" selectionMode="multiple" columns={COLUMNS.slice(0, 4)} rows={ACCOUNTS.slice(0, 4)} getRowId={(r) => r.id} defaultSelectedIds={['acct-2']} />
    </div>
  ),
}

export const ExpandableRows: Story = {
  args: Standard.args,
  render: () => (
    <Table
      caption="Accounts with details"
      columns={COLUMNS}
      rows={ACCOUNTS.slice(0, 5)}
      getRowId={(r) => r.id}
      defaultExpandedIds={['acct-1']}
      renderExpanded={(r) => (
        <div style={{ display: 'grid', gap: 4 }}>
          <strong>{r.name} notes</strong>
          <span>{r.notes}</span>
        </div>
      )}
    />
  ),
}

export const InlineEditing: Story = {
  args: Standard.args,
  render: () => {
    const [rows, setRows] = useState(ACCOUNTS.slice(0, 5))
    const cols: TableColumn<Account>[] = COLUMNS.map((c) => (c.id === 'owner' || c.id === 'name' ? { ...c, editable: true } : c))
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <p style={{ margin: 0 }}>Select the Account or Owner cell and press Enter to edit. Enter saves, Escape cancels.</p>
        <Table caption="Editable accounts" columns={cols} rows={rows} getRowId={(r) => r.id} onCellEdit={(id, col, v) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [col]: v } : r)))} />
      </div>
    )
  },
}

export const ColumnConfiguration: Story = {
  args: Standard.args,
  render: () => {
    const cfg = useTableColumns(COLUMNS, { hidden: ['domain'] })
    const [density, setDensity] = useState<'default' | 'dense'>('default')
    return (
      <Table
        caption="Configurable accounts"
        density={density}
        columns={COLUMNS}
        columnOrder={cfg.columnOrder}
        hiddenColumnIds={cfg.hiddenColumnIds}
        rows={ACCOUNTS.slice(0, 6)}
        getRowId={(r) => r.id}
        toolbar={
          <DataTableToolbar
            searchPlaceholder="Search accounts"
            activeFilterCount={2}
            onFilterClick={() => undefined}
            onClearFilters={() => undefined}
            columns={cfg.configItems.map((c) => ({ ...c, locked: c.id === 'name' }))}
            onToggleColumn={cfg.toggleColumn}
            onMoveColumn={cfg.moveColumn}
            onResetColumns={cfg.reset}
            defaultColumnsOpen
            density={density}
            onDensityChange={setDensity}
            onExport={() => undefined}
          />
        }
        style={{ minBlockSize: 420 }}
      />
    )
  },
}

const WIDE: TableColumn<Account>[] = [
  ...COLUMNS,
  { id: 'notes', header: 'Latest note', secondary: true, truncate: 2, sizing: 'fixed', width: 320 },
  { id: 'extra', header: 'Region', cell: () => 'North America', sizing: 'fixed', width: 200 },
]

export const StickyHeaderAndFirstColumn: Story = {
  name: 'Sticky header and first column (scroll frame)',
  args: Standard.args,
  render: () => {
    const [sort, setSort] = useState<TableSort | null>(null)
    return (
      <div style={{ maxInlineSize: 760 }}>
        <Table
          caption="Accounts wide"
          columns={WIDE}
          rows={sortRows(ACCOUNTS, sort)}
          sort={sort}
          onSortChange={setSort}
          getRowId={(r) => r.id}
          selectionMode="multiple"
          stickyHeader
          stickyFirstColumn
          maxHeight={320}
          footer={<PagePlaceholder />}
        />
      </div>
    )
  },
}

export const Truncation: Story = {
  name: 'Cell truncation and secondary text',
  args: Standard.args,
  render: () => (
    <div style={{ maxInlineSize: 640 }}>
      <Table
        caption="Truncated notes"
        columns={[COLUMNS[0], { id: 'notes', header: 'Latest note', truncate: 2, secondary: true, sizing: 'minmax', minWidth: 200, maxWidth: 280 }, { id: 'domain', header: 'Domain', truncate: true, sizing: 'fixed', width: 140 }]}
        rows={ACCOUNTS.slice(0, 4)}
        getRowId={(r) => r.id}
      />
    </div>
  ),
}

export const WithFooterSlot: Story = {
  name: 'With footer slot (pagination)',
  args: Standard.args,
  render: () => <Table caption="Accounts with pagination" columns={COLUMNS} rows={ACCOUNTS.slice(0, 5)} getRowId={(r) => r.id} footer={<PagePlaceholder />} />,
}

export const ForcedStates: Story = {
  name: 'Row states (forced)',
  args: Standard.args,
  render: () => (
    <Table
      caption="Row states"
      columns={COLUMNS.slice(0, 4)}
      rows={ACCOUNTS.slice(0, 4)}
      getRowId={(r) => r.id}
      selectionMode="multiple"
      defaultSelectedIds={['acct-3']}
      rowDataState={{ 'acct-2': 'hover' }}
      rowErrors={{ 'acct-4': 'We couldn’t refresh this account. Try again.' }}
      sort={{ columnId: 'owner', direction: 'ascending' }}
    />
  ),
}
