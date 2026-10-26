// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { InfiniteScroll } from './InfiniteScroll'

figma.connect(InfiniteScroll, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    status: figma.enum('State', { Idle: 'idle', Loading: 'loading', Loaded: 'loaded', 'End of content': 'end', Error: 'error' }),
    footer: figma.instance('Footer'),
  },
  example: ({ status, footer }) => (
    <InfiniteScroll onLoadMore={() => undefined} status={status} footer={footer}>
      {/* Items */}
    </InfiniteScroll>
  ),
})
