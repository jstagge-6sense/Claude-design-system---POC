import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

// Storybook chrome in the 6sense palette (values from dist/primitive.css: sage, ink, teal).
const theme = create({
  base: 'light',
  brandTitle: '6sense design system',
  fontBase: '"Atkinson Hyperlegible Next", system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  colorPrimary: '#2A696F', // teal-700
  colorSecondary: '#2A696F',
  appBg: '#F3F7F6', // sage-200
  appContentBg: '#F8FAF9', // sage-100
  appPreviewBg: '#F8FAF9',
  appBorderColor: '#DAE7E3', // sage-400
  appBorderRadius: 8,
  textColor: '#063236', // ink-900
  textInverseColor: '#F8FAF9',
  textMutedColor: '#34585B', // ink-800
  barBg: '#F8FAF9',
  barTextColor: '#34585B',
  barSelectedColor: '#2A696F',
  barHoverColor: '#2A696F',
  inputBg: '#FFFFFF',
  inputBorder: '#DAE7E3',
  inputTextColor: '#063236',
  inputBorderRadius: 8,
})

addons.setConfig({ theme })
