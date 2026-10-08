// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { ProgressSteps } from './ProgressSteps'

figma.connect(ProgressSteps, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    orientation: figma.enum('Orientation', { Horizontal: 'horizontal', Vertical: 'vertical' }),
    mode: figma.enum('Mode', { Linear: 'linear', 'Non-linear': 'nonLinear' }),
    compact: figma.boolean('Compact'),
  },
  example: ({ orientation, mode, compact }) => (
    <ProgressSteps
      orientation={orientation}
      mode={mode}
      compact={compact}
      current={1}
      steps={[{ id: 'one', label: 'Step one' }, { id: 'two', label: 'Step two' }, { id: 'three', label: 'Step three' }]}
    />
  ),
})
