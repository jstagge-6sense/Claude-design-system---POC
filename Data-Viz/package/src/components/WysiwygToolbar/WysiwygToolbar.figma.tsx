// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { WysiwygToolbar } from './WysiwygToolbar'

figma.connect(WysiwygToolbar, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Full: 'full', Minimal: 'minimal', Floating: 'floating' }),
    disabled: figma.enum('State', { Disabled: true }),
    overflow: figma.enum('Collapsed', { True: 'always', False: 'auto' }),
  },
  example: ({ variant, disabled, overflow }) => <WysiwygToolbar controls="editor-id" variant={variant} disabled={disabled} overflow={overflow} />,
})
