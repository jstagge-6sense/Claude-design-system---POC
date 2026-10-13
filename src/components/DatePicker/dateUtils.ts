/**
 * Calendar date helpers. Dates are plain calendar dates written "YYYY-MM-DD" (ISO 8601).
 * They carry no time and no time zone. All arithmetic uses UTC only so that it never shifts a day.
 */
export type ISODate = string

export interface DateRange { start: ISODate; end: ISODate }
export type DateDisplayStyle = 'numeric' | 'short' | 'medium' | 'long' | 'full'

const pad = (n: number, w = 2) => String(n).padStart(w, '0')
const NBSP = /[  ]/g
const normalizeDigits = (s: string) => s.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))

const utc = (y: number, m: number, d: number) => { const dt = new Date(0); dt.setUTCFullYear(y, m - 1, d); dt.setUTCHours(0, 0, 0, 0); return dt }
export const daysInMonth = (y: number, m: number) => utc(y, m + 1, 0).getUTCDate()
const isoOf = (dt: Date) => `${pad(dt.getUTCFullYear(), 4)}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`

export interface YMD { y: number; m: number; d: number }

/** Strict "YYYY-MM-DD" to parts. Null when it is not a real calendar date. */
export function parseISO(s: string | null | undefined): YMD | null {
  const t = s ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(s) : null
  if (!t) return null
  const y = +t[1], m = +t[2], d = +t[3]
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m) ? { y, m, d } : null
}
export const toISO = ({ y, m, d }: YMD): ISODate => `${pad(y, 4)}-${pad(m)}-${pad(d)}`
export const isValidISO = (s: string | null | undefined): s is ISODate => parseISO(s) !== null

/** Today on this device, as a calendar date. */
export function todayISO(): ISODate {
  const n = new Date()
  return toISO({ y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() })
}

export function addDays(iso: ISODate, n: number): ISODate {
  const p = parseISO(iso) as YMD
  const dt = utc(p.y, p.m, p.d)
  dt.setUTCDate(dt.getUTCDate() + n)
  return isoOf(dt)
}
/** Adds months and keeps the day when it exists, otherwise clamps to the last day of the month. */
export function addMonths(iso: ISODate, n: number): ISODate {
  const p = parseISO(iso) as YMD
  const idx = p.y * 12 + (p.m - 1) + n
  const y = Math.floor(idx / 12), m = (idx % 12 + 12) % 12 + 1
  return toISO({ y, m, d: Math.min(p.d, daysInMonth(y, m)) })
}
export const addYears = (iso: ISODate, n: number) => addMonths(iso, n * 12)
export const compareISO = (a: ISODate, b: ISODate) => (a < b ? -1 : a > b ? 1 : 0)
/** 0 = Sunday ... 6 = Saturday. */
export function weekdayOf(iso: ISODate): number {
  const p = parseISO(iso) as YMD
  return utc(p.y, p.m, p.d).getUTCDay()
}
export function startOfWeek(iso: ISODate, weekStart: number): ISODate {
  return addDays(iso, -((weekdayOf(iso) - weekStart + 7) % 7))
}
export const clampISO = (iso: ISODate, min?: ISODate, max?: ISODate) => (min && iso < min ? min : max && iso > max ? max : iso)

/** Quarter start and end for a date (calendar quarters). */
export function quarterOf(iso: ISODate): DateRange {
  const p = parseISO(iso) as YMD
  const q0 = Math.floor((p.m - 1) / 3) * 3 + 1
  return { start: toISO({ y: p.y, m: q0, d: 1 }), end: toISO({ y: p.y, m: q0 + 2, d: daysInMonth(p.y, q0 + 2) }) }
}

/* ---- Locale ---- */

const defaultLocale = () => (typeof navigator !== 'undefined' && navigator.language) || 'en-US'
const SUN_REGIONS = new Set(['US', 'CA', 'MX', 'BR', 'JP', 'IL', 'IN', 'KR', 'PH', 'TW', 'ZA', 'SA', 'AR', 'CO', 'PE', 'VE', 'ID', 'TH', 'HK', 'PA', 'DO', 'GT', 'HN', 'NI', 'PR', 'SV', 'CN'])
const SAT_REGIONS = new Set(['AE', 'AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA', 'SD', 'SY'])

/** First day of the week for a locale. 0 = Sunday, 1 = Monday, 6 = Saturday. */
export function getWeekStart(locale?: string): number {
  try {
    const l = new Intl.Locale(locale ?? defaultLocale()) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }
    const info = l.getWeekInfo?.() ?? l.weekInfo
    if (info && typeof info.firstDay === 'number') return info.firstDay % 7
    const region = l.region ?? l.maximize().region ?? ''
    return SUN_REGIONS.has(region) ? 0 : SAT_REGIONS.has(region) ? 6 : 1
  } catch {
    return 0
  }
}

