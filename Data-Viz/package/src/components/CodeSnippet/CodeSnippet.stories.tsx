import type { Meta, StoryObj } from '@storybook/react'
import { CodeSnippet } from './CodeSnippet'

const meta = {
  title: 'Container/Code snippet',
  component: CodeSnippet,
  parameters: { tier: 3, group: 'Container', description: 'Displays plain code that users can read and copy. The copy button is always present.' },
  args: {
    language: 'JavaScript',
    code: `import { Segment } from '@example/sdk'

const segment = await Segment.create({
  name: 'Mid-market expansion',
  filters: { employees: { min: 200, max: 1000 }, region: ['EMEA', 'NA'] },
})

console.log(segment.id)`,
  },
  decorators: [(Story) => <div style={{ maxInlineSize: '40rem' }}><Story /></div>],
} satisfies Meta<typeof CodeSnippet>
export default meta
type Story = StoryObj<typeof meta>

export const MultiLine: Story = {}
export const WithoutLineNumbers: Story = { args: { lineNumbers: false } }
export const SingleLineBlock: Story = {
  name: 'Single line block',
  args: { language: 'Shell', code: 'curl -H "Authorization: Bearer $API_KEY" https://api.example.com/v1/segments' },
}
export const Inline: Story = {
  args: { variant: 'inline', code: 'npm install @example/sdk' },
}
export const InlineInText: Story = {
  name: 'Inline in text',
  render: () => (
    <p style={{ maxInlineSize: '36rem' }}>
      Install the package with <CodeSnippet variant="inline" code="npm install @example/sdk" /> and then add your key to the config file.
    </p>
  ),
}
export const HorizontalScroll: Story = {
  name: 'Long lines scroll',
  args: {
    language: 'JSON',
    code: `{
  "webhook": "https://hooks.example.com/services/T0000000/B0000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "events": ["segment.created", "segment.updated", "segment.deleted", "account.enriched", "account.scored"]
}`,
  },
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <CodeSnippet {...args} code="export API_KEY=sk_test_sample" language="Shell" />
      <CodeSnippet {...args} code="export API_KEY=sk_test_sample" language="Shell (hover)" data-state="hover" />
      <CodeSnippet {...args} code="export API_KEY=sk_test_sample" language="Shell (pressed)" data-state="pressed" />
      <CodeSnippet {...args} code="export API_KEY=sk_test_sample" language="Shell (focus)" data-state="focus" />
      <CodeSnippet {...args} code="export API_KEY=sk_test_sample" language="Shell (copied)" data-state="copied" />
      <CodeSnippet {...args} variant="inline" code="npm install @example/sdk" data-state="copied" />
    </div>
  ),
}
