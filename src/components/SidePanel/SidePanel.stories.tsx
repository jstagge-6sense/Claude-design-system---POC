import { useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SidePanel, SidePanelRailItem } from './SidePanel'
import { Frame, SamplePage } from '../Dialog/storyFrame'
import { Button } from '../Button'
import { Icon } from '../../icons'
import { Search } from '../Search'
import { Checkbox } from '../Checkbox'
import { Input } from '../Input'

const meta = {
  title: 'Container/Side Panel',
  component: SidePanel,
  parameters: { tier: 3, group: 'Container', description: 'Persistent or collapsible secondary surface on an edge for filters, details and settings. Collapses to an icon rail and keeps its state.' },
  args: { title: 'Filters' },
} satisfies Meta<typeof SidePanel>
export default meta
type Story = StoryObj<typeof meta>

const FilterBody = () => (
  <>
    <Checkbox label="Enterprise" defaultChecked />
    <Checkbox label="Mid-market" />
    <Checkbox label="Healthcare" />
    <Input label="Region" defaultValue="EMEA" />
  </>
)
const RAIL = (
  <>
    <SidePanelRailItem label="Filters" icon={<Icon name="filter" />} />
    <SidePanelRailItem label="Columns" icon={<Icon name="columns" />} />
    <SidePanelRailItem label="Settings" icon={<Icon name="settings" />} />
  </>
)
const Row = ({ children, height = 460 }: { children: ReactNode; height?: number }) => (
  <Frame height={height}><div style={{ display: 'flex', blockSize: '100%' }}>{children}</div></Frame>
)

export const Fixed: Story = {
  render: (args) => (
    <Row>
      <SidePanel {...args} search={<Search variant="contextual" label="Search filters" size="small" />} headerActions={<Button priority="tertiary" size="small" iconOnly icon={<Icon name="refresh" />} aria-label="Reset filters" />} footer={<Button priority="secondary" size="small">Clear all</Button>}>
        <FilterBody />
      </SidePanel>
      <div style={{ flex: 1, minInlineSize: 0, overflow: 'hidden' }}><SamplePage action={false} /></div>
    </Row>
  ),
}

export const Collapsible: Story = {
  render: (args) => (
    <Row>
      <SidePanel {...args} collapsible rail={RAIL} search={<Search variant="contextual" label="Search filters" size="small" />}>
        <FilterBody />
      </SidePanel>
      <div style={{ flex: 1, minInlineSize: 0, overflow: 'hidden' }}><SamplePage action={false} /></div>
    </Row>
  ),
}

export const CollapsedRail: Story = {
  name: 'Collapsed rail',
  render: (args) => (
    <Row>
      <SidePanel {...args} collapsible defaultCollapsed rail={RAIL}>
        <FilterBody />
      </SidePanel>
      <div style={{ flex: 1, minInlineSize: 0, overflow: 'hidden' }}><SamplePage action={false} /></div>
    </Row>
  ),
}

export const EndEdge: Story = {
  name: 'End edge',
  render: (args) => (
    <Row>
      <div style={{ flex: 1, minInlineSize: 0, overflow: 'hidden' }}><SamplePage action={false} /></div>
      <SidePanel {...args} side="end" collapsible title="Segment details" rail={RAIL}>
        <p style={{ margin: 0 }}>Mid-market fintech, EMEA</p>
        <p style={{ margin: 0 }}>642 accounts, refreshed today.</p>
      </SidePanel>
    </Row>
  ),
}

export const Loading: Story = {
  render: (args) => (
    <Row>
      <SidePanel {...args} collapsible loading loadingLabel="Loading filters" rail={RAIL}>
        <FilterBody />
      </SidePanel>
      <div style={{ flex: 1, minInlineSize: 0, overflow: 'hidden' }}><SamplePage action={false} /></div>
    </Row>
  ),
}

export const StatePreserved: Story = {
  name: 'State preserved while collapsed',
  render: (args) => {
    const Demo = () => {
      const [collapsed, setCollapsed] = useState(false)
      return (
        <Row>
          <SidePanel {...args} collapsible collapsed={collapsed} onCollapsedChange={setCollapsed} rail={RAIL}>
            <Input label="Region" defaultValue="Type here, collapse, then expand" />
            <Checkbox label="Healthcare" />
          </SidePanel>
          <div style={{ flex: 1, minInlineSize: 0, overflow: 'hidden' }}><SamplePage action={false} /></div>
        </Row>
      )
    }
    return <Demo />
  },
}

const STATES = [undefined, 'hover', 'pressed', 'focus'] as const
export const ToggleStates: Story = {
  name: 'Collapse toggle states (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
      {STATES.map((s) => (
        <Row key={s ?? 'default'} height={240}>
          <SidePanel {...args} collapsible title={`State: ${s ?? 'default'}`} toggleProps={{ 'data-state': s }}>
            <p style={{ margin: 0 }}>Forced state on the toggle.</p>
          </SidePanel>
        </Row>
      ))}
    </div>
  ),
}
