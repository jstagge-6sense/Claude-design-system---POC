import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
/** Render children into document.body (or `container`). Renders nothing on the server. */
export function Portal({ children, container }: { children: ReactNode; container?: Element | null }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || typeof document === 'undefined') return null
  return createPortal(children, container ?? document.body)
}
