// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { ProgressCircle } from './ProgressCircle'

figma.connect(ProgressCircle, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }),
    state: figma.enum('State', { Default: 'default', Complete: 'complete', Error: 'error' }),
    label: figma.string('Label'),
  },
  example: ({ size, state, label }) => <ProgressCircle label={label} value={50} size={size} state={state} />,
})