const dtf = (locale: string | undefined, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: 'UTC', calendar: 'gregory' })

const STYLE_OPTS: Record<DateDisplayStyle, Intl.DateTimeFormatOptions> = {
  numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
  short: { year: 'numeric', month: 'numeric', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
}

/** Locale-aware display of a plain calendar date, for example "01/05/2026" or "5 Jan 2026". */
export function formatDate(date: ISODate | null | undefined, opts: { locale?: string; style?: DateDisplayStyle } = {}): string {
  const p = parseISO(date)
  if (!p) return ''
  try {
    return dtf(opts.locale, STYLE_OPTS[opts.style ?? 'numeric']).format(utc(p.y, p.m, p.d)).replace(NBSP, ' ')
  } catch {
    return toISO(p)
  }
}
export function formatDateRange(r: DateRange | null | undefined, opts: { locale?: string; style?: DateDisplayStyle } = {}): string {
  if (!r || !r.start) return ''
  return r.end ? `${formatDate(r.start, opts)} – ${formatDate(r.end, opts)}` : formatDate(r.start, opts)
}

type Part = 'm' | 'd' | 'y'
/** Day, month and year order for a locale, for example ['m', 'd', 'y'] for en-US. */
export function getDateOrder(locale?: string): Part[] {
  try {
    const parts = dtf(locale, { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(utc(2000, 11, 22))
    const out = parts.map((p) => (p.type === 'month' ? 'm' : p.type === 'day' ? 'd' : p.type === 'year' ? 'y' : null)).filter(Boolean) as Part[]
    return out.length === 3 ? out : ['m', 'd', 'y']
  } catch {
    return ['m', 'd', 'y']
  }
}

/** A short format hint for placeholders, for example "MM/DD/YYYY". */
export function getDateFormatHint(locale?: string): string {
  try {
    return dtf(locale, STYLE_OPTS.numeric).formatToParts(utc(2000, 11, 22)).map((p) => (p.type === 'month' ? 'MM' : p.type === 'day' ? 'DD' : p.type === 'year' ? 'YYYY' : p.value)).join('').replace(NBSP, ' ')
  } catch {
    return 'MM/DD/YYYY'
  }
}

export const monthTitle = (y: number, m: number, locale?: string) => dtf(locale, { month: 'long', year: 'numeric' }).format(utc(y, m, 1))
export const monthName = (m: number, locale?: string, style: 'long' | 'short' = 'long') => dtf(locale, { month: style }).format(utc(2026, m, 1))
export function weekdayLabels(weekStart: number, locale?: string): Array<{ short: string; long: string; index: number }> {
  return Array.from({ length: 7 }, (_, i) => {
    const idx = (weekStart + i) % 7
    const d = utc(2026, 1, 4 + idx) // 4 Jan 2026 is a Sunday
    return { index: idx, short: dtf(locale, { weekday: 'short' }).format(d), long: dtf(locale, { weekday: 'long' }).format(d) }
  })
}

/** Six weeks of dates (42 cells) covering a month, starting on `weekStart`. A fixed row count keeps the panel from jumping. */
export function monthGrid(y: number, m: number, weekStart: number): ISODate[][] {
  const first = startOfWeek(toISO({ y, m, d: 1 }), weekStart)
  return Array.from({ length: 6 }, (_, r) => Array.from({ length: 7 }, (_, c) => addDays(first, r * 7 + c)))
}

/* ---- Lenient parsing ---- */

const EN_MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const EN_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const clean = (s: string) => s.toLowerCase().replace(/\./g, '').normalize('NFC')

function monthLookup(locale?: string): Map<string, number> {
  const map = new Map<string, number>()
  for (let m = 1; m <= 12; m++) {
    const en = EN_MONTHS[m - 1]
    map.set(en, m); map.set(en.slice(0, 3), m)
    if (en === 'september') map.set('sept', m)
    try {
      for (const st of ['long', 'short'] as const) map.set(clean(monthName(m, locale, st)), m)
    } catch { /* locale not supported, English names still work */ }
  }
  return map
}
function weekdaySet(locale?: string): Set<string> {
  const set = new Set<string>()
  EN_DAYS.forEach((d) => { set.add(d); set.add(d.slice(0, 3)) })
  try { weekdayLabels(0, locale).forEach((w) => { set.add(clean(w.long)); set.add(clean(w.short)) }) } catch { /* ignore */ }
  return set
}

function build(y: number, m: number, d: number): ISODate | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || y < 1 || y > 9999) return null
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null
  return toISO({ y, m, d })
}
const fullYear = (s: string) => (s.length <= 2 ? (+s < 70 ? 2000 + +s : 1900 + +s) : +s)

/**
 * Lenient parsing of typed dates. Returns an ISO date or null.
 * Accepts 2026-01-05, 1/5/2026, 05.01.2026 (order follows the locale), 5 Jan 2026, January 5, 2026,
 * Jan 5, 20260105, today, tomorrow and yesterday. When the day and month cannot be read in the locale order
 * (for example 25/12/2026 in en-US) they are swapped.
 */
export function parseDate(input: string, opts: { locale?: string; today?: ISODate } = {}): ISODate | null {
  let s = normalizeDigits(String(input ?? '')).trim().toLowerCase().replace(NBSP, ' ').replace(/\s+/g, ' ')
  if (!s) return null
  const today = opts.today && isValidISO(opts.today) ? opts.today : todayISO()
  const ty = (parseISO(today) as YMD).y
  if (s === 'today') return today
  if (s === 'tomorrow') return addDays(today, 1)
  if (s === 'yesterday') return addDays(today, -1)
  s = s.replace(/(\d)(st|nd|rd|th)\b/g, '$1')

  const order = getDateOrder(opts.locale)
  const fromOrder = (a: string, b: string, c: string): ISODate | null => {
    // a, b, c are the three tokens in the order they were typed. Map them with the locale order.
    const v: Record<Part, string> = { m: '', d: '', y: '' }
    order.forEach((p, i) => { v[p] = [a, b, c][i] })
    const y = fullYear(v.y)
    return build(y, +v.m, +v.d) ?? (order[0] !== 'y' ? build(y, +v.d, +v.m) : null)
  }

  const tokens = s.split(/[\s,./-]+/).filter(Boolean)
  if (!tokens.length) return null
  const numeric = tokens.every((t) => /^\d+$/.test(t))
  if (numeric) {
    if (tokens.length === 3) {
      const [a, b, c] = tokens
      if (a.length === 4) return build(+a, +b, +c)
      if (c.length === 4 || c.length <= 2) return fromOrder(a, b, c)
      return null
    }
    if (tokens.length === 2) {
      const [a, b] = tokens
      const noYear = order.filter((p) => p !== 'y')
      const v: Record<string, number> = {}
      noYear.forEach((p, i) => { v[p] = +[a, b][i] })
      return build(ty, v.m, v.d) ?? build(ty, v.d, v.m)
    }
    if (tokens.length === 1) {
      const t = tokens[0]
      if (t.length === 8) return /^(1[0-9]|20)/.test(t) && build(+t.slice(0, 4), +t.slice(4, 6), +t.slice(6)) ? build(+t.slice(0, 4), +t.slice(4, 6), +t.slice(6)) : fromOrder(...(order[0] === 'y' ? [t.slice(0, 4), t.slice(4, 6), t.slice(6)] : order[2] === 'y' ? [t.slice(0, 2), t.slice(2, 4), t.slice(4)] : [t.slice(0, 2), t.slice(2, 4), t.slice(4)]) as [string, string, string])
      if (t.length === 6) return fromOrder(t.slice(0, 2), t.slice(2, 4), t.slice(4))
    }
    return null
  }

  // Text month: find it, ignore weekday names, read the numbers.
  const months = monthLookup(opts.locale)
  const days = weekdaySet(opts.locale)
  let month = 0
  const nums: string[] = []
  for (const t of tokens) {
    if (/^\d+$/.test(t)) { nums.push(t); continue }
    const c = clean(t)
    const hit = months.get(c)
    if (hit && !month) { month = hit; continue }
    if (days.has(c)) continue
    return null
  }
  if (!month) return null
  const four = nums.find((n) => n.length === 4)
  if (four) {
    const rest = nums.filter((n) => n !== four)
    return rest.length === 1 ? build(+four, month, +rest[0]) : null
  }
  if (nums.length === 1) return build(ty, month, +nums[0])
  if (nums.length === 2) return build(fullYear(nums[1]), month, +nums[0])
  return null
}

/** Parses "start to end" text. The end may come before the start: the caller decides how to explain that. */
export function parseDateRange(input: string, opts: { locale?: string; today?: ISODate } = {}): DateRange | null {
  const parts = String(input ?? '').split(/\s*(?:–|—|→|\bto\b|\s-\s)\s*/i).map((p) => p.trim()).filter(Boolean)
  if (parts.length !== 2) return null
  const a = parseDate(parts[0], opts), b = parseDate(parts[1], opts)
  return a && b ? { start: a, end: b } : null
}
