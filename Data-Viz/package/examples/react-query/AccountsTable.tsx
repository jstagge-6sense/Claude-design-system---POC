// React Query feeding a 6DS Table. The table owns presentation of loading, error and empty states.
// Sorting is controlled: the query key includes the sort, so the server (or the selector) does the sorting.
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Table, EmptyState, type TableColumn, type TableSort } from '@6si/components'

export interface Account { id: string; name: string; owner: string; stage: string }

async function fetchAccounts(sort: TableSort | null): Promise<Account[]> {
  const qs = sort ? `?sort=${sort.columnId}&dir=${sort.direction}` : ''
  const res = await fetch(`/api/accounts${qs}`)
  if (!res.ok) throw new Error(`Accounts request failed (${res.status})`)
  return res.json()
}

const COLUMNS: TableColumn<Account>[] = [
  { id: 'name', header: 'Account', accessor: 'name', sortable: true, rowHeader: true },
  { id: 'owner', header: 'Owner', accessor: 'owner', sortable: true },
  { id: 'stage', header: 'Stage', accessor: 'stage', sortable: true },
]

export function AccountsTable() {
  const [sort, setSort] = useState<TableSort | null>(null)
  const { data = [], isPending, isError, refetch } = useQuery({ queryKey: ['accounts', sort], queryFn: () => fetchAccounts(sort), placeholderData: (prev) => prev })
  return (
    <Table<Account>
      caption="Accounts"
      columns={COLUMNS}
      rows={data}
      getRowId={(r) => r.id}
      sort={sort}
      onSortChange={setSort}
      loading={isPending}
      error={isError ? { title: 'Could not load accounts', description: 'Check your connection and try again.', onRetry: () => { void refetch() } } : false}
      emptyState={<EmptyState title="No accounts yet" description="Accounts appear here after your first sync." />}
    />
  )
}
