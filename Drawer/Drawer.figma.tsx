// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Drawer } from './Drawer'

figma.connect(Drawer, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }),
    side: figma.enum('Edge', { Start: 'start', End: 'end' }),
    loading: figma.enum('State', { Loading: true }),
    title: figma.string('Title'),
    icon: figma.instance('Lead icon'),
    children: figma.instance('Body'),
  },
  example: ({ size, side, loading, title, icon, children }) => (
    <Drawer open size={size} side={side} loading={loading} title={title} icon={icon}>{children}</Drawer>
  ),
})
