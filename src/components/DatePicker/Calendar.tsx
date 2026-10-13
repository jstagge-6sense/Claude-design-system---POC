import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import {
  addDays, addMonths, addYears, clampISO, formatDate, monthGrid, monthTitle, parseISO, startOfWeek, toISO, weekdayLabels,
  type ISODate, type YMD,
} from './dateUtils'
import styles from './DatePicker.module.css'

export interface CalendarProps {
  /** The roving focus date. Its month is the month shown. */
  focusDate: ISODate
  onFocusDateChange: (iso: ISODate) => void
  mode: 'single' | 'range'
  /** Selected date (single mode). */
  selected?: ISODate | null
  /** Draft range (range mode). `end` is null while the user is choosing it. */
  range?: { start: ISODate | null; end: ISODate | null }
  onSelect: (iso: ISODate) => void
  min?: ISODate
  max?: ISODate
  isDateDisabled?: (iso: ISODate) => boolean
  today: ISODate
  locale?: string
  /** 0 = Sunday, 1 = Monday ... */
  weekStart: number
  /** Move DOM focus to the focus date on mount (used when the panel is opened from the keyboard). */
  autoFocus?: boolean
  /** Force day states. Docs only. */
  forcedDayStates?: Record<ISODate, 'hover' | 'pressed' | 'focus'>
}

