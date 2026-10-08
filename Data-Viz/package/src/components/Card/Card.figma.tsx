// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Card } from './Card'

figma.connect(Card, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Basic: 'basic', Metric: 'metric' }),
    compact: figma.boolean('Compact'),
    selected: figma.enum('State', { Selected: true }),
    loading: figma.enum('State', { Loading: true }),
    title: figma.string('Title'),
    media: figma.boolean('Media', { true: figma.instance('Media'), false: undefined }),
    actions: figma.boolean('Actions', { true: figma.instance('Actions'), false: undefined }),
  },
  example: ({ variant, compact, selected, loading, title, media, actions }) => (
    <Card variant={variant} compact={compact} selected={selected} loading={loading} title={title} media={media} actions={actions} />
  ),
})
