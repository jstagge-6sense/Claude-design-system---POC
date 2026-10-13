import type { SVGAttributes } from 'react'
import { ICON_PATHS, type IconName } from './paths'

/** Icons that point in a reading direction and should mirror in RTL. */
const MIRROR = new Set<IconName>(['chevronLeft', 'chevronRight', 'chevronsLeft', 'chevronsRight', 'arrowLeft', 'arrowRight', 'panelLeft', 'panelRight', 'indent', 'externalLink', 'trendUp', 'trendDown'])

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'name'> {
  name: IconName
  /** Accessible name. Omit for decorative icons (they get aria-hidden). */
  label?: string
  /** CSS size. Defaults to the icon size token (core.dimension.size.icon). */
  size?: string | number
}

export function Icon({ name, label, size, style, className, ...rest }: IconProps) {
  const dim = typeof size === 'number' ? `${size}px` : size ?? 'var(--core-dimension-size-icon)'
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={dim}
      height={dim}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-icon={name}
      data-mirror={MIRROR.has(name) ? 'true' : undefined}
      className={className}
      style={{ flex: 'none', ...style }}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
      {...rest}
    />
  )
}
export type { IconName }
export { ICON_PATHS }
