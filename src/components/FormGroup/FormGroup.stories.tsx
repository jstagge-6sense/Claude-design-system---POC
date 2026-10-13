import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormGroup, FormRow, FormSection } from './FormGroup'
import { useFormGroup, type FormGroupApi, type FormStatus } from './useFormGroup'
import { Input } from '../Input'
import { TextArea } from '../TextArea'
import { Button } from '../Button'
import type { ProgressStep } from '../ProgressSteps'

const meta = {
  title: 'Patterns/FormGroup',
  component: FormGroup,
  parameters: {
    tier: 1,
    group: 'Patterns',
    description: 'Orchestration layer above the fields: form element, sections, validation timing, summary after a failed submit, submit states and unsaved-changes warning. Pair fields only in two columns.',
  },
  args: { 'aria-label': 'Example form', form: {} as FormGroupApi },
} satisfies Meta<typeof FormGroup>
export default meta
type Story = StoryObj<typeof meta>

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const email = (v: string) => (v && !/^\S+@\S+\.\S+$/.test(v) ? 'Enter an email address like name@company.com.' : undefined)

/* ---- Single section ---- */
function SingleForm({ preview }: { preview?: { status?: FormStatus; errors?: Record<string, string>; submitError?: string; values?: Record<string, string> } }) {
  const form = useFormGroup({
    initialValues: { name: 'Priya Raman', email: 'priya@example.com', notes: '' },
    required: ['name', 'email'],
    labels: { name: 'Full name', email: 'Work email' },
    validators: { email: (v) => email(v) },
    onSubmit: () => wait(900),
    previewState: preview,
  })
  return (
    <FormGroup form={form} aria-label="Contact details" submitLabel="Save contact" onCancel={() => undefined} successMessage="Contact saved.">
      <Input label="Full name" {...form.getFieldProps('name')} />
      <Input label="Work email" type="email" helperText="We send account notices here." {...form.getFieldProps('email')} />
      <TextArea label="Notes" rows={3} {...form.getFieldProps('notes')} />
    </FormGroup>
  )
}
export const SingleSection: Story = { name: 'Single section', render: () => <div style={{ maxInlineSize: '32rem' }}><SingleForm /></div> }

/* ---- Multi-section, 6 fields: the validation summary is required ---- */
function MultiForm({ preview }: { preview?: { status?: FormStatus; errors?: Record<string, string> } }) {
  const form = useFormGroup({
    initialValues: { first: '', last: '', email: '', company: '', city: '', state: '', phone: '' },
    required: ['first', 'last', 'email', 'company', 'city', 'state'],
    labels: { first: 'First name', last: 'Last name', email: 'Work email', company: 'Company', city: 'City', state: 'State', phone: 'Phone' },
    validators: { email: (v) => email(v) },
    onSubmit: () => wait(900),
    previewState: preview,
  })
  const p = form.getFieldProps
  return (
    <FormGroup form={form} aria-label="Account setup" variant="multiSection" submitLabel="Create account">
      <FormSection legend="About you" description="Paired fields share a row. Everything else stays in one column.">
        <FormRow>
          <Input label="First name" {...p('first')} />
          <Input label="Last name" {...p('last')} />
        </FormRow>
        <Input label="Work email" type="email" {...p('email')} />
        <Input label="Phone" type="tel" {...p('phone')} />
      </FormSection>
      <FormSection legend="Company">
        <Input label="Company" {...p('company')} />
        <FormRow>
          <Input label="City" {...p('city')} />
          <Input label="State" {...p('state')} />
        </FormRow>
      </FormSection>
    </FormGroup>
  )
}
/** Submit empty: the summary appears at the top with a link per problem, and focus moves to the first invalid field. Six fields, so the summary is required. */
export const MultiSection: Story = { name: 'Multi-section (summary after failed submit)', render: () => <div style={{ maxInlineSize: '36rem' }}><MultiForm /></div> }

export const WithSummaryShown: Story = {
  name: 'Error (summary visible)',
  render: () => (
    <div style={{ maxInlineSize: '36rem' }}>
      <MultiForm preview={{ status: 'error', errors: { first: 'First name is required. Enter a value to continue.', email: 'Enter an email address like name@company.com.', city: 'City is required. Enter a value to continue.' } }} />
    </div>
  ),
}

/* ---- Inline ---- */
function InlineForm() {
  const form = useFormGroup({ initialValues: { display: 'Priya R.', timezone: 'Pacific Time' }, required: ['display'], labels: { display: 'Display name' }, onSubmit: () => wait(600) })
  return (
    <FormGroup form={form} aria-label="Profile settings" variant="inline" submitLabel="Save settings">
      <Input label="Display name" {...form.getFieldProps('display')} />
      <Input label="Time zone" {...form.getFieldProps('timezone')} />
    </FormGroup>
  )
}
export const Inline: Story = { render: () => <div style={{ maxInlineSize: '32rem' }}><InlineForm /></div> }

