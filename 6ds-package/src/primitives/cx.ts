export type ClassValue = string | false | null | undefined
/** Join class names, skipping falsy values. */
export const cx = (...v: ClassValue[]): string => v.filter(Boolean).join(' ')
