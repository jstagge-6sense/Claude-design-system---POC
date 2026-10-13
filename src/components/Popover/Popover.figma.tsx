// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Popover } from './Popover'

figma.connect(Popover, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    mode: figma.enum('Mode', { Simple: 'simple', Rich: 'rich' }),
    side: figma.enum('Position', { Top: 'top', Bottom: 'bottom', Start: 'start', End: 'end' }),
    arrow: figma.boolean('Arrow'),
    closeButton: figma.boolean('Close button'),
    title: figma.string('Title'),
    content: figma.string('Content'),
  },
  example: ({ mode, side, arrow, closeButton, title, content }) => (
    <Popover mode={mode} side={side} arrow={arrow} closeButton={closeButton} title={title} content={content}>
      <button>Trigger</button>
    </Popover>
  ),
})
