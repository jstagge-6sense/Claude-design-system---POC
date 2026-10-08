import type { MutableRefObject, Ref } from 'react'
/** Merge several refs (callback or object) into one callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as MutableRefObject<T | null>).current = node
    }
  }
}
