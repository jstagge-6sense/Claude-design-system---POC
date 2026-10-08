import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'
import type { FieldRequirement } from '../Input/Field'

export type FormValues = Record<string, string>
export type FormStatus = 'default' | 'validating' | 'error' | 'submitting' | 'success'

/** Return a message when the value is invalid, or undefined when it is valid. May be async (username uniqueness, for example). */
export type FieldValidator<V extends FormValues = FormValues> = (value: string, values: V) => string | undefined | Promise<string | undefined>

export interface UnsavedChangesRequest {
  /** Leave anyway: discard the changes and continue the navigation. */
  proceed: () => void
  /** Stay on the form. */
  stay: () => void
}

export interface UseFormGroupOptions<V extends FormValues> {
  initialValues: V
  /** Per-field validators. They run on blur, then on change once an error has been shown for that field, and on submit. */
  validators?: Partial<{ [K in keyof V]: FieldValidator<V> }>
  /** Required fields. An empty value gives the required message. */
  required?: Array<Extract<keyof V, string>>
  /** Visible names, used in messages and in the summary links. Falls back to the field name. */
  labels?: Partial<Record<Extract<keyof V, string>, string>>
  onSubmit?: (values: V) => void | Promise<void>
  /** Called when dirty form is about to be left. Show an accessible dialog and call proceed or stay. Never use window.confirm. */
  onUnsavedChanges?: (request: UnsavedChangesRequest) => void
  /** Ask the browser to confirm closing or reloading the tab while the form is dirty. Default true. */
  warnOnUnload?: boolean
  /** Prefix for generated field ids. */
  idPrefix?: string
  /** Seed an initial state for docs and previews. Do not use in product code. */
  previewState?: { status?: FormStatus; errors?: Record<string, string>; submitError?: string; values?: FormValues }
}

export interface FormFieldProps {
  id: string
  name: string
  value: string
  onValueChange: (value: string) => void
  onBlur: () => void
  error: string | undefined
  /** Written marker for the minority case only: "(optional)" when most fields are required, "(required)" when most are optional. */
  requirement: FieldRequirement
  /** Announced as required. Set this instead of the `required` prop so the field's own validation does not run next to the form's. */
  'aria-required': true | undefined
}

export interface FormSummaryItem {
  name: string
  id: string
  label: string
  message: string
}

export interface FormGroupApi {
  values: FormValues
  errors: Record<string, string | undefined>
  status: FormStatus
  /** Values differ from the last saved values. */
  dirty: boolean
  /** A submit has been attempted. */
  submitted: boolean
  /** Failure that is not tied to a field (for example a server error). */
  submitError: string | undefined
  summary: FormSummaryItem[]
  fieldNames: string[]
  fieldCount: number
  formRef: RefObject<HTMLFormElement>
  getFieldProps(name: string): FormFieldProps
  setValue(name: string, value: string): void
  /** Validate some fields (or all). Marks them as shown, sets the status, and focuses the first invalid field. Resolves true when valid. */
  validateFields(names?: string[]): Promise<boolean>
  handleSubmit(event?: FormEvent): Promise<void>
  focusField(name: string): void
  reset(): void
  /** Treat the current values as saved (clears dirty). */
  markSaved(): void
  /** Run `proceed` now, or ask first through `onUnsavedChanges` when the form is dirty. */
  requestLeave(proceed: () => void): void
}

const eq = (a: FormValues, b: FormValues) => Object.keys({ ...a, ...b }).every((k) => (a[k] ?? '') === (b[k] ?? ''))

/**
 * Form orchestration: values, validation timing, submit flow, summary data and dirty tracking.
 * Timing (cross-cutting spec): validate on blur, never an untouched field, after the first error switch that
 * field to on-change so it clears as soon as it is fixed, never clear an error that is not fixed, and validate
 * everything on submit, then focus the first invalid field.
 */
