// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Toast } from './Toast'

figma.connect(Toast, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    severity: figma.enum('Severity', { Info: 'info', Success: 'success', Warning: 'warning', Error: 'error' }),
    title: figma.string('Title'),
    description: figma.string('Description'),
    closable: figma.boolean('Close button'),
  },
  example: ({ severity, title, description, closable }) => (
    <Toast severity={severity} title={title} description={description} closable={closable} />
  ),
})