/** Month grid with navigation. Roving tabindex, full keyboard support, range preview. */
export function Calendar({
  focusDate, onFocusDateChange, mode, selected, range, onSelect, min, max, isDateDisabled, today, locale, weekStart, autoFocus, forcedDayStates,
}: CalendarProps) {
  const titleId = useId()
  const gridRef = useRef<HTMLTableElement>(null)
  const moveFocus = useRef(!!autoFocus)
  const [preview, setPreview] = useState<ISODate | null>(null)
  const view = parseISO(focusDate) as YMD
  const title = monthTitle(view.y, view.m, locale)
  const weeks = useMemo(() => monthGrid(view.y, view.m, weekStart), [view.y, view.m, weekStart])
  const labels = useMemo(() => weekdayLabels(weekStart, locale), [weekStart, locale])
  const nf = useMemo(() => { try { return new Intl.NumberFormat(locale, { useGrouping: false }) } catch { return new Intl.NumberFormat() } }, [locale])
  const disabled = (iso: ISODate) => (!!min && iso < min) || (!!max && iso > max) || !!isDateDisabled?.(iso)

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    gridRef.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus()
  }, [focusDate])
  useEffect(() => {
    if (autoFocus) gridRef.current?.querySelector<HTMLElement>('button[tabindex="0"]')?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goto = (iso: ISODate, viaKeyboard: boolean) => {
    const next = clampISO(iso, min, max)
    if (viaKeyboard) { moveFocus.current = true; if (mode === 'range') setPreview(next) }
    onFocusDateChange(next)
  }
  const canGo = (months: number) => {
    const first = addMonths(toISO({ y: view.y, m: view.m, d: 1 }), months)
    const p = parseISO(first) as YMD
    const last = toISO({ y: p.y, m: p.m, d: new Date(Date.UTC(p.y, p.m, 0)).getUTCDate() })
    return !(min && last < min) && !(max && first > max)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const rtl = gridRef.current ? getComputedStyle(gridRef.current).direction === 'rtl' : false
    let next: ISODate | null = null
    switch (e.key) {
      case 'ArrowLeft': next = addDays(focusDate, rtl ? 1 : -1); break
      case 'ArrowRight': next = addDays(focusDate, rtl ? -1 : 1); break
      case 'ArrowUp': next = addDays(focusDate, -7); break
      case 'ArrowDown': next = addDays(focusDate, 7); break
      case 'Home': next = startOfWeek(focusDate, weekStart); break
      case 'End': next = addDays(startOfWeek(focusDate, weekStart), 6); break
      case 'PageUp': next = e.shiftKey ? addYears(focusDate, -1) : addMonths(focusDate, -1); break
      case 'PageDown': next = e.shiftKey ? addYears(focusDate, 1) : addMonths(focusDate, 1); break
      case 'Enter': case ' ':
        e.preventDefault()
        if (!disabled(focusDate)) onSelect(focusDate)
        return
      default: return
    }
    e.preventDefault()
    goto(next, true)
  }

  // Range band: ordered start and end, using the preview while the end is still being chosen.
  const rs = mode === 'range' ? range?.start ?? null : null
  const re = mode === 'range' ? range?.end ?? (rs ? preview : null) : null
  const lo = rs && re ? (rs < re ? rs : re) : rs
  const hi = rs && re ? (rs < re ? re : rs) : null

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <Button size="small" priority="tertiary" iconOnly icon={<Icon name="chevronsLeft" />} aria-label="Previous year" disabled={!canGo(-12)} onClick={() => goto(addYears(focusDate, -1), false)} />
        <Button size="small" priority="tertiary" iconOnly icon={<Icon name="chevronLeft" />} aria-label="Previous month" disabled={!canGo(-1)} onClick={() => goto(addMonths(focusDate, -1), false)} />
        <div id={titleId} className={styles.title} aria-live="polite">{title}</div>
        <Button size="small" priority="tertiary" iconOnly icon={<Icon name="chevronRight" />} aria-label="Next month" disabled={!canGo(1)} onClick={() => goto(addMonths(focusDate, 1), false)} />
        <Button size="small" priority="tertiary" iconOnly icon={<Icon name="chevronsRight" />} aria-label="Next year" disabled={!canGo(12)} onClick={() => goto(addYears(focusDate, 1), false)} />
      </div>
      <table ref={gridRef} role="grid" aria-label={title} className={styles.grid} onKeyDown={onKeyDown} onMouseLeave={() => setPreview(null)}>
        <thead>
          <tr>
            {labels.map((w) => (
              <th key={w.index} scope="col" abbr={w.long} className={styles.weekday}><span aria-hidden="true">{w.short}</span><VisuallyHidden>{w.long}</VisuallyHidden></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((iso) => {
                const p = parseISO(iso) as YMD
                const outside = p.m !== view.m
                const isStart = mode === 'range' ? iso === lo : iso === selected
                const isEnd = mode === 'range' && !!hi && iso === hi
                const inRange = mode === 'range' && !!lo && !!hi && iso > lo && iso < hi
                const isSelected = isStart || isEnd
                const off = disabled(iso)
                const rangeText = isStart && mode === 'range' ? (hi ? ', start of range' : ', range start') : isEnd ? ', end of range' : inRange ? ', in range' : ''
                const rangeAttr = mode === 'range' ? (isStart && hi ? 'start' : isEnd ? 'end' : inRange ? 'in' : undefined) : undefined
                return (
                  <td key={iso} role="gridcell" aria-selected={isSelected || inRange} className={styles.cell} data-range={rangeAttr}>
                    <button
                      type="button"
                      tabIndex={iso === focusDate ? 0 : -1}
                      className={styles.day}
                      aria-label={`${formatDate(iso, { locale, style: 'full' })}${rangeText}`}
                      aria-current={iso === today ? 'date' : undefined}
                      aria-disabled={off || undefined}
                      data-today={iso === today || undefined}
                      data-selected={isSelected || undefined}
                      data-outside={outside || undefined}
                      data-state={forcedDayStates?.[iso]}
                      onClick={() => { if (!off) onSelect(iso); else onFocusDateChange(iso) }}
                      onFocus={() => { if (iso !== focusDate) onFocusDateChange(iso) }}
                      onMouseEnter={() => { if (mode === 'range') setPreview(iso) }}
                    >
                      <span className={styles.dayInner}>{nf.format(p.d)}</span>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
