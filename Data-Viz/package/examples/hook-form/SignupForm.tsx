// react-hook-form with 6DS fields. Validation lives in the form; the field error becomes the component's error message.
import { useForm } from 'react-hook-form'
import { Button } from '@6si/components'
import { FormInput, FormSelect, FormCheckbox } from '@6si/components/hook-form'

interface Values { name: string; email: string; role: string; terms: boolean }

const ROLES = [{ value: 'admin', label: 'Admin' }, { value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' }]

export function SignupForm({ onSubmit }: { onSubmit: (v: Values) => Promise<void> | void }) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<Values>({
    defaultValues: { name: '', email: '', role: '', terms: false },
    mode: 'onBlur',
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gap: 16, maxInlineSize: 420 }}>
      <FormInput control={control} name="name" label="Full name" requirement="required" rules={{ required: 'Enter your name.' }} />
      <FormInput
        control={control} name="email" label="Work email" type="email" requirement="required"
        helperText="We send the invite here."
        rules={{ required: 'Enter your work email.', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter an email like name@company.com.' } }}
      />
      <FormSelect control={control} name="role" label="Role" items={ROLES} requirement="required" rules={{ required: 'Choose a role.' }} />
      <FormCheckbox control={control} name="terms" label="I agree to the terms" rules={{ validate: (v) => v || 'Accept the terms to continue.' }} />
      <Button type="submit" loading={isSubmitting}>Create account</Button>
    </form>
  )
}
