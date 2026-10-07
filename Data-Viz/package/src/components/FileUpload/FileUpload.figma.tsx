// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { FileUpload } from './FileUpload'

figma.connect(FileUpload, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Dropzone: 'dropzone', Button: 'button' }),
    multiple: figma.boolean('Multiple'),
    disabled: figma.enum('State', { Disabled: true }),
    helperText: figma.string('Helper text'),
  },
  example: ({ variant, multiple, disabled, helperText }) => (
    <FileUpload variant={variant} multiple={multiple} disabled={disabled} helperText={helperText} accept={['.csv']} />
  ),
})
