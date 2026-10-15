import type { ReactNode } from 'react'
import { GuidelinesContent } from '../preview/GuidelinesContent'

interface Story { args?: Record<string, unknown>; render?: (args: Record<string, unknown>, ctx: unknown) => ReactNode }
interface Meta { component?: (p: Record<string, unknown>) => ReactNode; args?: Record<string, unknown>; render?: Story['render'] }

/** Full width regardless of any width limit a component's own story decorator sets (some set 36rem): the page sizes itself from the viewport, not its parent.
 *  Storybook page for one component's guidelines. `mod` is the component's own stories module, used to draw the live anatomy diagram. */
export function GuidelinesStory({ folder, mod }: { folder: string; mod: Record<string, unknown> }) {
  const meta = (mod.default || {}) as Meta
  const keys = Object.keys(mod).filter((k) => k !== 'default' && k !== 'Guidelines' && !k.startsWith('__'))
  const renderPreview = (key?: string): ReactNode => {
    const k = key && keys.includes(key) ? key : keys[0]
    if (!k) return null
    const raw = mod[k] as Story | ((a: Record<string, unknown>, c: unknown) => ReactNode)
    const st: Story = typeof raw === 'function' ? { render: raw } : raw
    const args = { ...(meta.args || {}), ...(st.args || {}) }
    const render = st.render || meta.render
    const C = meta.component
    return render ? render(args, {}) : C ? <C {...args} /> : null
  }
  return <div style={{ maxInlineSize: 'none', inlineSize: 'min(1400px, calc(100vw - 3rem))', boxSizing: 'border-box', padding: 'clamp(var(--core-dimension-space-standard), 4vw, 32px) clamp(var(--core-dimension-space-comfortable), 3vw, var(--core-dimension-space-spacious))', minInlineSize: 0 }}><GuidelinesContent folder={folder} renderPreview={renderPreview} /></div>
}