/* ---- Wizard ---- */
const STEPS: ProgressStep[] = [{ id: 'account', label: 'Account' }, { id: 'workspace', label: 'Workspace' }, { id: 'review', label: 'Review' }]
function WizardForm() {
  const form = useFormGroup({
    initialValues: { name: '', email: '', workspace: '', region: '' },
    required: ['name', 'email', 'workspace'],
    labels: { name: 'Full name', email: 'Work email', workspace: 'Workspace name', region: 'Region' },
    validators: { email: (v) => email(v) },
    onSubmit: () => wait(900),
  })
  const p = form.getFieldProps
  return (
    <FormGroup
      form={form}
      aria-label="Create workspace"
      variant="wizard"
      steps={STEPS}
      stepFields={[['name', 'email'], ['workspace', 'region'], []]}
      submitLabel="Create workspace"
      successMessage="Workspace created."
    >
      {({ step }) => (
        <>
          {step === 0 ? (<><Input label="Full name" {...p('name')} /><Input label="Work email" type="email" {...p('email')} /></>) : null}
          {step === 1 ? (<><Input label="Workspace name" {...p('workspace')} /><Input label="Region" {...p('region')} /></>) : null}
          {step === 2 ? (
            <dl style={{ margin: 0 }}>
              <dt>Name</dt><dd>{form.values.name}</dd>
              <dt>Email</dt><dd>{form.values.email}</dd>
              <dt>Workspace</dt><dd>{form.values.workspace}</dd>
            </dl>
          ) : null}
        </>
      )}
    </FormGroup>
  )
}
export const Wizard: Story = { render: () => <div style={{ maxInlineSize: '40rem' }}><WizardForm /></div> }

/* ---- States (forced) ---- */
const STATES: Array<{ title: string; preview: { status?: FormStatus; errors?: Record<string, string>; values?: Record<string, string>; submitError?: string } }> = [
  { title: 'Default', preview: {} },
  { title: 'Dirty (unsaved changes)', preview: { values: { name: 'Priya Raman', email: 'priya@example.com', notes: 'Edited note' } } },
  { title: 'Validating', preview: { status: 'validating' } },
  { title: 'Error (inline)', preview: { status: 'error', errors: { email: 'Enter an email address like name@company.com.' } } },
  { title: 'Submitting (form locked)', preview: { status: 'submitting' } },
  { title: 'Success', preview: { status: 'success' } },
  { title: 'Server error', preview: { status: 'error', submitError: "We couldn't save your changes. Check your connection and try again." } },
]
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))', gap: 32 }}>
      {STATES.map((s) => (
        <div key={s.title}>
          <h3 style={{ marginBlockStart: 0 }}>{s.title}</h3>
          <SingleForm preview={s.preview} />
        </div>
      ))}
    </div>
  ),
}

/* ---- Unsaved changes: an accessible confirmation, never window.confirm ---- */
function UnsavedDemo() {
  const [request, setRequest] = useState<{ proceed: () => void; stay: () => void } | null>(null)
  const [page, setPage] = useState('Form')
  const form = useFormGroup({
    initialValues: { name: 'Priya Raman', email: 'priya@example.com', notes: '' },
    required: ['name', 'email'],
    onUnsavedChanges: (r) => setRequest(r),
  })
  const leave = () => form.requestLeave(() => { setPage('Another page'); form.reset() })
  return (
    <div style={{ display: 'grid', gap: 16, maxInlineSize: '32rem' }}>
      <p style={{ margin: 0 }}>Current page: <strong>{page}</strong>. Edit a field, then choose Leave this page.</p>
      <FormGroup form={form} aria-label="Contact details">
        <Input label="Full name" {...form.getFieldProps('name')} />
        <Input label="Work email" {...form.getFieldProps('email')} />
      </FormGroup>
      <div><Button priority="secondary" onClick={leave}>Leave this page</Button></div>
      {request ? (
        <div role="alertdialog" aria-labelledby="unsaved-title" aria-describedby="unsaved-body" style={{ border: '1px solid currentColor', padding: 16 }}>
          <h3 id="unsaved-title" style={{ marginBlockStart: 0 }}>Leave without saving?</h3>
          <p id="unsaved-body">Your changes to this contact will be lost.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button priority="destructive" onClick={() => { request.proceed(); setRequest(null) }}>Discard changes</Button>
            <Button priority="secondary" autoFocus onClick={() => { request.stay(); setRequest(null) }}>Keep editing</Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
export const UnsavedChanges: Story = { name: 'Unsaved changes warning', render: () => <UnsavedDemo /> }

export const FooterAlignEnd: Story = {
  name: 'Footer aligned to end (RTL)',
  render: () => (
    <div style={{ maxInlineSize: '32rem' }} dir="rtl">
      <RtlForm />
    </div>
  ),
}
function RtlForm() {
  const form = useFormGroup({ initialValues: { name: 'Priya Raman' }, required: ['name'], onSubmit: () => wait(300) })
  return (
    <FormGroup form={form} aria-label="Contact details" footerAlign="end" onCancel={() => undefined}>
      <Input label="Full name" {...form.getFieldProps('name')} />
    </FormGroup>
  )
}
