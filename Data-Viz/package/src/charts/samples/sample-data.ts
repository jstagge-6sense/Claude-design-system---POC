// Synthetic sample data for the DBA chart samples. Not real customer data.
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const engagedAccounts = [820, 870, 860, 910, 990, 970, 1040, 1120, 1180, 1250, 1230, 1250]

export const pipelineByRegion = [
  { name: 'North America', data: [4.1, 4.4, 4.9, 5.2, 5.8, 6.1] },
  { name: 'EMEA', data: [2.2, 2.5, 2.4, 2.9, 3.1, 3.4] },
  { name: 'APAC', data: [1.1, 1.3, 1.6, 1.5, 1.9, 2.2] },
  { name: 'Other', data: [0.4, 0.5, 0.4, 0.6, 0.6, 0.7], other: true },
]

export const industries = [
  { name: 'Software', value: 420 },
  { name: 'Financial services', value: 310 },
  { name: 'Healthcare', value: 280 },
  { name: 'Manufacturing', value: 190 },
  { name: 'Retail', value: 140 },
]

export const channels = [
  { name: 'Email', value: 52 },
  { name: 'Paid', value: 38 },
  { name: 'Events', value: 27 },
  { name: 'Organic', value: 61 },
]

export const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
export const leadsByChannel = [
  { name: 'Email', data: [30, 34, 28, 40] },
  { name: 'Paid', data: [20, 22, 25, 18] },
  { name: 'Events', data: [10, 12, 15, 20] },
  { name: 'Other', data: [4, 5, 3, 6], other: true },
]

export const accountsByTier = [
  { name: 'Tier 1', value: 540 },
  { name: 'Tier 2', value: 320 },
  { name: 'Tier 3', value: 210 },
  { name: 'Other', value: 60, other: true },
]

export const buyingStages = [
  { name: 'Targeted', value: 12480 },
  { name: 'Aware', value: 6200 },
  { name: 'Considering', value: 2400 },
  { name: 'Decision', value: 820 },
  { name: 'Purchase', value: 310 },
]

export const ticketCauses = [
  { name: 'Login', value: 120 },
  { name: 'Billing', value: 80 },
  { name: 'Sync', value: 45 },
  { name: 'Reports', value: 20 },
  { name: 'Other', value: 15 },
]
