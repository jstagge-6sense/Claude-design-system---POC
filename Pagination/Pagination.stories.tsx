import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'

const meta = {
  title: 'Navigation and structure/Pagination',
  component: Pagination,
  parameters: { tier: 2, group: 'Navigation and structure', description: 'Move through a large collection page by page, with result count and page size.' },
  args: { total: 500, pageSize: 20, defaultPage: 1 },
} satisfies Meta<typeof Pagination>
export default meta
type Story = StoryObj<typeof meta>

const stack = { display: 'grid', gap: 32 } as const

export const FirstPage: Story = {}
export const MiddlePage: Story = { args: { defaultPage: 12 } }
export const LastPage: Story = { args: { defaultPage: 25 } }
export const FewPages: Story = { args: { total: 90, defaultPage: 2 } }
export const TruncatedWithBoundary: Story = {
  name: 'Truncated (1 2 3 ... 98 99 100)',
  args: { total: 2000, pageSize: 20, defaultPage: 50, boundaryCount: 3, siblingCount: 1 },
}
export const WithPageSize: Story = {
  name: 'With page size',
  parameters: { docs: { description: { story: 'Changing the page size returns to page 1.' } } },
  render: (args) => {
    function Demo() {
      const [size, setSize] = useState(20)
      const [page, setPage] = useState(3)
      return <div style={{ minBlockSize: 280 }}><Pagination {...args} pageSize={size} onPageSizeChange={setSize} page={page} onPageChange={setPage} portal={false} /></div>
    }
    return <Demo />
  },
}
export const Mini: Story = { args: { variant: 'mini', defaultPage: 4 } }
export const Loading: Story = { args: { loading: true, defaultPage: 3 } }
export const EmptyResults: Story = { args: { total: 0 } }
export const Interactive: Story = {
  render: (args) => {
    function Demo() {
      const [page, setPage] = useState(1)
      return <Pagination {...args} page={page} onPageChange={setPage} />
    }
    return <Demo />
  },
}
export const Variants: Story = {
  render: (args) => (
    <div style={stack}>
      <Pagination {...args} aria-label="Pagination, default" defaultPage={1} />
      <Pagination {...args} aria-label="Pagination, mini" variant="mini" defaultPage={1} />
    </div>
  ),
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={stack}>
      <Pagination {...args} aria-label="Pagination, hover" defaultPage={5} pageStates={{ 6: 'hover', next: 'hover' }} />
      <Pagination {...args} aria-label="Pagination, pressed" defaultPage={5} pageStates={{ 6: 'pressed', prev: 'pressed' }} />
      <Pagination {...args} aria-label="Pagination, focus" defaultPage={5} pageStates={{ 6: 'focus', prev: 'focus' }} />
      <Pagination {...args} aria-label="Pagination, first page (previous unavailable)" defaultPage={1} />
      <Pagination {...args} aria-label="Pagination, last page (next unavailable)" defaultPage={25} />
      <Pagination {...args} aria-label="Pagination, loading" loading defaultPage={5} />
    </div>
  ),
}
