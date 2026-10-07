import { useCallback, useMemo, useState } from 'react'
import type { TableColumn } from './Table'

export interface ColumnConfigItem {
  id: string
  label: string
  visible: boolean
}

/**
 * Caller-side state for column show/hide and reorder. Table only renders `columnOrder` and `hiddenColumnIds`.
 * Persist the result yourself (column configuration persists across navigation and sessions).
 */
export function useTableColumns<T>(columns: TableColumn<T>[], initial: { order?: string[]; hidden?: string[] } = {}) {
  const [columnOrder, setOrder] = useState<string[]>(initial.order ?? columns.map((c) => c.id))
  const [hiddenColumnIds, setHidden] = useState<string[]>(initial.hidden ?? [])

  const toggleColumn = useCallback((id: string, visible?: boolean) => {
    setHidden((h) => {
      const hide = visible === undefined ? !h.includes(id) : !visible
      return hide ? (h.includes(id) ? h : [...h, id]) : h.filter((x) => x !== id)
    })
  }, [])

  const moveColumn = useCallback((id: string, direction: 'up' | 'down') => {
    setOrder((o) => {
      const i = o.indexOf(id)
      const j = direction === 'up' ? i - 1 : i + 1
      if (i < 0 || j < 0 || j >= o.length) return o
      const next = [...o]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }, [])

  const reset = useCallback(() => { setOrder(columns.map((c) => c.id)); setHidden(initial.hidden ?? []) }, [columns, initial.hidden])

  const configItems: ColumnConfigItem[] = useMemo(
    () => columnOrder.flatMap((id) => {
      const c = columns.find((x) => x.id === id)
      return c ? [{ id, label: c.header, visible: !hiddenColumnIds.includes(id) }] : []
    }),
    [columns, columnOrder, hiddenColumnIds],
  )

  return { columnOrder, hiddenColumnIds, toggleColumn, moveColumn, reset, configItems }
}
