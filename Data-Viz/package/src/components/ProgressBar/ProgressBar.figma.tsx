// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { ProgressBar } from './ProgressBar'

figma.connect(ProgressBar, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    state: figma.enum('State', { Default: 'default', Complete: 'complete', Error: 'error' }),
    showValue: figma.boolean('Show percentage'),
    label: figma.string('Label'),
    statusText: figma.string('Status text'),
  },
  example: ({ state, showValue, label, statusText }) => (
    <ProgressBar label={label} value={50} state={state} showValue={showValue} statusText={statusText} />
  ),
})
