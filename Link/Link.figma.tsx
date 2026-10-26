// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Link } from './Link'

figma.connect(Link, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Inline: 'inline', Standalone: 'standalone', Destructive: 'destructive' }),
    disabled: figma.enum('State', { Disabled: true }),
    external: figma.boolean('External'),
    label: figma.string('Label'),
    icon: figma.instance('Leading icon'),
  },
  example: ({ variant, disabled, external, label, icon }) => (
    <Link href="/destination" variant={variant} disabled={disabled} external={external} icon={icon}>{label}</Link>
  ),
})
