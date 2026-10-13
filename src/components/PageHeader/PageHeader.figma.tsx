// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { PageHeader } from './PageHeader'

figma.connect(PageHeader, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    title: figma.string('Title'),
    description: figma.boolean('Description', { true: figma.string('Description text'), false: undefined }),
    loading: figma.enum('State', { Loading: true }),
    tabs: figma.boolean('With tabs', { true: figma.instance('Tabs'), false: undefined }),
  },
  example: ({ title, description, loading, tabs }) => <PageHeader title={title} description={description} loading={loading} tabs={tabs} />,
})
