/** Shared value formatting for all DBA charts: $, #, K/M/B abbreviations and % change. Defined once, never per chart. */

export type ValueKind = 'count' | 'currency' | 'percent'

export interface ValueFormat {
  /** `count` (#), `currency` ($) or `percent` (value is a fraction when `percentIsFraction`, else already 0-100). */
  kind?: ValueKind
  /** K, M and B abbreviations (Intl compact notation). */
  compact?: boolean
  currency?: string
  locale?: string
  maximumFractionDigits?: number
  /** For `percent`: true means 0.27 is 27%. Default false: 27 is 27%. */
  percentIsFraction?: boolean
}

export function formatValue(value: number, f: ValueFormat = {}): string {
  const { kind = 'count', compact = false, currency = 'USD', locale, maximumFractionDigits, percentIsFraction = false } = f
  if (kind === 'percent') {
    const v = percentIsFraction ? value : value / 100
    return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: maximumFractionDigits ?? 1 }).format(v)
  }
  const opts: Intl.NumberFormatOptions = {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: maximumFractionDigits ?? (compact ? 1 : 2),
  }
  if (kind === 'currency') Object.assign(opts, { style: 'currency', currency })
  return new Intl.NumberFormat(locale, opts).format(value)
}

/** Signed % change chip text, for example "+12%" or "-4.5%". Input is already a percentage (12 means 12%). */
export function formatChange(percent: number, locale?: string): string {
  const abs = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.abs(percent))
  return `${percent > 0 ? '+' : percent < 0 ? '-' : ''}${abs}%`
}
