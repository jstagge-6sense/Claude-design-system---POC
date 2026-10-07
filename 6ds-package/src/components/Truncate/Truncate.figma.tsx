// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Truncate } from './Truncate'

figma.connect(Truncate, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    middle: figma.boolean('Middle'),
    expandable: figma.boolean('Expandable'),
    text: figma.string('Text'),
  },
  example: ({ middle, expandable, text }) => <Truncate middle={middle} expandable={expandable}>{text}</Truncate>,
})
