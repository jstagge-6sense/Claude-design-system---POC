import { forwardRef, useId, type FormHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx } from '../../primitives/cx'
import { mergeRefs } from '../../primitives/mergeRefs'
import { useControllableState } from '../../primitives/useControllableState'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { ProgressSteps, type ProgressStep } from '../ProgressSteps'
import type { FormGroupApi } from './useFormGroup'
import styles from './FormGroup.module.css'

/* ---------------- FormSection: a fieldset with a legend ---------------- */

export interface FormSectionProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'title'> {
  /** Section heading. Rendered as the fieldset legend so assistive tech announces it with each field. */
  legend: string
  description?: ReactNode
  children?: ReactNode
}

export const FormSection = forwardRef<HTMLFieldSetElement, FormSectionProps>(function FormSection({ legend, description, className, children, ...rest }, ref) {
  const descId = useId()
  return (
    <fieldset ref={ref} className={cx(styles.section, className)} aria-describedby={description ? descId : undefined} {...rest}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.sectionBody}>
        {description ? <p id={descId} className={styles.sectionDescription}>{description}</p> : null}
        {children}
      </div>
    </fieldset>
  )
})

/* ---------------- FormRow: paired fields only ---------------- */

export interface FormRowProps extends HTMLAttributes<HTMLDivElement> {
  /** Exactly two related fields (first and last name, city and state). Never use for unrelated fields. */
  children: [ReactNode, ReactNode]
}

export const FormRow = forwardRef<HTMLDivElement, FormRowProps>(function FormRow({ className, children, ...rest }, ref) {
  return <div ref={ref} className={cx(styles.row, className)} {...rest}>{children}</div>
})

/* ---------------- FormGroup ---------------- */

