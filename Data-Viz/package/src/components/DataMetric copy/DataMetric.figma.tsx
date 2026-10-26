// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { DataMetric } from './DataMetric'

figma.connect(DataMetric, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    label: figma.string('Label'),
    value: figma.string('Value'),
    trend: figma.enum('Trend', { Up: 'up', Down: 'down', Neutral: 'neutral' }),
    size: figma.enum('Size', { Default: 'default', Compact: 'compact' }),
    loading: figma.enum('State', { Loading: true }),
    error: figma.enum('State', { Error: true }),
  },
  example: ({ label, value, trend, size, loading, error }) => (
    <DataMetric label={label} value={value} trend={trend} size={size} loading={loading} error={error} />
  ),
})
