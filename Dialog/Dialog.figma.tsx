// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Dialog } from './Dialog'

figma.connect(Dialog, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    complexity: figma.enum('Complexity', { Confirmation: 'confirmation', Form: 'form', Information: 'information' }),
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }),
    destructive: figma.boolean('Destructive'),
    confirming: figma.enum('State', { Confirming: true }),
    title: figma.string('Title'),
    description: figma.string('Description'),
    confirmLabel: figma.string('Confirm label'),
    children: figma.instance('Body'),
  },
  example: ({ complexity, size, destructive, confirming, title, description, confirmLabel, children }) => (
    <Dialog open complexity={complexity} size={size} destructive={destructive} confirming={confirming} title={title} description={description} confirmLabel={confirmLabel}>
      {children}
    </Dialog>
  ),
})
