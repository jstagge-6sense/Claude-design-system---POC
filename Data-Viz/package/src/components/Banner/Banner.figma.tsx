// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Banner } from './Banner'

figma.connect(Banner, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    severity: figma.enum('Severity', { Info: 'info', Success: 'success', Warning: 'warning', Error: 'error' }),
    placement: figma.enum('Placement', { Global: 'global', Page: 'page', Section: 'section', Inline: 'inline' }),
    dismissible: figma.boolean('Dismissible'),
    title: figma.string('Title'),
    body: figma.string('Body'),
    actionLabel: figma.string('Action label'),
  },
  example: ({ severity, placement, dismissible, title, body, actionLabel }) => (
    <Banner severity={severity} placement={placement} dismissible={dismissible} title={title} actionLabel={actionLabel}>{body}</Banner>
  ),
})
