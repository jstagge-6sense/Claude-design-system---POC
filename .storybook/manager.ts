import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

// Storybook chrome in the 6sense palette (dark surfaces from tokens/modes/dark.json; text and accent from sage and teal primitives).
const theme = create({
  base: 'dark',
  brandTitle: '6sense design system',
  fontBase: '"Atkinson Hyperlegible Next", system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  colorPrimary: '#59CCD9', // teal-300
  colorSecondary: '#59CCD9',
  appBg: '#042A2E', // dark surface.page
  appContentBg: '#0A3A3F', // dark surface.card
  appPreviewBg: '#042A2E',
  appBorderColor: '#1A5258', // dark surface.chip
  appBorderRadius: 8,
  textColor: '#F8FAF9', // sage-100
  textInverseColor: '#063236',
  textMutedColor: '#DAE7E3', // sage-400
  barBg: '#0A3A3F',
  barTextColor: '#DAE7E3',
  barSelectedColor: '#59CCD9',
  barHoverColor: '#59CCD9',
  inputBg: '#032226',
  inputBorder: '#1A5258',
  inputTextColor: '#F8FAF9',
  inputBorderRadius: 8,
})

addons.setConfig({ theme })
