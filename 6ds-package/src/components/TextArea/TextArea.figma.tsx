// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { TextArea } from './TextArea'

figma.connect(TextArea, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    autoResize: figma.boolean('Auto-resize'),
    disabled: figma.enum('State', { Disabled: true }),
    readOnly: figma.enum('State', { 'Read-only': true }),
    label: figma.string('Label'),
    helperText: figma.string('Helper text'),
    actions: figma.instance('Inline actions'),
    tags: figma.instance('Tags'),
  },
  example: ({ autoResize, disabled, readOnly, label, helperText, actions, tags }) => (
    <TextArea autoResize={autoResize} disabled={disabled} readOnly={readOnly} label={label} helperText={helperText} actions={actions} tags={tags} />
  ),
})
