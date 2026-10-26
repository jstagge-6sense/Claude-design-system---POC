// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Pagination } from './Pagination'

figma.connect(Pagination, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', { Default: 'default', Mini: 'mini' }),
    showResultCount: figma.boolean('Result count'),
    loading: figma.enum('State', { Loading: true }),
  },
  example: ({ variant, showResultCount, loading }) => (
    <Pagination total={500} pageSize={20} variant={variant} showResultCount={showResultCount} loading={loading} />
  ),
})
