import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { useClickOutside, useEscapeKey } from '../../primitives/hooks'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { FieldBox, FieldShell, describedBy, useFieldIds, useFieldValidation, type FieldRequirement, type FieldSize } from '../Input/Field'
import fieldStyles from '../Input/Field.module.css'
import { TimePicker, usePanelPlacement, type HourCycle } from '../TimePicker'
import { Calendar } from './Calendar'
import {
  addDays, clampISO, formatDate, formatDateRange, getDateFormatHint, getWeekStart, isValidISO, parseDate, parseDateRange, quarterOf, todayISO,
  type DateDisplayStyle, type DateRange, type ISODate,
} from './dateUtils'
import styles from './DatePicker.module.css'

export type DateValue = ISODate | DateRange | null

export interface DatePreset {
  id: string
  label: string
  /** Range presets return a range for "today". A preset with no function (such as Custom) just lets the user pick. */
  range?: (today: ISODate) => DateRange
  /** Single-date presets return a date. They apply immediately. */
  date?: (today: ISODate) => ISODate
}

/** Standard range presets. Keep them identical across products. */
export const DEFAULT_RANGE_PRESETS: DatePreset[] = [
  { id: 'last7', label: 'Last 7 days', range: (t) => ({ start: addDays(t, -6), end: t }) },
  { id: 'last30', label: 'Last 30 days', range: (t) => ({ start: addDays(t, -29), end: t }) },
  { id: 'quarter', label: 'This quarter', range: (t) => quarterOf(t) },
  { id: 'custom', label: 'Custom' },
]
export const DEFAULT_SINGLE_PRESETS: DatePreset[] = [
  { id: 'today', label: 'Today', date: (t) => t },
  { id: 'yesterday', label: 'Yesterday', date: (t) => addDays(t, -1) },
]

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /** Persistent visible label. Never use the placeholder as the label. */
  label: ReactNode
  hideLabel?: boolean
  requirement?: FieldRequirement
  /** Shown under the field. When min or max is set and this is empty, the allowed dates are shown here so constraints are upfront. */
  helperText?: ReactNode
  error?: string
  /** Extra validation on blur. Receives the ISO date (single) or the range. Return a message or undefined. */
  validate?: (value: DateValue) => string | undefined
  requiredMessage?: string
  size?: FieldSize
  /** single: one date, applied on selection. range: start and end, applied with the Apply button. */
  mode?: 'single' | 'range'
  /** ISO date "YYYY-MM-DD" (single) or { start, end } (range). null is empty. Dates are plain calendar dates with no time zone. */
  value?: DateValue
  defaultValue?: DateValue
  onValueChange?: (value: DateValue) => void
  /** Earliest and latest selectable dates, "YYYY-MM-DD". Shown in the panel and in the helper text. */
  min?: ISODate
  max?: ISODate
  /** Extra disabled dates, for example weekends or booked days. */
  isDateDisabled?: (iso: ISODate) => boolean
  /** BCP 47 locale for display and the week start, for example "en-US" or "de-DE". */
  locale?: string
  /** Override the locale week start. 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** How the date is written in the field. */
  dateStyle?: DateDisplayStyle
  /** Preset shortcuts. `true` uses the standard set for the mode. */
  presets?: boolean | DatePreset[]
  /** Single mode only. Adds a TimePicker next to the date field. */
  withTime?: boolean
  timeLabel?: string
  time?: string
  defaultTime?: string
  onTimeChange?: (time: string) => void
  hourCycle?: HourCycle
  timeStep?: number
  /** The date that counts as today. Defaults to today on this device. Useful for tests and docs. */
  today?: ISODate
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
  /** Force day states in the open calendar, keyed by ISO date. Docs only. */
  forcedDayStates?: Record<ISODate, 'hover' | 'pressed' | 'focus'>
}

const isRange = (v: DateValue | undefined): v is DateRange => !!v && typeof v === 'object'

