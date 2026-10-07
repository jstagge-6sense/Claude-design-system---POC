import { forwardRef, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { useEscapeKey, useClickOutside } from '../../primitives/hooks'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { FieldBox, FieldShell, describedBy, useFieldIds, useFieldValidation, type FieldRequirement, type FieldSize } from '../Input/Field'
import fieldStyles from '../Input/Field.module.css'
import {
  DEFAULT_TIME_PRESETS, buildTimeSlots, formatTime, getDefaultHourCycle, normalizeDigits, parseTime, timeFromValue, timeToSeconds, timeToValue,
  type HourCycle, type TimeParts, type TimePreset,
} from './timeUtils'
import { usePanelPlacement } from './usePanelPlacement'
import styles from './TimePicker.module.css'

export interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type'> {
  /** Persistent visible label. Never use the placeholder as the label. */
  label: ReactNode
  hideLabel?: boolean
  requirement?: FieldRequirement
  helperText?: ReactNode
  /** Error message. When set the field is invalid and the message is wired via aria-describedby. */
  error?: string
  /** Extra validation on blur. Receives the canonical 24-hour value. Return a message or undefined. */
  validate?: (value: string) => string | undefined
  requiredMessage?: string
  size?: FieldSize
  /** Canonical 24-hour value, "HH:MM" (or "HH:MM:SS" when `granular`). Empty string means no time. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Minutes between preset slots in the list. */
  step?: number
  /** Earliest and latest time, canonical 24-hour values. Shown in the error message and used to bound the list. */
  min?: string
  max?: string
  /** 12h or 24h. Defaults to the locale preference. */
  hourCycle?: HourCycle
  /** BCP 47 locale for display, for example "en-US" or "de-DE". */
  locale?: string
  /** Hours, minutes and seconds entry with an explicit Apply button. Replaces the slot list. */
  granular?: boolean
  /** Named presets such as Morning and End of day. `true` uses the standard set. */
  presets?: boolean | TimePreset[]
  /** Read hours 1 to 11 typed without AM or PM as AM or PM. */
  assume?: 'am' | 'pm'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'focus'
  /** Force an option state in the open list, keyed by canonical value. Docs only. */
  forcedOptionStates?: Record<string, 'hover' | 'pressed' | 'focus'>
}

