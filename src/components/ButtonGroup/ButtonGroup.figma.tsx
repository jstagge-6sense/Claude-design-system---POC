// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { ButtonGroup } from './ButtonGroup'

figma.connect(ButtonGroup, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    mode: figma.enum('Mode', { Action: 'action', Selection: 'selection' }),
    selectionMode: figma.enum('Selection', { Single: 'single', Multi: 'multi' }),
    size: figma.enum('Size', { Small: 'small', Medium: 'medium', Large: 'large' }),
    stack: figma.boolean('Stacked'),
  },
  example: ({ mode, selectionMode, size, stack }) => (
    <ButtonGroup aria-label="Group" mode={mode} selectionMode={selectionMode} size={size} stack={stack} items={[{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }]} />
  ),
})