const DateField = forwardRef<HTMLInputElement, DatePickerProps>(function DateField(
  {
    label, hideLabel, requirement, helperText, error: errorProp, validate, requiredMessage, size = 'medium', mode = 'single', value: valueProp, defaultValue = null,
    onValueChange, min, max, isDateDisabled, locale, weekStartsOn, dateStyle = 'numeric', presets = false, today: todayProp, open: openProp, defaultOpen = false, onOpenChange,
    disabled = false, required, className, id: idProp, placeholder, onKeyDown, onBlur, onClick, 'data-state': forced, forcedDayStates, 'aria-describedby': describedByProp,
    // consumed by the outer component
    withTime: _withTime, timeLabel: _tl, time: _t, defaultTime: _dt, onTimeChange: _otc, hourCycle: _hc, timeStep: _ts,
    ...rest
  },
  ref,
) {
  void _withTime; void _tl; void _t; void _dt; void _otc; void _hc; void _ts
  const ids = useFieldIds(idProp)
  const panelId = `${ids.id}-panel`
  const inputRef = useRef<HTMLInputElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const range = mode === 'range'
  const today = todayProp && isValidISO(todayProp) ? todayProp : todayISO()
  const weekStart = weekStartsOn ?? getWeekStart(locale)
  const [value, setValue] = useControllableState<DateValue>(valueProp, defaultValue, onValueChange)
  const [openState, setOpenState] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange)
  const open = openState && !disabled
  const setOpen = (next: boolean) => { if (next !== openState) setOpenState(next) }
  const fmtOpts = { locale, style: dateStyle }
  const fmtValue = (v: DateValue): string => (range ? (isRange(v) ? formatDateRange(v, fmtOpts) : '') : typeof v === 'string' ? formatDate(v, fmtOpts) : '')
  const display = fmtValue(value)
  const [draft, setDraft] = useState(display)
  const [announce, setAnnounce] = useState('')
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const seedFocus = (v: DateValue): ISODate => clampISO((range ? (isRange(v) ? v.start : null) : typeof v === 'string' ? v : null) ?? today, min, max)
  const seedPending = (v: DateValue) => (range && isRange(v) ? { start: v.start, end: v.end } : { start: null, end: null })
  const [focusDate, setFocusDate] = useState<ISODate>(() => seedFocus(value))
  const [pending, setPending] = useState<{ start: ISODate | null; end: ISODate | null }>(() => seedPending(value))
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const placement = usePanelPlacement(open, anchorRef, panelRef)
  useEffect(() => { setDraft(display) }, [display])

  const presetList: DatePreset[] = presets === true ? (range ? DEFAULT_RANGE_PRESETS : DEFAULT_SINGLE_PRESETS) : presets === false ? [] : presets
  const hint = getDateFormatHint(locale)
  const f = (iso: ISODate) => formatDate(iso, fmtOpts)
  const constraintNote = min && max ? `Available dates: ${f(min)} to ${f(max)}.` : min ? `Available from ${f(min)}.` : max ? `Available up to ${f(max)}.` : undefined
  const unavailable = (iso: ISODate) => (!!min && iso < min) || (!!max && iso > max) || !!isDateDisabled?.(iso)

  const outOfRangeMessage = min && max ? `Enter a date between ${f(min)} and ${f(max)}.` : min ? `Enter a date on or after ${f(min)}.` : `Enter a date on or before ${f(max as string)}.`
  const validateText = (text: string): string | undefined => {
    if (!text.trim()) return undefined
    if (range) {
      const r = parseDateRange(text, { locale, today })
      if (!r) return `Enter two dates like ${hint} to ${hint}.`
      if (r.end < r.start) return 'The end date must be on or after the start date.'
      if (unavailable(r.start) || unavailable(r.end)) return (min || max) && !isDateDisabled ? outOfRangeMessage.replace('a date', 'dates') : 'One of those dates is not available. Choose another.'
      return validate?.(r)
    }
    const p = parseDate(text, { locale, today })
    if (!p) return `Enter a date like ${hint}.`
    if (unavailable(p)) return (min && p < min) || (max && p > max) ? outOfRangeMessage : 'That date is not available. Choose another.'
    return validate?.(p)
  }
  const validation = useFieldValidation({ error: errorProp, validate: validateText, required: required || requirement === 'required', requiredMessage: requiredMessage ?? 'Enter a date to continue.' })
  const error = validation.error

  const apply = (v: DateValue) => {
    setValue(v)
    const text = fmtValue(v)
    setDraft(text)
    validation.onChange(text)
    setAnnounce(v ? (isRange(v) ? `${f(v.start)} to ${f(v.end)} applied` : `${formatDate(v, { locale, style: 'full' })} selected`) : '')
  }
  const commitText = (text: string) => {
    if (!text.trim()) { if (value) setValue(null); return }
    if (validateText(text)) return
    if (range) { const r = parseDateRange(text, { locale, today }); if (r) apply(r) }
    else { const p = parseDate(text, { locale, today }); if (p) apply(p) }
  }

  const openPanel = (viaKeyboard: boolean) => {
    if (disabled) return
    setFocusDate(seedFocus(value))
    setPending(seedPending(value))
    setKeyboardOpen(viaKeyboard)
    setActivePreset(null)
    setOpen(true)
  }
  const closePanel = (refocus: boolean) => { setOpen(false); setKeyboardOpen(false); if (refocus) inputRef.current?.focus() }

  useEscapeKey(() => {
    // A nested picker (the time field) handles its own Escape first.
    const ae = document.activeElement as HTMLElement | null
    if (ae && ae !== inputRef.current && ae.getAttribute('aria-expanded') === 'true') return
    closePanel(true)
  }, open)
  useClickOutside([anchorRef], () => closePanel(false), open)
  useEffect(() => { if (open) setAnnounce(range ? 'Calendar open. Choose a start date.' : 'Calendar open. Choose a date.') }, [open, range])

  const onSelectDay = (iso: ISODate) => {
    if (unavailable(iso)) return
    setFocusDate(iso)
    if (!range) { apply(iso); closePanel(true); return }
    setActivePreset(null)
    if (!pending.start || pending.end) { setPending({ start: iso, end: null }); setAnnounce(`Start date ${f(iso)}. Choose an end date.`) }
    else {
      const next = iso < pending.start ? { start: iso, end: pending.start } : { start: pending.start, end: iso }
      setPending(next)
      setAnnounce(`${f(next.start)} to ${f(next.end)} chosen. Select Apply to confirm.`)
    }
  }
  const onPreset = (p: DatePreset) => {
    if (p.date) { const d = clampISO(p.date(today), min, max); apply(d); closePanel(true); return }
    setActivePreset(p.id)
    if (p.range) {
      const r = p.range(today)
      const next = { start: clampISO(r.start, min, max), end: clampISO(r.end, min, max) }
      setPending(next)
      setFocusDate(next.start)
      setAnnounce(`${p.label}: ${f(next.start)} to ${f(next.end)}. Select Apply to confirm.`)
    } else {
      setPending({ start: null, end: null })
      setAnnounce('Custom range. Choose a start date.')
    }
  }
  const rangeMatches = (q: DatePreset) => {
    if (!q.range || !pending.start || !pending.end) return false
    const r = q.range(today)
    return clampISO(r.start, min, max) === pending.start && clampISO(r.end, min, max) === pending.end
  }
  const matchedPreset = (p: DatePreset) => {
    if (activePreset) return activePreset === p.id
    if (p.range) return rangeMatches(p)
    if (p.date) return false
    // A preset with no value (Custom) is pressed when the chosen range matches none of the others.
    return !!pending.start && !presetList.some(rangeMatches)
  }
  const canApply = !!pending.start && !!pending.end

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || disabled) return
    if (e.key === 'ArrowDown' || (e.altKey && e.key === 'ArrowUp')) {
      e.preventDefault()
      if (!open) openPanel(true)
      else panelRef.current?.querySelector<HTMLElement>('table button[tabindex="0"]')?.focus()
    } else if (e.key === 'Enter') {
      commitText(draft); validation.onBlur(draft)
    } else if (e.key === 'Escape' && !open) {
      setDraft(display); validation.onChange(display)
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value)
    validation.onChange(e.target.value)
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e)
    if (anchorRef.current?.contains(e.relatedTarget as Node | null)) return
    commitText(draft)
    validation.onBlur(draft)
    if (e.relatedTarget) closePanel(false)
  }

  const note = helperText ?? constraintNote
  const calSelected = !range && typeof value === 'string' ? value : null

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      requirement={requirement ?? (required ? 'required' : 'none')}
      helperText={note}
      error={error}
      disabled={disabled}
      className={className}
      data-state={forced}
    >
      <div
        ref={anchorRef}
        className={styles.anchor}
        onBlur={(e) => {
          // Focus left the field and its panel (for example Tab out of the calendar): commit what was typed and close.
          const rt = e.relatedTarget as Node | null
          if (rt && !anchorRef.current?.contains(rt)) {
            if (e.target !== inputRef.current) { commitText(draft); validation.onBlur(draft) }
            closePanel(false)
          }
        }}
      >
        <FieldBox size={size} invalid={!!error} disabled={disabled} controlRef={inputRef}>
          <span className={fieldStyles.icon} aria-hidden="true"><Icon name="calendar" /></span>
          <input
            ref={mergeRefs(ref, inputRef)}
            id={ids.id}
            className={fieldStyles.control}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            placeholder={placeholder ?? (range ? `${hint} – ${hint}` : hint)}
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? panelId : undefined}
            aria-keyshortcuts="ArrowDown"
            aria-required={required || requirement === 'required' || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(ids, { helper: !!note, error: !!error }, describedByProp)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => { onClick?.(e); if (!disabled && !open) openPanel(false) }}
            {...rest}
          />
        </FieldBox>
        {open ? (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={range ? 'Choose a date range' : 'Choose a date'}
            className={styles.panel}
            data-placement={placement}
            data-presets={presetList.length ? '' : undefined}
          >
            {presetList.length ? (
              <div role="group" aria-label="Presets" className={styles.presets}>
                {presetList.map((p) => (
                  <button key={p.id} type="button" className={styles.preset} aria-pressed={range ? matchedPreset(p) : undefined} onClick={() => onPreset(p)}>{p.label}</button>
                ))}
              </div>
            ) : null}
            <div className={styles.main}>
              <Calendar
                focusDate={focusDate}
                onFocusDateChange={setFocusDate}
                mode={mode}
                selected={calSelected}
                range={range ? pending : undefined}
                onSelect={onSelectDay}
                min={min}
                max={max}
                isDateDisabled={isDateDisabled}
                today={today}
                locale={locale}
                weekStart={weekStart}
                autoFocus={keyboardOpen}
                forcedDayStates={forcedDayStates}
              />
              {constraintNote ? <p className={styles.note}>{constraintNote}</p> : null}
              {range ? (
                <div className={styles.footer}>
                  <Button size="small" priority="tertiary" onClick={() => closePanel(true)}>Cancel</Button>
                  <Button size="small" priority="primary" disabled={!canApply} unavailableReason="Choose a start and end date." id={`${ids.id}-apply`} onClick={() => { if (pending.start && pending.end) { apply({ start: pending.start, end: pending.end }); closePanel(true) } }}>Apply</Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
    </FieldShell>
  )
})

/**
 * Date field with a calendar panel. Single date applies on selection. A range applies with the Apply button.
 * Typing is always supported. Dates are plain calendar dates with no time zone.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(props, ref) {
  const { withTime = false, timeLabel = 'Time', time: timeProp, defaultTime = '', onTimeChange, hourCycle, timeStep, mode = 'single', locale, disabled, size } = props
  const [time, setTime] = useControllableState<string>(timeProp, defaultTime, onTimeChange)
  if (!withTime) return <DateField ref={ref} {...props} />
  if (mode === 'range' && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn('DatePicker: withTime is only available for a single date. The time field is not shown for ranges.')
  }
  if (mode === 'range') return <DateField ref={ref} {...props} />
  return (
    <div className={cx(styles.withTime)}>
      <DateField ref={ref} {...props} />
      <div className={styles.timeField}>
        <TimePicker label={timeLabel} value={time} onValueChange={setTime} locale={locale} hourCycle={hourCycle} step={timeStep} disabled={disabled} size={size} />
      </div>
    </div>
  )
})
