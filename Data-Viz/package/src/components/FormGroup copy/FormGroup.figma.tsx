// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { FormGroup } from './FormGroup'
import type { FormGroupApi } from './useFormGroup'

declare const form: FormGroupApi

figma.connect(FormGroup, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { 'Single section': 'single', 'Multi-section': 'multiSection', Inline: 'inline', Wizard: 'wizard' }),
    footerAlign: figma.enum('Footer', { Start: 'start', End: 'end' }),
  },
  example: ({ variant, footerAlign }) => <FormGroup form={form} aria-label="Form name" variant={variant} footerAlign={footerAlign} />,
})
