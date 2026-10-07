import { alpha, createTheme, type Theme, type ThemeOptions } from '@mui/material/styles'
import { SIXDS_THEME as T } from './theme.generated'

export type SixDsMode = 'light' | 'dark'
export type SixDsDensity = 'compact' | 'default' | 'spacious'

export interface SixDsThemeOptions {
  mode?: SixDsMode
  density?: SixDsDensity
  /** Extra MUI options, merged last so apps can override anything. */
  overrides?: ThemeOptions
}

/**
 * Material UI theme generated from the 6DS tokens, so MUI screens and 6DS components look alike.
 * Colors are static values resolved at build time (MUI's alpha/darken helpers cannot read CSS variables).
 * Dark mode and density match the 6DS CSS modes: pass the same mode and density you set on <html>.
 */
export function createSixDsTheme({ mode = 'light', density = 'default', overrides }: SixDsThemeOptions = {}): Theme {
  const c = T[mode]
  const d = T.density[density]
  const unit = T.spacingUnit * d.space
  const heightMd = Math.round(T.control.medium * d.control)
  const heightSm = Math.round(T.control.small * d.control)
  const style = (key: keyof typeof T.typography) => {
    const t = T.typography[key] as { fontSize?: string; fontWeight?: number; lineHeight?: number | string }
    return { fontSize: t.fontSize, fontWeight: t.fontWeight, lineHeight: t.lineHeight }
  }
  const divider = alpha(c.border, T.opacityDivider)

  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, dark: c.primaryDark, contrastText: c.inverse },
      secondary: { main: c.secondary, contrastText: c.textPrimary },
      error: { main: c.error, dark: c.errorDark, contrastText: c.inverse },
      success: { main: c.success },
      warning: { main: c.warning },
      info: { main: c.info },
      text: { primary: c.textPrimary, secondary: c.textSecondary, disabled: c.textDisabled },
      background: { default: c.page, paper: c.card },
      divider,
    },
    spacing: unit,
    shape: { borderRadius: T.radius.control },
    typography: {
      fontFamily: T.fontFamily,
      h1: style('heading.1'), h2: style('heading.2'), h3: style('heading.3'), h4: style('heading.4'),
      body1: style('paragraph.1'), body2: style('paragraph.2'), caption: style('help.1'),
      button: { ...style('button.1'), textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { backgroundColor: c.page, color: c.textPrimary } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: heightMd, borderRadius: T.radius.control },
          sizeSmall: { minHeight: heightSm },
          sizeLarge: { minHeight: Math.round(heightMd * 1.2) },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { minHeight: heightMd, borderRadius: T.radius.control, '& fieldset': { borderColor: alpha(c.border, 0.4) } },
          sizeSmall: { minHeight: heightSm },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: T.radius.surface } } },
      MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderColor: divider, borderRadius: T.radius.surface } } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', minHeight: heightMd } } },
      MuiTableCell: { styleOverrides: { root: { borderBottomColor: divider } } },
    },
    ...overrides,
  })
}
