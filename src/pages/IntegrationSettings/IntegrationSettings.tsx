import { useEffect, useId, useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { ButtonGroup } from '../../components/ButtonGroup'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Nav, type NavGroup } from '../../components/Nav'
import { NumberInput } from '../../components/NumberInput'
import { PageHeader } from '../../components/PageHeader'
import { Select } from '../../components/Select'
import { Table, type TableColumn, type TableSort } from '../../components/Table'
import { Tabs, TabList, Tab, TabPanel } from '../../components/Tabs'
import { TopBar } from '../../components/TopBar'
import { Icon } from '../../icons'
import styles from './IntegrationSettings.module.css'

/** Source: Figma "Integration Library, Output (April 2026)", node 23:82656 (CRM: Microsoft Dynamics, API settings tab). */

interface ApiRow { id: string; type: string; limit: number | null; calls: string; lastSync: string; published: string }

const NAV: NavGroup[] = [{
  id: 'main',
  items: [
    { id: 'home', label: 'Home', icon: <Icon name="home" />, href: '#home' },
    { id: 'segments', label: 'Segments', icon: <Icon name="grid" />, href: '#segments' },
    { id: 'campaigns', label: 'Campaigns', icon: <Icon name="sparkle" />, href: '#campaigns' },
    { id: 'audiences', label: 'Audiences', icon: <Icon name="users" />, href: '#audiences' },
    { id: 'lists', label: 'Lists', icon: <Icon name="list" />, href: '#lists' },
    { id: 'reports', label: 'Reports', icon: <Icon name="trendUp" />, href: '#reports' },
    { id: 'files', label: 'Files', icon: <Icon name="file" />, href: '#files' },
    { id: 'settings', label: 'Settings', icon: <Icon name="settings" />, href: '#settings' },
  ],
}]

const SUMMARY: Array<{ id: string; label: string; level?: 1; done?: boolean; current?: boolean }> = [
  { id: 'connection', label: 'Connection', done: true },
  { id: 'apis', label: 'APIs', current: true },
  { id: 'daily', label: 'Daily data syncs', level: 1 },
  { id: 'realtime', label: 'Real-time data sync', level: 1 },
  { id: 'standardization', label: 'Data standardization' },
  { id: 'mapping', label: 'Mapping profile' },
  { id: 'custom', label: 'Custom values' },
  { id: 'export', label: 'Export permissions' },
]

const RANGE = [{ value: 'last', label: 'Last sync' }, { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }]

export interface IntegrationSettingsProps {
  /** Start with the Connection card open. */
  connectionOpen?: boolean
  /** Daily API limit shown in the table. */
  dailyLimit?: number
}