export function useFormGroup<V extends FormValues>(options: UseFormGroupOptions<V>): FormGroupApi {
  const { initialValues, validators, required = [], labels, onSubmit, onUnsavedChanges, warnOnUnload = true, idPrefix, previewState } = options
  const baseId = useId()
  const prefix = idPrefix ?? `fg${baseId.replace(/:/g, '')}`
  const names = useMemo(() => Object.keys(initialValues), [initialValues])
  const requiredSet = useMemo(() => new Set<string>(required), [required])

  const [baseline, setBaseline] = useState<FormValues>(initialValues)
  const [values, setValues] = useState<FormValues>(previewState?.values ?? initialValues)
  const [errors, setErrors] = useState<Record<string, string | undefined>>(() => ({ ...(previewState?.errors ?? {}) }))
  const [status, setStatus] = useState<FormStatus>(previewState?.status ?? 'default')
  const [submitError, setSubmitError] = useState<string | undefined>(previewState?.submitError)
  const [submitted, setSubmitted] = useState(!!previewState?.status && previewState.status !== 'default')
  const [focusTick, setFocusTick] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const shown = useRef(new Set<string>(Object.keys(previewState?.errors ?? {})))
  const valuesRef = useRef(values)
  valuesRef.current = values
  const busy = useRef(false)
  const versions = useRef<Record<string, number>>({})

  const labelOf = (n: string) => (labels as Record<string, string | undefined> | undefined)?.[n] ?? n
  // Synchronous when it can be, so a plain required or format error shows on the same blur. Async validators return a promise.
  const run = useCallback((name: string, value: string, all: FormValues): string | undefined | Promise<string | undefined> => {
    if (requiredSet.has(name) && value.trim() === '') return `${(labels as Record<string, string | undefined> | undefined)?.[name] ?? name} is required. Enter a value to continue.`
    const v = (validators as Record<string, FieldValidator<FormValues> | undefined> | undefined)?.[name]
    return v ? v(value, all) : undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredSet, validators, labels])

  const setError = (name: string, message: string | undefined) => {
    if (message) shown.current.add(name)
    setErrors((prev) => {
      if (!message) { if (!(name in prev)) return prev; const next = { ...prev }; delete next[name]; return next }
      return prev[name] === message ? prev : { ...prev, [name]: message }
    })
  }
  const check = (name: string, value: string, all: FormValues) => {
    const ver = (versions.current[name] = (versions.current[name] ?? 0) + 1)
    const out = run(name, value, all)
    if (out instanceof Promise) {
      // Ignore a slow answer for a value the person has already changed.
      void out.then((message) => { if (versions.current[name] === ver) setError(name, message) })
    } else setError(name, out)
  }

  const setValue = (name: string, value: string) => {
    const next = { ...valuesRef.current, [name]: value }
    valuesRef.current = next
    setValues(next)
    if (status === 'success') setStatus('default')
    // After the first error is shown, that field validates while typing, so the error clears when fixed.
    if (shown.current.has(name)) check(name, value, next)
  }
  const blur = (name: string) => { check(name, valuesRef.current[name] ?? '', valuesRef.current) }

  const focusField = (name: string) => {
    const el = document.getElementById(`${prefix}-${name}`)
    if (!el) return
    el.focus()
    el.scrollIntoView?.({ block: 'center' })
  }

  const validateFields = async (list?: string[]) => {
    const target = list ?? names
    setStatus('validating')
    setSubmitted(true)
    const all = valuesRef.current
    const results = await Promise.all(target.map(async (n) => [n, await Promise.resolve(run(n, all[n] ?? '', all))] as const))
    setErrors((prev) => {
      const next = { ...prev }
      for (const [n, m] of results) { if (m) { next[n] = m; shown.current.add(n) } else delete next[n] }
      return next
    })
    const ok = results.every(([, m]) => !m)
    setStatus(ok ? 'default' : 'error')
    if (!ok) setFocusTick((t) => t + 1)
    return ok
  }

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault()
    // Double-submit prevention: ignore while a submit or validation is already running.
    if (busy.current) return
    busy.current = true
    try {
      setSubmitError(undefined)
      if (!(await validateFields())) return
      setStatus('submitting')
      try {
        await onSubmit?.(valuesRef.current as V)
        setBaseline(valuesRef.current)
        setStatus('success')
      } catch (err) {
        setSubmitError(err instanceof Error && err.message ? err.message : "We couldn't save your changes. Check your connection and try again.")
        setStatus('error')
      }
    } finally {
      busy.current = false
    }
  }

  // Focus the first invalid field once the errors have rendered.
  useEffect(() => {
    if (!focusTick) return
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    el?.focus()
    el?.scrollIntoView?.({ block: 'center' })
  }, [focusTick])

  // The error state ends when the last error is fixed.
  const errorCount = Object.values(errors).filter(Boolean).length
  useEffect(() => {
    if (status === 'error' && errorCount === 0 && !submitError) setStatus('default')
  }, [status, errorCount, submitError])

  const dirty = !eq(values, baseline)

  // Browser-level guard for closing or reloading the tab. The accessible in-app guard is requestLeave.
  useEffect(() => {
    if (!dirty || !warnOnUnload || typeof window === 'undefined') return
    const on = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', on)
    return () => window.removeEventListener('beforeunload', on)
  }, [dirty, warnOnUnload])

  const requestLeave = (proceed: () => void) => {
    if (!dirty) { proceed(); return }
    if (onUnsavedChanges) onUnsavedChanges({ proceed, stay: () => undefined })
    else {
      if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') console.warn('useFormGroup: the form has unsaved changes but no onUnsavedChanges handler. Leaving without a warning.')
      proceed()
    }
  }

  const mostlyRequired = requiredSet.size >= names.length - requiredSet.size
  const getFieldProps = (name: string): FormFieldProps => {
    const isRequired = requiredSet.has(name)
    // Consistent marking: write the minority case only.
    const requirement: FieldRequirement = mostlyRequired ? (isRequired ? 'none' : 'optional') : (isRequired ? 'required' : 'none')
    return {
      id: `${prefix}-${name}`,
      name,
      value: values[name] ?? '',
      onValueChange: (v) => setValue(name, v),
      onBlur: () => blur(name),
      error: errors[name],
      requirement,
      'aria-required': isRequired ? true : undefined,
    }
  }

  const summary: FormSummaryItem[] = names
    .filter((n) => errors[n])
    .map((n) => ({ name: n, id: `${prefix}-${n}`, label: labelOf(n), message: errors[n] as string }))

  const reset = () => {
    setValues(baseline)
    valuesRef.current = baseline
    setErrors({})
    shown.current.clear()
    setStatus('default')
    setSubmitError(undefined)
    setSubmitted(false)
  }

  return {
    values, errors, status, dirty, submitted, submitError, summary, fieldNames: names, fieldCount: names.length, formRef,
    getFieldProps, setValue, validateFields, handleSubmit, focusField, reset, markSaved: () => setBaseline(valuesRef.current), requestLeave,
  }
}
