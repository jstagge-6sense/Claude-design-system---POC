// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { CodeSnippet } from './CodeSnippet'

figma.connect(CodeSnippet, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Block: 'block', Inline: 'inline' }),
    language: figma.string('Language'),
    lineNumbers: figma.boolean('Line numbers'),
    code: figma.string('Code'),
  },
  example: ({ variant, language, lineNumbers, code }) => (
    <CodeSnippet variant={variant} language={language} lineNumbers={lineNumbers} code={code} />
  ),
})
