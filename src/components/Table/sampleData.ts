/** Synthetic sample data for stories and tests. Not real customer data. */
export interface Account {
  id: string
  name: string
  owner: string
  stage: 'Target' | 'Engaged' | 'Opportunity' | 'Customer'
  score: number
  arr: number
  domain: string
  notes: string
}

const NAMES = ['Acme Corp', 'Globex Industries', 'Initech', 'Umbrella Logistics', 'Hooli Systems', 'Stark Analytics', 'Wayne Freight', 'Soylent Foods', 'Wonka Confections', 'Tyrell Robotics', 'Cyberdyne Labs', 'Vandelay Imports', 'Pied Piper Cloud', 'Massive Dynamic', 'Oscorp Health', 'Gringotts Capital']
const OWNERS = ['Priya Shah', 'Marcus Lee', 'Elena Rossi', 'Tom Becker']
const STAGES: Account['stage'][] = ['Target', 'Engaged', 'Opportunity', 'Customer']

export const ACCOUNTS: Account[] = NAMES.map((name, i) => ({
  id: `acct-${i + 1}`,
  name,
  owner: OWNERS[i % OWNERS.length],
  stage: STAGES[(i * 3) % STAGES.length],
  score: 40 + ((i * 17) % 59),
  arr: 12000 + ((i * 7919) % 90000),
  domain: `${name.toLowerCase().replace(/[^a-z]+/g, '')}.example.com`,
  notes: i % 3 === 0
    ? 'Renewal conversation scheduled. Champion changed roles last quarter, so confirm the new economic buyer before the next call.'
    : 'No open risks.',
}))
