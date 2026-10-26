// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Tab } from './Tabs'

figma.connect(Tab, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    icon: figma.instance('Icon'),
    badge: figma.boolean('Badge', { true: figma.string('Badge text'), false: undefined }),
    disabled: figma.enum('State', { Disabled: true }),
  },
  example: ({ label, icon, badge, disabled }) => (
    <Tab value="tab-value" icon={icon} badge={badge} disabled={disabled}>{label}</Tab>
  ),
})