interface Opt { id: string; value: string; label: string; hint?: string; group: 'presets' | 'times' }

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    label, hideLabel, requirement, helperText, error: errorProp, validate, requiredMessage, size = 'medium', value: valueProp, defaultValue = '', onValueChange,
    step = 30, min, max, hourCycle: hourCycleProp, locale, granular = false, presets = false, assume, open: openProp, defaultOpen = false, onOpenChange,
    disabled = false, required, className, id: idProp, placeholder, onKeyDown, onBlur, onClick, 'data-state': forced, forcedOptionStates,
    'aria-describedby': describedByProp, ...rest
  },
  ref,
) {
  const ids = useFieldIds(idProp)
  const gen = useId()
  const panelId = `${ids.id}-panel`
  const inputRef = useRef<HTMLInputElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const hourCycle = hourCycleProp ?? getDefaultHourCycle(locale)
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue, onValueChange)
  const [openState, setOpenState] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange)
  const open = openState && !disabled
  const setOpen = (next: boolean) => { if (next !== openState) setOpenState(next) }
  const fmt = (v: string | TimeParts | null) => formatTime(v, { locale, hourCycle, seconds: granular })
  const display = value ? fmt(value) : ''
  const [draft, setDraft] = useState(display)
  const [announce, setAnnounce] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => { setDraft(display) }, [display])
  const placement = usePanelPlacement(open, anchorRef, panelRef)

  const presetList: TimePreset[] = presets === true ? DEFAULT_TIME_PRESETS : presets === false ? [] : presets
  const options = useMemo<Opt[]>(() => {
    if (granular) return []
    const out: Opt[] = []
    presetList.forEach((p, i) => out.push({ id: `${ids.id}-opt-p${i}`, value: p.value, label: p.label, hint: formatTime(p.value, { locale, hourCycle }), group: 'presets' }))
    buildTimeSlots({ step, min, max, hourCycle, locale }).forEach((s, i) => out.push({ id: `${ids.id}-opt-t${i}`, value: s.value, label: s.label, group: 'times' }))
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granular, presets, step, min, max, hourCycle, locale, ids.id])

  const minS = timeFromValue(min) ? timeToSeconds(timeFromValue(min) as TimeParts) : null
  const maxS = timeFromValue(max) ? timeToSeconds(timeFromValue(max) as TimeParts) : null
  const example = hourCycle === 'h12' ? '9:30 AM' : '09:30'
  const validateText = (text: string): string | undefined => {
    if (!text.trim()) return undefined
    const p = parseTime(text, { assume })
    if (!p) return `Enter a time like ${example}.`
    const s = timeToSeconds(p)
    if ((minS != null && s < minS) || (maxS != null && s > maxS)) {
      return `Enter a time between ${fmt(min ?? '00:00')} and ${fmt(max ?? '23:59')}.`
    }
    return validate?.(timeToValue(p, granular))
  }
  const validation = useFieldValidation({ error: errorProp, validate: validateText, required: required || requirement === 'required', requiredMessage: requiredMessage ?? 'Enter a time to continue.' })
  const error = validation.error

  const commitValue = (v: string) => {
    setValue(v)
    const text = v ? fmt(v) : ''
    setDraft(text)
    validation.onChange(text)
    if (v) setAnnounce(`${text} selected`)
  }
  const commitText = (text: string) => {
    if (!text.trim()) { if (value) setValue(''); return }
    const p = parseTime(text, { assume })
    if (!p) return
    const s = timeToSeconds(p)
    if ((minS != null && s < minS) || (maxS != null && s > maxS)) return
    const v = timeToValue(p, granular)
    if (v !== value) setValue(v)
    setDraft(fmt(v))
    setAnnounce(`${fmt(v)} selected`)
  }
  const selectOption = (o: Opt) => {
    commitValue(granular ? `${o.value}:00` : o.value)
    setOpen(false)
    inputRef.current?.focus()
  }

  useEscapeKey(() => { setOpen(false); inputRef.current?.focus() }, open)
  useClickOutside([anchorRef], () => setOpen(false), open)
  useEffect(() => {
    if (!open || granular) return
    setAnnounce(`${options.length} times available. Use the up and down arrow keys, then Enter.`)
    const sel = options.find((o) => o.group === 'times' && o.value === value)
    setActiveId(sel ? sel.id : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  useEffect(() => {
    if (!open || !activeId) return
    document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [open, activeId])
  useEffect(() => {
    if (!open || granular || !panelRef.current) return
    const sel = panelRef.current.querySelector('[role="option"][data-selected]')
    sel?.scrollIntoView?.({ block: 'nearest' })
  }, [open, granular])

  const move = (delta: number) => {
    if (!options.length) return
    const i = options.findIndex((o) => o.id === activeId)
    const next = i < 0 ? (delta > 0 ? 0 : options.length - 1) : Math.min(options.length - 1, Math.max(0, i + delta))
    setActiveId(options[next].id)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || disabled) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) setOpen(true); else if (!granular) move(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!open) setOpen(true); else if (!granular) move(-1)
        break
      case 'PageDown': if (open && !granular) { e.preventDefault(); move(6) } break
      case 'PageUp': if (open && !granular) { e.preventDefault(); move(-6) } break
      case 'Enter': {
        const o = open && !granular ? options.find((x) => x.id === activeId) : undefined
        if (o) { e.preventDefault(); selectOption(o) } else { commitText(draft); validation.onBlur(draft); setOpen(false) }
        break
      }
      case 'Escape':
        if (!open) { setDraft(display); validation.onChange(display) }
        break
      default:
    }
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value
    setDraft(t)
    validation.onChange(t)
    if (open && !granular) {
      const p = parseTime(t, { assume })
      const v = p ? timeToValue(p) : null
      const o = v ? options.find((x) => x.group === 'times' && x.value >= v) : undefined
      setActiveId(o ? o.id : null)
    }
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    onBlur?.(e)
    if (anchorRef.current?.contains(e.relatedTarget as Node | null)) return
    commitText(draft)
    validation.onBlur(draft)
    if (e.relatedTarget) setOpen(false)
  }

  const group = (g: 'presets' | 'times') => options.filter((o) => o.group === g)
  const renderOpt = (o: Opt) => {
    const selected = o.value === value
    return (
      <div
        key={o.id}
        id={o.id}
        role="option"
        aria-selected={selected}
        className={styles.option}
        data-active={o.id === activeId || undefined}
        data-selected={selected || undefined}
        data-state={forcedOptionStates?.[o.value]}
        onClick={() => selectOption(o)}
      >
        <span className={styles.check} aria-hidden="true">{selected ? <Icon name="check" /> : null}</span>
        <span className={styles.optionLabel}>{o.label}</span>
        {o.hint ? <span className={styles.hint}>{o.hint}</span> : null}
      </div>
    )
  }
  const presetGroupId = `${gen}-presets`

  return (
    <FieldShell
      ids={ids}
      label={label}
      hideLabel={hideLabel}
      requirement={requirement ?? (required ? 'required' : 'none')}
      helperText={helperText}
      error={error}
      disabled={disabled}
      className={className}
      data-state={forced}
    >
      <div
        ref={anchorRef}
        className={styles.anchor}
        onBlur={(e) => {
          // Focus left the field and its panel (for example Tab out of the granular panel): commit what was typed and close.
          const rt = e.relatedTarget as Node | null
          if (rt && !anchorRef.current?.contains(rt)) {
            if (e.target !== inputRef.current) { commitText(draft); validation.onBlur(draft) }
            setOpen(false)
          }
        }}
      >
        <FieldBox size={size} invalid={!!error} disabled={disabled} controlRef={inputRef}>
          <span className={fieldStyles.icon} aria-hidden="true"><Icon name="clock" /></span>
          <input
            ref={mergeRefs(ref, inputRef)}
            id={ids.id}
            className={fieldStyles.control}
            type="text"
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            placeholder={placeholder ?? example}
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup={granular ? 'dialog' : 'listbox'}
            aria-controls={open ? panelId : undefined}
            aria-autocomplete={granular ? undefined : 'list'}
            aria-activedescendant={open && !granular && activeId ? activeId : undefined}
            aria-required={required || requirement === 'required' || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(ids, { helper: !!helperText, error: !!error }, describedByProp)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => { onClick?.(e); if (!disabled && !open) setOpen(true) }}
            {...rest}
          />
        </FieldBox>
        {open ? (
          granular ? (
            <GranularPanel
              panelRef={panelRef}
              id={panelId}
              placement={placement}
              initial={timeFromValue(value) ?? parseTime(draft, { assume }) ?? { hours: 9, minutes: 0, seconds: 0 }}
              hourCycle={hourCycle}
              presets={presetList}
              onApply={(t) => { commitValue(timeToValue(t, true)); validation.onBlur(fmt(t)); setOpen(false); inputRef.current?.focus() }}
              onCancel={() => { setOpen(false); inputRef.current?.focus() }}
            />
          ) : (
            <div
              ref={panelRef}
              className={styles.panel}
              data-placement={placement}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div role="listbox" id={panelId} aria-labelledby={ids.labelId} className={styles.list}>
                {group('presets').length ? (
                  <div role="group" aria-labelledby={presetGroupId}>
                    <div id={presetGroupId} className={styles.groupLabel}>Presets</div>
                    {group('presets').map(renderOpt)}
                  </div>
                ) : null}
                <div role="group" aria-label="Times">
                  {group('presets').length ? <div className={styles.groupLabel} aria-hidden="true">Times</div> : null}
                  {group('times').length ? group('times').map(renderOpt) : <div className={styles.empty}>No times in this range.</div>}
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>
    </FieldShell>
  )
})

/* ---- Granular H:M:S panel with an explicit Apply ---- */

interface GranularPanelProps {
  panelRef: RefObject<HTMLDivElement | null>
  id: string
  placement: 'top' | 'bottom'
  initial: TimeParts
  hourCycle: HourCycle
  presets: TimePreset[]
  onApply: (t: TimeParts) => void
  onCancel: () => void
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function GranularPanel({ panelRef, id, placement, initial, hourCycle, presets, onApply, onCancel }: GranularPanelProps) {
  const h12 = hourCycle === 'h12'
  const seed = (t: TimeParts) => ({ h: pad2(h12 ? t.hours % 12 || 12 : t.hours), m: pad2(t.minutes), s: pad2(t.seconds), pm: t.hours >= 12 })
  const [seg, setSeg] = useState(() => seed(initial))
  const read = (): TimeParts => {
    const hRaw = parseInt(normalizeDigits(seg.h), 10)
    const hh = h12 ? (clamp(Number.isNaN(hRaw) ? 12 : hRaw, 1, 12) % 12) + (seg.pm ? 12 : 0) : clamp(Number.isNaN(hRaw) ? 0 : hRaw, 0, 23)
    return { hours: hh, minutes: clamp(parseInt(seg.m, 10) || 0, 0, 59), seconds: clamp(parseInt(seg.s, 10) || 0, 0, 59) }
  }
  const apply = () => onApply(read())
  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-label="Choose a time"
      className={cx(styles.panel, styles.granular)}
      data-placement={placement}
      onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); apply() } }}
    >
      {presets.length ? (
        <div role="group" aria-label="Presets" className={styles.presetRow}>
          {presets.map((p) => {
            const t = timeFromValue(p.value)
            return (
              <button key={p.value} type="button" className={styles.presetButton} onClick={() => t && setSeg(seed(t))}>{p.label}</button>
            )
          })}
        </div>
      ) : null}
      <div className={styles.segments}>
        <Segment label="Hours" value={seg.h} min={h12 ? 1 : 0} max={h12 ? 12 : 23} onChange={(h) => setSeg((s) => ({ ...s, h }))} />
        <span className={styles.colon} aria-hidden="true">:</span>
        <Segment label="Minutes" value={seg.m} min={0} max={59} onChange={(m) => setSeg((s) => ({ ...s, m }))} />
        <span className={styles.colon} aria-hidden="true">:</span>
        <Segment label="Seconds" value={seg.s} min={0} max={59} onChange={(s) => setSeg((p) => ({ ...p, s }))} />
        {h12 ? (
          <div role="group" aria-label="AM or PM" className={styles.meridiem}>
            <button type="button" className={styles.meridiemButton} aria-pressed={!seg.pm} onClick={() => setSeg((s) => ({ ...s, pm: false }))}>AM</button>
            <button type="button" className={styles.meridiemButton} aria-pressed={seg.pm} onClick={() => setSeg((s) => ({ ...s, pm: true }))}>PM</button>
          </div>
        ) : null}
      </div>
      <div className={styles.footer}>
        <Button size="small" priority="tertiary" onClick={onCancel}>Cancel</Button>
        <Button size="small" priority="primary" onClick={apply}>Apply</Button>
      </div>
    </div>
  )
}

function Segment({ label, value, min, max, onChange }: { label: string; value: string; min: number; max: number; onChange: (v: string) => void }) {
  const n = parseInt(normalizeDigits(value), 10)
  const bump = (d: number) => {
    const cur = Number.isNaN(n) ? min : n
    const next = cur + d > max ? min : cur + d < min ? max : cur + d
    onChange(pad2(next))
  }
  return (
    <label className={styles.segment}>
      <span className={styles.segmentLabel}>{label}</span>
      <input
        className={styles.segmentInput}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number.isNaN(n) ? undefined : n}
        value={value}
        onChange={(e) => onChange(normalizeDigits(e.target.value).replace(/\D/g, '').slice(0, 2))}
        onBlur={() => onChange(pad2(clamp(Number.isNaN(n) ? min : n, min, max)))}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); bump(1) }
          else if (e.key === 'ArrowDown') { e.preventDefault(); bump(-1) }
        }}
      />
    </label>
  )
}
