// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Search } from './Search'

figma.connect(Search, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Scope', { Global: 'global', Contextual: 'contextual' }),
    size: figma.enum('Size', { Small: 'small', Medium: 'medium' }),
    disabled: figma.enum('State', { Disabled: true }),
    loading: figma.enum('State', { Typing: true }),
    placeholder: figma.string('Placeholder'),
    scope: figma.instance('Scope filter'),
  },
  example: ({ variant, size, disabled, loading, placeholder, scope }) => (
    <Search label="Search" variant={variant} size={size} disabled={disabled} loading={loading} placeholder={placeholder} scope={scope} />
  ),
})
