// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { SidePanel } from './SidePanel'

figma.connect(SidePanel, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    collapsible: figma.boolean('Collapsible'),
    side: figma.enum('Position', { Left: 'start', Right: 'end' }),
    collapsed: figma.enum('State', { Collapsed: true, Expanded: false }),
    loading: figma.enum('State', { Loading: true }),
    title: figma.string('Title'),
    search: figma.instance('Search'),
    footer: figma.instance('Footer'),
    children: figma.instance('Content'),
  },
  example: ({ collapsible, side, collapsed, loading, title, search, footer, children }) => (
    <SidePanel collapsible={collapsible} side={side} collapsed={collapsed} loading={loading} title={title} search={search} footer={footer}>{children}</SidePanel>
  ),
})
