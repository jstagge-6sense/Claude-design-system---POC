import { forwardRef, useState, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from 'react'
import { cx } from '../../primitives/cx'
import { Icon } from '../../icons'
import styles from './Avatar.module.css'

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick'> {
  /** Person's full name. Used for the accessible name and to derive initials. Avatars are for people, not companies or accounts. */
  name: string
  /** Photo URL. Falls back to initials, then to the placeholder, if it fails to load. */
  src?: string
  /** Override the derived initials (one or two characters). */
  initials?: string
  /** Force the generic person placeholder. Prefer initials whenever a name is known. */
  placeholder?: boolean
  size?: 'small' | 'medium' | 'large' | 'xl'
  status?: AvatarStatus
  /** Makes the avatar a button, for example a profile menu trigger. Set `aria-haspopup` and `aria-expanded` on it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void
  /** Optional slot rendered on top of the avatar, for example a custom badge. */
  children?: ReactNode
  /** Force a visual state for docs and previews. Interactive avatars only. */
  'data-state'?: 'hover' | 'pressed' | 'focus'
}

const STATUS_LABEL: Record<AvatarStatus, string> = { online: 'Online', offline: 'Offline', busy: 'Busy', away: 'Away' }

/** First letter of the first and last word. One word gives one letter. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export const Avatar = forwardRef<HTMLElement, AvatarProps>(function Avatar(
  { name, src, initials, placeholder = false, size = 'medium', status, onClick, className, children, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false)
  const text = (initials ?? getInitials(name)).slice(0, 2).toUpperCase()
  const kind = src && !failed && !placeholder ? 'image' : text && !placeholder ? 'initials' : 'placeholder'
  const interactive = typeof onClick === 'function'
  const accessibleName = status ? `${name}, ${STATUS_LABEL[status]}` : name

  const content = (
    <>
      {kind === 'image' ? <img className={styles.image} src={src} alt="" onError={() => setFailed(true)} /> : null}
      {kind === 'initials' ? <span className={styles.initials} aria-hidden="true">{text}</span> : null}
      {kind === 'placeholder' ? <span className={styles.placeholderIcon} aria-hidden="true"><Icon name="user" /></span> : null}
      {status ? <span className={styles.status} data-status={status} aria-hidden="true" /> : null}
      {children}
    </>
  )
  const common = { className: cx(styles.root, className), 'data-size': size, 'data-kind': kind }
  if (interactive) {
    return (
      <button ref={ref as Ref<HTMLButtonElement>} type="button" aria-label={accessibleName} onClick={onClick} {...common} {...(rest as HTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    )
  }
  return (
    <span ref={ref as Ref<HTMLSpanElement>} role="img" aria-label={accessibleName} {...common} {...rest}>
      {content}
    </span>
  )
})