export interface FormGroupProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> {
  /** The state and handlers from `useFormGroup`. */
  form: FormGroupApi
  /** Accessible name of the form. Required. */
  'aria-label': string
  /** single: one column. multiSection: fieldsets with headers. inline: settings rows in page content. wizard: multi-step with progress steps. */
  variant?: 'single' | 'multiSection' | 'inline' | 'wizard'
  children?: ReactNode | ((context: { step: number }) => ReactNode)
  submitLabel?: string
  /** Shows a Cancel button. */
  onCancel?: () => void
  cancelLabel?: string
  /** Footer buttons line up with the start edge or the end edge. Pick one for the whole product. Default start (proposal: the open question in the requirements). */
  footerAlign?: 'start' | 'end'
  /** Validation summary at the top after a failed submit. auto shows it for forms with 5 or more fields (required), always and never override. */
  summary?: 'auto' | 'always' | 'never'
  /** Confirmation shown on success. */
  successMessage?: string
  unsavedLabel?: string
  /** Wizard: the steps. Each step shows the matching children. */
  steps?: ProgressStep[]
  step?: number
  defaultStep?: number
  onStepChange?: (step: number) => void
  /** Wizard: field names validated before leaving each step (index-aligned with `steps`). */
  stepFields?: string[][]
  backLabel?: string
  nextLabel?: string
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export const FormGroup = forwardRef<HTMLFormElement, FormGroupProps>(function FormGroup(
  {
    form, variant = 'single', children, submitLabel = 'Save changes', onCancel, cancelLabel = 'Cancel', footerAlign = 'start', summary: summaryMode = 'auto', successMessage = 'Changes saved.',
    unsavedLabel = 'Unsaved changes', steps, step: stepProp, defaultStep = 0, onStepChange, stepFields, backLabel = 'Back', nextLabel = 'Next', className, ...rest
  },
  ref,
) {
  const [step, setStep] = useControllableState<number>(stepProp, defaultStep, onStepChange)
  const summaryId = useId()
  const wizard = variant === 'wizard' && !!steps?.length
  const last = wizard ? step >= (steps?.length ?? 1) - 1 : true
  const { status } = form
  const submitting = status === 'submitting'
  const checking = status === 'validating'
  const locked = submitting

  const needsSummary = summaryMode === 'always' || (summaryMode === 'auto' && form.fieldCount >= 5)
  if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production' && summaryMode === 'never' && form.fieldCount >= 5) {
    console.warn('FormGroup: forms with 5 or more fields need a validation summary. Do not set summary="never".')
  }
  const showSummary = status === 'error' && ((needsSummary && form.summary.length > 0) || !!form.submitError)
  const n = form.summary.length

  const goNext = async (e: MouseEvent) => {
    e.preventDefault()
    const ok = await form.validateFields(stepFields?.[step])
    if (ok) setStep(step + 1)
  }

  const content = typeof children === 'function' ? children({ step }) : children

  const footer = (
    <div className={styles.footer} data-align={footerAlign}>
      <div className={styles.buttons}>
        {wizard ? (
          <>
            {last
              ? <Button type="submit" priority="primary" loading={submitting || checking}>{submitLabel}</Button>
              : <Button type="button" priority="primary" loading={checking} onClick={goNext}>{nextLabel}</Button>}
            <Button type="button" priority="secondary" disabled={step === 0 || submitting} onClick={() => setStep(step - 1)}>{backLabel}</Button>
          </>
        ) : (
          <Button type="submit" priority="primary" loading={submitting || checking}>{submitLabel}</Button>
        )}
        {onCancel ? <Button type="button" priority="tertiary" disabled={submitting} onClick={onCancel}>{cancelLabel}</Button> : null}
      </div>
      <p className={styles.status} role="status" aria-live="polite" data-status={status === 'default' && form.dirty ? 'dirty' : status}>
        {submitting ? (<><span className={styles.statusIcon} aria-hidden="true"><Icon name="clock" /></span>Saving…</>) : null}
        {checking ? (<><span className={styles.statusIcon} aria-hidden="true"><Icon name="clock" /></span>Checking your entries…</>) : null}
        {status === 'success' ? (<><span className={styles.statusIcon} aria-hidden="true"><Icon name="success" /></span>{successMessage}</>) : null}
        {status === 'default' && form.dirty ? (<><span className={styles.statusIcon} aria-hidden="true"><Icon name="edit" /></span>{unsavedLabel}</>) : null}
      </p>
    </div>
  )

  return (
    <form
      ref={mergeRefs(ref, form.formRef)}
      className={cx(styles.root, className)}
      data-variant={variant}
      data-status={status}
      data-dirty={form.dirty || undefined}
      noValidate
      aria-busy={submitting || checking || undefined}
      onSubmit={form.handleSubmit}
      {...rest}
    >
      {wizard ? (
        <div className={styles.wizardSteps}>
          <ProgressSteps steps={steps ?? []} current={step} onCurrentChange={setStep} aria-label={`${rest['aria-label']} progress`} />
        </div>
      ) : null}
      {showSummary ? (
        <div id={summaryId} role="alert" className={styles.summary}>
          <p className={styles.summaryTitle}>
            <span className={styles.summaryIcon} aria-hidden="true"><Icon name="error" /></span>
            {n > 0
              ? `Fix ${n} ${plural(n, 'field', 'fields')} to continue`
              : 'We couldn\'t save your changes'}
          </p>
          {form.submitError ? <p className={styles.summaryText}>{form.submitError}</p> : null}
          {n > 0 ? (
            <ul className={styles.summaryList} role="list">
              {form.summary.map((item) => (
                <li key={item.name}>
                  <a
                    className={styles.summaryLink}
                    href={`#${item.id}`}
                    onClick={(e) => { e.preventDefault(); form.focusField(item.name) }}
                  >
                    {item.message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {/* Locking while submitting: fields and section controls are disabled, the footer stays readable. */}
      <fieldset className={styles.lock} disabled={locked}>
        <div className={styles.content}>{content}</div>
      </fieldset>
      {footer}
    </form>
  )
})
