// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Breadcrumb } from './Breadcrumb'

figma.connect(Breadcrumb, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    truncate: figma.enum('Type', { Truncated: true }),
    homeIcon: figma.enum('Type', { 'With icon': true }),
    responsive: figma.enum('Type', { Responsive: true }),
  },
  example: ({ truncate, homeIcon, responsive }) => (
    <Breadcrumb
      truncate={truncate}
      homeIcon={homeIcon}
      responsive={responsive}
      items={[{ label: 'Home', href: '/' }, { label: 'Section', href: '/section' }, { label: 'Current page' }]}
    />
  ),
})
