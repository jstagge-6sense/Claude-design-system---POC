// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { TopBar } from './TopBar'

figma.connect(TopBar, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    scrolled: figma.boolean('Scrolled'),
    logo: figma.instance('Logo'),
    notifications: figma.boolean('Notification center', { true: { count: 3 }, false: undefined }),
  },
  example: ({ scrolled, logo, notifications }) => (
    <TopBar logo={logo} scrolled={scrolled} notifications={notifications} user={{ name: 'Priya Raman' }} />
  ),
})
