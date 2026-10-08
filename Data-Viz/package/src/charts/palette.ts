/**
 * DBA chart colors, taken only from the 6DS color tokens (tokens/primitive/color.json).
 *
 * `palette.generated.ts` is produced by `scripts/gen-chart-palette.mjs`. Do not type hex values here and do not use
 * Highcharts default colors. Only steps with >= 3:1 contrast on white are usable. 6DS has no semantic data-visualization
 * tokens yet, so this file is the chart layer (gap GAP-chart-palette). Light mode only.
 *
 * Hues: teal (primary), blue, green, amber, red, ink (neutral). Sequential ramps are therefore short (teal 5, blue 4,
 * green 5, amber 5, red 7, ink 3 usable steps). Charts with more series than usable steps should group the tail as "Other".
 */
import { CATEGORICAL_STEPS, INK_TEXT, OTHER_STEP, PRIMARY_HUE, USABLE, WHITE, type Hue } from './palette.generated'

export { HUES, PRIMARY_HUE, USABLE, CATEGORICAL_STEPS, OTHER_STEP, MIN_CONTRAST } from './palette.generated'
export type { Hue, PaletteStep } from './palette.generated'

/** Usable ramp for a hue as hex values, light to dark. */
export function ramp(hue: Hue = PRIMARY_HUE): string[] {
  return USABLE[hue].map((s) => s.hex)
}

/** How many sequential stops a hue can supply at >= 3:1. */
export function maxSteps(hue: Hue = PRIMARY_HUE): number {
  return USABLE[hue].length
}

/**
 * N sequential stops of one hue, light to dark, evenly spaced across the usable steps.
 * If N exceeds the usable steps, the darkest stop repeats (separate the blocks with a border and labels).
 */
export function sequential(count: number, { hue = PRIMARY_HUE }: { hue?: Hue } = {}): string[] {
  const r = ramp(hue)
  const n = Math.max(1, Math.round(count))
  if (n === 1) return [r[Math.floor((r.length - 1) / 2)]]
  if (n >= r.length) return [...r, ...Array<string>(n - r.length).fill(r[r.length - 1])]
  return Array.from({ length: n }, (_, i) => r[Math.round((i * (r.length - 1)) / (n - 1))])
}

/** Single-series color: the middle usable step of the hue. */
export function single(hue: Hue = PRIMARY_HUE): string {
  const r = ramp(hue)
  return r[Math.floor((r.length - 1) / 2)]
}

/** Gray-family "Other" color (6DS Ink), so a missing hue means "different but still measured". */
export const OTHER_COLOR = OTHER_STEP.hex

/** N categorical colors in DBA order (5 hues per pass, up to 15). Group extra categories as "Other". */
export function categorical(count: number): string[] {
  return CATEGORICAL_STEPS.slice(0, Math.max(0, Math.min(15, count))).map((s) => s.hex)
}

/** Full categorical list (15), the Highcharts `colors` default. */
export const CATEGORICAL: readonly string[] = CATEGORICAL_STEPS.map((s) => s.hex)

/** hex -> rgba() string. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function channel(v: number): number {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

/** WCAG contrast ratio between two hex colors. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Text color (6DS white or Ink 900) with the higher contrast on a fill. For labels inside series shapes. */
export function readableOn(fill: string): string {
  return contrast(WHITE.hex, fill) >= contrast(INK_TEXT.hex, fill) ? WHITE.hex : INK_TEXT.hex
}