export function IntegrationSettings({ connectionOpen = false, dailyLimit = 3000 }: IntegrationSettingsProps) {
  const uid = useId()
  const [tab, setTab] = useState('api')
  const [appId, setAppId] = useState('123abc456def678ghi9')
  const [limit, setLimit] = useState<number | null>(dailyLimit)
  const [sort, setSort] = useState<TableSort | null>(null)
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'))
  const [density, setDensity] = useState<'compact' | 'default' | 'spacious'>(() => {
    const d = typeof document !== 'undefined' ? document.documentElement.dataset.density : undefined
    return d === 'compact' || d === 'spacious' ? d : 'default'
  })
  // Theme and density are attributes on <html>; modes.css (dark theme, compact and spacious) keys off them.
  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = theme
    el.dataset.density = density
  }, [theme, density])

  const rows: ApiRow[] = useMemo(() => [{ id: 'rest', type: 'REST', limit, calls: '--', lastSync: '--', published: '--' }], [limit])
  const columns: TableColumn<ApiRow>[] = useMemo(() => [
    { id: 'type', header: 'API type', accessor: 'type', sortable: true, rowHeader: true, sizing: 'fixed', width: 112 },
    {
      id: 'limit', header: 'Daily limit', sortable: true, sizing: 'fixed', width: 152,
      cell: (r) => <NumberInput label="Daily limit" hideLabel size="small" value={r.limit} min={0} onValueChange={(v) => { setLimit(v); setSaved(false) }} steppers={false} />,
    },
    { id: 'calls', header: 'Calls', accessor: 'calls', sortable: true, align: 'end', secondary: true, minWidth: 80 },
    { id: 'lastSync', header: 'Last sync', accessor: 'lastSync', sortable: true, secondary: true, minWidth: 104 },
    { id: 'published', header: 'Published', accessor: 'published', sortable: true, secondary: true, sizing: 'fixed', width: 112 },
  ], [])

  return (
    <div className={styles.shell}>
      <div className={styles.rail}>
        <Nav groups={NAV} currentId="settings" collapsible defaultCollapsed responsive={false} aria-label="Product" />
      </div>
      <div className={styles.main}>
        <TopBar
          logo={<a href="#home" aria-label="Home">6sense</a>}
          actions={
            <div className={styles.modes}>
              <ButtonGroup mode="selection" selectionMode="single" size="small" aria-label="Theme" value={[theme]}
                onValueChange={(v) => v[0] && setTheme(v[0] as 'light' | 'dark')}
                items={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
              <ButtonGroup mode="selection" selectionMode="single" size="small" aria-label="Size" value={[density]}
                onValueChange={(v) => v[0] && setDensity(v[0] as 'compact' | 'default' | 'spacious')}
                items={[{ value: 'compact', label: 'Compact' }, { value: 'default', label: 'Default' }, { value: 'spacious', label: 'Spacious' }]} />
            </div>
          }
          notifications={{ count: 0 }}
          user={{ name: 'Alex Morgan' }}
          skipTo={`#${uid}-content`}
          sticky={false}
        />
        <PageHeader
          title="Display name"
          breadcrumb={[{ label: 'Settings', href: '#settings' }, { label: 'Integrations', href: '#integrations' }, { label: 'Display name' }]}
          description="by Company"
          status={{ label: 'Category' }}
        />
        <div id={`${uid}-content`} tabIndex={-1} className={styles.body}>
          <div className={styles.cards}>
            <Card title="Connection" headingLevel={2} expandable defaultExpanded={connectionOpen} expandLabel="Connection details" details={<p className={styles.text}>Connected to the sandbox environment. Reconnect to change the account.</p>} />

            <Card title="APIs" headingLevel={2} expandable defaultExpanded expandLabel="API details" details={
              <Tabs value={tab} onValueChange={setTab}>
                <TabList aria-label="API sections">
                  <Tab value="api">API settings</Tab>
                  <Tab value="daily" badge={<Badge kind="status" tone="neutral">On</Badge>}>Daily data syncs</Tab>
                </TabList>
                <TabPanel value="api">
                  <div className={styles.panel}>
                    <div className={styles.intro}>
                      <p className={styles.text}>API limits apply to both data import and export. 6sense syncs data daily in batches using these limits. If limits are set too low or too high, data syncs may slow down, impacting features across 6sense.</p>
                      <p className={styles.text}>For best performance, we recommend using the default minimum API limits.</p>
                    </div>
                    <Input label="Application ID" requirement="optional" helperText="This is a hint text to help users." value={appId} onValueChange={(v) => { setAppId(v); setSaved(false) }} />
                    <section className={styles.sync} aria-labelledby={`${uid}-sync`}>
                      <div className={styles.syncHead}>
                        <h3 id={`${uid}-sync`} className={styles.h3}>Sync details</h3>
                        <div className={styles.range}><Select label="Date range" items={RANGE} placeholder="Last sync" disabled /></div>
                      </div>
                      <Table<ApiRow> caption="API sync details" columns={columns} rows={rows} getRowId={(r) => r.id} sort={sort} onSortChange={setSort} />
                    </section>
                    <div className={styles.actions}>
                      <Button size="small" onClick={() => setSaved(true)}>Save API settings</Button>
                      <span role="status" className={styles.saved}>{saved ? 'API settings saved.' : ''}</span>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel value="daily"><p className={styles.text}>Daily data sync settings.</p></TabPanel>
              </Tabs>
            } />
          </div>

          <aside className={styles.side} aria-label="Integration status">
            <Card title="Summary" headingLevel={2} expandable defaultExpanded expandLabel="Summary" details={
              <div className={styles.summary}>
                <ul className={styles.steps}>
                  {SUMMARY.map((s) => (
                    <li key={s.id} className={styles.step} data-level={s.level} data-current={s.current ? '' : undefined}>
                      <span>{s.label}</span>
                      {s.done ? <span className={styles.done}><Icon name="success" /><span className={styles.sr}>Complete</span></span> : null}
                    </li>
                  ))}
                </ul>
                <dl className={styles.meta}>
                  <div><dt>Last edit</dt><dd>[date]</dd></div>
                  <div><dt>Editor</dt><dd>[user]</dd></div>
                </dl>
              </div>
            } />
            <Card title="Details" headingLevel={2} expandable expandLabel="Details" details={<p className={styles.text}>Integration details.</p>} />
          </aside>
        </div>
      </div>
    </div>
  )
}
