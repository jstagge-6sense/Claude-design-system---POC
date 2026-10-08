import type { HTMLAttributes } from 'react'
/** Content available to assistive tech only. */
export function VisuallyHidden({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={['ds-visually-hidden', className].filter(Boolean).join(' ')} {...rest} />
}
