import { useEffect, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createSixDsTheme, type SixDsDensity, type SixDsMode } from './createSixDsTheme'

export interface SixDsProviderProps {
  mode?: SixDsMode
  density?: SixDsDensity
  /** Render MUI's CssBaseline (body background and text color from the tokens). Default true. */
  baseline?: boolean
  children?: ReactNode
}

/**
 * One provider for apps that mix Material UI and 6DS.
 * Sets data-theme and data-density on <html> (what the 6DS CSS keys off) and provides the matching MUI theme.
 * Server rendering: the attributes are applied after hydration. To avoid a flash, also render them on <html> on the server
 * (see docs/ADOPTION.md, Next.js).
 */
export function SixDsProvider({ mode = 'light', density = 'default', baseline = true, children }: SixDsProviderProps) {
  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = mode
    el.dataset.density = density
  }, [mode, density])
  const theme = createSixDsTheme({ mode, density })
  return (
    <ThemeProvider theme={theme}>
      {baseline ? <CssBaseline /> : null}
      {children}
    </ThemeProvider>
  )
}
