import { useCallback, useEffect, useState } from 'react'

export const NAV_COLLAPSED_KEY = 'ds.nav.collapsed'

function read(key: string, fallback: boolean): boolean {
  try {
    const raw = typeof window === 'undefined' ? null : window.localStorage.getItem(key)
    return raw === null ? fallback : raw === 'true'
  } catch {
    return fallback
  }
}

/**
 * Collapsed or expanded state of the sidebar, persisted across navigation and sessions.
 * Storage can be blocked (private windows, site settings), so every access is in try/catch and the
 * hook keeps working in memory when it fails.
 */
export function useNavCollapsed(initial = false, key: string = NAV_COLLAPSED_KEY) {
  const [collapsed, setState] = useState<boolean>(() => read(key, initial))
  // Pick up a change made in another tab.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const on = (e: StorageEvent) => { if (e.key === key) setState(read(key, initial)) }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const setCollapsed = useCallback((next: boolean) => {
    setState(next)
    try { window.localStorage.setItem(key, String(next)) } catch { /* storage unavailable: keep the in-memory value */ }
  }, [key])
  return [collapsed, setCollapsed] as const
}
