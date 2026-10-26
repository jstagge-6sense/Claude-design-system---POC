import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DataTableToolbar, type ToolbarColumn } from './DataTableToolbar'
import { Button } from '../Button'
import { Icon } from '../../icons'

const meta = {
  title: 'Patterns/DataTableToolbar',
  component: DataTableToolbar,
  parameters: { tier: 0, group: 'Patterns', description: 'Centralized table controls above the data: search, filters, column configuration, density, export and the bulk action bar.' },
  decorators: [(Story) => <div style={{ minBlockSize: 340 }}><Story /></div>],
} satisfies Meta<typeof DataTableToolbar>
export default meta
type Story = StoryObj<typeof meta>

const COLUMNS: ToolbarColumn[] = [
  { id: 'name', label: 'Account', visible: true, locked: true },
  { id: 'owner', label: 'Owner', visible: true },
  { id: 'stage', label: 'Stage', visible: true },
  { id: 'arr', label: 'ARR', visible: false },
]

export const Default: Story = {
  render: () => {
    const [d, setD] = useState<'default' | 'dense'>('default')
    return <DataTableToolbar searchPlaceholder="Search accounts" onFilterClick={() => undefined} columns={COLUMNS} density={d} onDensityChange={setD} onExport={() => undefined} />
  },
}

export const Filtered: Story = {
  render: () => {
    const [n, setN] = useState(3)
    return (
      <DataTableToolbar
        defaultSearchValue="Acme"
        activeFilterCount={n}
        onFilterClick={() => setN((x) => x + 1)}
        onClearFilters={() => setN(0)}
        onExport={() => undefined}
      />
    )
  },
}

export const BulkSelection: Story = {
  name: 'Bulk selection active',
  render: () => {
    const [count, setCount] = useState(3)
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <DataTableToolbar
          selectedCount={count}
          onClearSelection={() => setCount(0)}
          onExport={() => undefined}
          bulkActions={<><Button size="small" priority="secondary" icon={<Icon name="users" />}>Assign owner</Button><Button size="small" priority="destructive" icon={<Icon name="trash" />}>Remove</Button></>}
        />
        <Button size="small" priority="tertiary" onClick={() => setCount(3)}>Select three rows</Button>
      </div>
    )
  },
}

export const NothingSelected: Story = {
  name: 'Nothing selected (no bulk bar)',
  render: () => <DataTableToolbar selectedCount={0} bulkActions={<Button size="small">Assign owner</Button>} onExport={() => undefined} />,
}

export const ColumnPanel: Story = {
  name: 'Column configuration (open)',
  render: () => {
    const [cols, setCols] = useState(COLUMNS)
    return (
      <DataTableToolbar
        columns={cols}
        defaultColumnsOpen
        search={false}
        onToggleColumn={(id, v) => setCols((cs) => cs.map((c) => (c.id === id ? { ...c, visible: v } : c)))}
        onMoveColumn={(id, dir) => setCols((cs) => {
          const i = cs.findIndex((c) => c.id === id)
          const j = dir === 'up' ? i - 1 : i + 1
          if (j < 0 || j >= cs.length) return cs
          const n = [...cs]; [n[i], n[j]] = [n[j], n[i]]; return n
        })}
        onResetColumns={() => setCols(COLUMNS)}
      />
    )
  },
}

export const ExportLoading: Story = {
  render: () => <DataTableToolbar searchPlaceholder="Search accounts" exportLoading onExport={() => undefined} />,
}
