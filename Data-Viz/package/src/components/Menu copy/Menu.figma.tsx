// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Menu, MenuTrigger } from './Menu'

figma.connect(Menu, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    mode: figma.enum('Mode', { Action: 'action', 'Single select': 'single', 'Multi select': 'multi' }),
    searchable: figma.boolean('Searchable'),
    loading: figma.enum('State', { Loading: true }),
  },
  example: ({ mode, searchable, loading }) => (
    <Menu label="Menu" mode={mode} searchable={searchable} loading={loading} items={[]} trigger={<MenuTrigger>Actions</MenuTrigger>} />
  ),
})
