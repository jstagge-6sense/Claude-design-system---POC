import { forwardRef, useCallback, useId, useRef, useState, type HTMLAttributes, type ReactNode, type RefObject } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import styles from './Field.module.css'

export type FieldSize = 'small' | 'medium'
export type FieldRequirement = 'required' | 'optional' | 'none'
export type FieldForcedState = 'hover' | 'focus'

export interface FieldIds {
  /** id of the interactive control (label htmlFor). */
  id: string
  labelId: string
  helperId: string
  errorId: string
  counterId: string
}

/** Stable ids for label, helper text, error and counter wiring. Pass your own `id` to control the input id. */
export function useFieldIds(idProp?: string): FieldIds {
  const gen = useId()
  const id = idProp ?? `field${gen}`
  return { id, labelId: `${id}-label`, helperId: `${id}-helper`, errorId: `${id}-error`, counterId: `${id}-counter` }
}

/** Build the aria-describedby value. The error replaces the helper text, so only one of them is referenced. */
export function describedBy(ids: FieldIds, o: { helper?: boolean; error?: boolean; counter?: boolean }, extra?: string): string | undefined {
  const parts = [o.error ? ids.errorId : o.helper ? ids.helperId : undefined, o.counter ? ids.counterId : undefined, extra].filter(Boolean)
  return parts.length ? parts.join(' ') : undefined
}

export interface FieldShellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> {
  ids: FieldIds
  /** Persistent visible label. Required for accessibility. */
  label: ReactNode
  /** Keep the label for assistive tech but hide it visually (e.g. search). */
  hideLabel?: boolean
  /** Render the label as a `span` when the control is not a native labelable element (slider). */
  labelAs?: 'label' | 'span'
  /** Mandatory/optional pattern: written marker after the label. Mark the minority case. */
  requirement?: FieldRequirement
  /** Content aligned to the end of the label row (e.g. live value readout). */
  labelAddon?: ReactNode
  helperText?: ReactNode
  /** Error message. Replaces the helper text and is announced politely. */
  error?: ReactNode
  /** Character counter. Announced to assistive tech only as the limit approaches. */
  counter?: { count: number; max: number }
  disabled?: boolean
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: FieldForcedState | 'pressed'
  children: ReactNode
}

/** Shared label, helper, error and counter layout for every text-entry component. */
export const FieldShell = forwardRef<HTMLDivElement, FieldShellProps>(function FieldShell(
  { ids, label, hideLabel = false, labelAs = 'label', requirement = 'none', labelAddon, helperText, error, counter, disabled, className, children, ...rest },
  ref,
) {
  const Label = labelAs
  const marker = requirement === 'required' ? '(required)' : requirement === 'optional' ? '(optional)' : null
  const labelNode = (
    <Label id={ids.labelId} className={styles.label} {...(labelAs === 'label' ? { htmlFor: ids.id } : {})}>
      {label}
      {marker ? <span className={styles.indicator}> {marker}</span> : null}
    </Label>
  )
  const remaining = counter ? counter.max - counter.count : 0
  const nearLimit = counter ? remaining <= Math.max(1, Math.ceil(counter.max * 0.1)) : false
  return (
    <div ref={ref} className={cx(styles.shell, className)} data-disabled={disabled || undefined} {...rest}>
      {hideLabel ? <VisuallyHidden>{labelNode}</VisuallyHidden> : (
        <div className={styles.labelRow}>{labelNode}{labelAddon}</div>
      )}
      {children}
      {(helperText || error || counter) ? (
        <div className={styles.below}>
          <div aria-live="polite" style={{ minInlineSize: 0, flex: '1 1 auto' }}>
            {error ? (
              <p id={ids.errorId} className={cx(styles.message, styles.error)}>
                <span className={styles.icon} aria-hidden="true"><Icon name="error" /></span>
                <span>{error}</span>
              </p>
            ) : helperText ? (
              <p id={ids.helperId} className={cx(styles.message, styles.helper)}>{helperText}</p>
            ) : null}
          </div>
          {counter ? (
            <>
              <span id={ids.counterId} className={styles.counter} data-limit={remaining <= 0 || undefined}>{counter.count}/{counter.max}</span>
              <VisuallyHidden aria-live="polite">{nearLimit ? (remaining <= 0 ? 'Character limit reached.' : `${remaining} characters remaining.`) : ''}</VisuallyHidden>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
})

export interface FieldBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: FieldSize
  invalid?: boolean
  disabled?: boolean
  readOnly?: boolean
  /** Clicking the empty part of the box focuses this control. */
  controlRef?: RefObject<HTMLElement | null>
  children: ReactNode
}

/** The bordered control surface. Carries every field state (hover, focus-within, error, read-only, disabled). */
export const FieldBox = forwardRef<HTMLDivElement, FieldBoxProps>(function FieldBox(
  { size = 'medium', invalid, disabled, readOnly, controlRef, className, children, onMouseDown, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.box, className)}
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      onMouseDown={(e) => {
        onMouseDown?.(e)
        if (e.target === e.currentTarget && controlRef?.current) { e.preventDefault(); controlRef.current.focus() }
      }}
      {...rest}
    >
      {children}
    </div>
  )
})

export interface FieldValidationOptions {
  /** Externally controlled error (server error, form-level). Wins over the internal one. */
  error?: string
  /** Runs on blur, and on change after the first error has been shown. Return a message, or undefined when valid. */
  validate?: (value: string) => string | undefined
  required?: boolean
  requiredMessage?: string
}

/**
 * Validation timing per the cross-cutting spec: validate on blur, never while the user is typing,
 * never for an untouched field; after the first error is shown, switch to on-change so it clears when fixed.
 */
export function useFieldValidation({ error, validate, required, requiredMessage = 'Enter a value to continue.' }: FieldValidationOptions) {
  const [internal, setInternal] = useState<string | undefined>(undefined)
  const shown = useRef(false)
  const run = useCallback((v: string) => (required && v.trim() === '' ? requiredMessage : validate?.(v)), [required, requiredMessage, validate])
  const onBlur = useCallback((v: string) => { const e = run(v); setInternal(e); if (e) shown.current = true; return e }, [run])
  const onChange = useCallback((v: string) => { if (shown.current) setInternal(run(v)) }, [run])
  return { error: error ?? internal, onBlur, onChange }
}
