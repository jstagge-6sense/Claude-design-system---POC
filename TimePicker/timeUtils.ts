export type HourCycle = 'h12' | 'h23'

/** A time of day. Plain wall-clock parts, no time zone. */
export interface TimeParts { hours: number; minutes: number; seconds: number }

export interface TimePreset {
  /** Visible name, for example "Morning". */
  label: string
  /** 24-hour value, "HH:MM" or "HH:MM:SS". */
  value: string
}

/** Standard presets. Keep them identical across products. */
export const DEFAULT_TIME_PRESETS: TimePreset[] = [
  { label: 'Morning', value: '09:00' },
  { label: 'End of day', value: '17:00' },
]

const NBSP = /[  ]/g
/** Arabic-Indic and Persian digits to ASCII, so RTL locales can type in their own numerals. */
export const normalizeDigits = (s: string) => s.replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660)).replace(/[\u06f0-\u06f9]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
const pad = (n: number) => String(n).padStart(2, '0')

/** 12h or 24h for a locale. en-US is 12h, most of Europe is 24h. */
export function getDefaultHourCycle(locale?: string): HourCycle {
  try {
    const o = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
    if (o.hourCycle) return o.hourCycle === 'h11' || o.hourCycle === 'h12' ? 'h12' : 'h23'
    return o.hour12 ? 'h12' : 'h23'
  } catch {
    return 'h12'
  }
}

/**
 * Smart parsing for typed times. Returns null when the text is not a time.
 * "930" is 9:30 AM, "1430" is 14:30, "2:30pm" is 14:30, "9" is 9:00, "noon" is 12:00.
 * Hours 1 to 11 without AM or PM are read as AM unless `assume` is "pm". 12 is noon.
 */
export function parseTime(input: string, opts: { assume?: 'am' | 'pm' } = {}): TimeParts | null {
  let s = normalizeDigits(String(input ?? '')).trim().toLowerCase().replace(NBSP, ' ')
  if (!s) return null
  if (s === 'noon') return { hours: 12, minutes: 0, seconds: 0 }
  if (s === 'midnight') return { hours: 0, minutes: 0, seconds: 0 }
  let meridiem: 'a' | 'p' | null = null
  const mm = /\s*([ap])(?:\.?\s*m)?\.?$/.exec(s)
  if (mm) { meridiem = mm[1] as 'a' | 'p'; s = s.slice(0, mm.index).trim() }
  let h: number, m = 0, sec = 0
  if (/^\d+$/.test(s)) {
    if (s.length > 6) return null
    if (s.length <= 2) h = +s
    else if (s.length === 3) { h = +s[0]; m = +s.slice(1) }
    else if (s.length === 4) { h = +s.slice(0, 2); m = +s.slice(2) }
    else if (s.length === 5) { h = +s[0]; m = +s.slice(1, 3); sec = +s.slice(3) }
    else { h = +s.slice(0, 2); m = +s.slice(2, 4); sec = +s.slice(4) }
  } else {
    const t = /^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/.exec(s)
    if (!t) return null
    h = +t[1]; m = +t[2]; sec = t[3] ? +t[3] : 0
  }
  if (m > 59 || sec > 59) return null
  if (meridiem) {
    if (h < 1 || h > 12) return null
    h = (h % 12) + (meridiem === 'p' ? 12 : 0)
  } else {
    if (h > 23) return null
    if (opts.assume === 'pm' && h >= 1 && h <= 11) h += 12
  }
  return { hours: h, minutes: m, seconds: sec }
}

/** Canonical 24-hour value ("HH:MM" or "HH:MM:SS") to parts. Null when it is not canonical. */
export function timeFromValue(value: string | undefined | null): TimeParts | null {
  if (!value) return null
  const t = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!t) return null
  const p = { hours: +t[1], minutes: +t[2], seconds: t[3] ? +t[3] : 0 }
  return p.hours > 23 || p.minutes > 59 || p.seconds > 59 ? null : p
}

/** Parts to the canonical 24-hour value. */
export function timeToValue(t: TimeParts, withSeconds = false): string {
  return `${pad(t.hours)}:${pad(t.minutes)}${withSeconds ? ':' + pad(t.seconds) : ''}`
}

/** Seconds since midnight, for comparing. */
export const timeToSeconds = (t: TimeParts) => t.hours * 3600 + t.minutes * 60 + t.seconds

export interface FormatTimeOptions {
  /** BCP 47 locale. Defaults to the runtime locale. */
  locale?: string
  /** 12h or 24h. Defaults to the locale preference. */
  hourCycle?: HourCycle
  /** Include seconds. */
  seconds?: boolean
}

/** Locale-aware display, for example "9:30 AM" or "09:30". Accepts parts or a canonical value. */
export function formatTime(time: TimeParts | string | null | undefined, opts: FormatTimeOptions = {}): string {
  const t = typeof time === 'string' ? timeFromValue(time) : time
  if (!t) return ''
  const hc = opts.hourCycle ?? getDefaultHourCycle(opts.locale)
  const d = new Date(2000, 0, 1, t.hours, t.minutes, t.seconds)
  try {
    return new Intl.DateTimeFormat(opts.locale, {
      hour: hc === 'h12' ? 'numeric' : '2-digit',
      minute: '2-digit',
      ...(opts.seconds ? { second: '2-digit' as const } : null),
      hourCycle: hc,
    }).format(d).replace(NBSP, ' ')
  } catch {
    return timeToValue(t, opts.seconds)
  }
}

export interface TimeSlot { value: string; label: string }

/** Preset slots across the day. `min` and `max` are canonical values and bound the list. */
export function buildTimeSlots(o: { step?: number; min?: string; max?: string; hourCycle?: HourCycle; locale?: string } = {}): TimeSlot[] {
  const step = Math.max(1, Math.min(720, Math.floor(o.step ?? 30)))
  const lo = timeFromValue(o.min) ? timeToSeconds(timeFromValue(o.min) as TimeParts) : 0
  const hi = timeFromValue(o.max) ? timeToSeconds(timeFromValue(o.max) as TimeParts) : 86399
  const out: TimeSlot[] = []
  for (let mins = 0; mins < 1440; mins += step) {
    const secs = mins * 60
    if (secs < lo || secs > hi) continue
    const t = { hours: Math.floor(mins / 60), minutes: mins % 60, seconds: 0 }
    out.push({ value: timeToValue(t), label: formatTime(t, { locale: o.locale, hourCycle: o.hourCycle }) })
  }
  return out
}
