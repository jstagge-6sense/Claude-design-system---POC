// Code Connect. Replace FILE_KEY and NODE_ID with values from the Figma state ledger. Never guess node IDs.
import figma from '@figma/code-connect'
import { Badge } from './Badge'

figma.connect(Badge, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    kind: figma.enum('Kind', { Status: 'status', Category: 'category', Count: 'count', New: 'new' }),
    tone: figma.enum('Tone', { Neutral: 'neutral', Info: 'info', Success: 'success', Warning: 'warning', Critical: 'critical', Accent: 'accent' }),
    label: figma.string('Label'),
    icon: figma.instance('Leading icon'),
  },
  example: ({ kind, tone, label, icon }) => <Badge kind={kind} tone={tone} icon={icon}>{label}</Badge>,
})
