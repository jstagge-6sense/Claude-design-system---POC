// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Nav } from './Nav'

figma.connect(Nav, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    collapsible: figma.boolean('Collapsible'),
    collapsed: figma.enum('State', { Collapsed: true, Expanded: false }),
  },
  example: ({ collapsible, collapsed }) => (
    <Nav
      collapsible={collapsible}
      collapsed={collapsed}
      groups={[{ id: 'main', items: [{ id: 'home', label: 'Dashboard', href: '/' }] }]}
    />
  ),
})
