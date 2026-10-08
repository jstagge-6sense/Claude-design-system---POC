import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form'
import { Input, type InputProps } from '../components/Input'
import { NumberInput, type NumberInputProps } from '../components/NumberInput'
import { Select, type SelectProps } from '../components/Select'
import { Checkbox, type CheckboxProps } from '../components/Checkbox'

/**
 * react-hook-form bindings for 6DS fields.
 * - Pass `control` or render inside <FormProvider>.
 * - The field error from react-hook-form becomes the component's `error` message, so validation text, aria-invalid and
 *   aria-describedby come from the component, not from app code.
 * - Validation lives in the form (rules or a resolver such as zod). Do not also pass `validate` to the component.
 */
interface Bound<T extends FieldValues, N extends FieldPath<T>> {
  name: N
  control?: Control<T>
  rules?: Omit<RegisterOptions<T, N>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
}

export type FormInputProps<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> =
  Bound<T, N> & Omit<InputProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onChange' | 'error' | 'validate'>

export function FormInput<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({ name, control, rules, onBlur, ...rest }: FormInputProps<T, N>) {
  return (
    <Controller
      name={name} control={control} rules={rules}
      render={({ field, fieldState }) => (
        <Input
          {...rest}
          ref={field.ref}
          name={field.name}
          value={field.value ?? ''}
          onValueChange={field.onChange}
          onBlur={(e) => { field.onBlur(); onBlur?.(e) }}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}

export type FormNumberInputProps<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> =
  Bound<T, N> & Omit<NumberInputProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onChange' | 'error' | 'validate'>

export function FormNumberInput<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({ name, control, rules, onBlur, ...rest }: FormNumberInputProps<T, N>) {
  return (
    <Controller
      name={name} control={control} rules={rules}
      render={({ field, fieldState }) => (
        <NumberInput
          {...rest}
          ref={field.ref}
          name={field.name}
          value={(field.value ?? null) as number | null}
          onValueChange={field.onChange}
          onBlur={(e) => { field.onBlur(); onBlur?.(e) }}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}

export type FormSelectProps<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> =
  Bound<T, N> & Omit<SelectProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'error'>

export function FormSelect<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({ name, control, rules, ...rest }: FormSelectProps<T, N>) {
  return (
    <Controller
      name={name} control={control} rules={rules}
      render={({ field, fieldState }) => (
        <Select {...rest} name={field.name} value={field.value ?? ''} onValueChange={field.onChange} error={fieldState.error?.message} />
      )}
    />
  )
}

export type FormCheckboxProps<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>> =
  Bound<T, N> & Omit<CheckboxProps, 'name' | 'checked' | 'defaultChecked' | 'onChange' | 'error' | 'errorMessage'>

export function FormCheckbox<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({ name, control, rules, onBlur, ...rest }: FormCheckboxProps<T, N>) {
  return (
    <Controller
      name={name} control={control} rules={rules}
      render={({ field, fieldState }) => (
        <Checkbox
          {...rest}
          ref={field.ref}
          name={field.name}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={(e) => { field.onBlur(); onBlur?.(e) }}
          error={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  )
}
