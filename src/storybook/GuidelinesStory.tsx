import type { ReactNode } from 'react'
import { GuidelinesContent } from '../preview/GuidelinesContent'

interface Story { args?: Record<string, unknown>; render?: (args: Record<string, unknown>, ctx: unknown) => ReactNode }
interface Meta { component?: (p: Record<string, unknown>) => ReactNode; args?: Record<string, unknown>; render?: Story['render'] }

/** Storybook page for one component's guidelines. `mod` is the component's own stories module, used to draw the live anatomy diagram. */
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
  return <div style={{ maxInlineSize: '56rem', marginInline: 'auto', inlineSize: '100%', boxSizing: 'border-box', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', minInlineSize: 0 }}><GuidelinesContent folder={folder} renderPreview={renderPreview} /></div>
}
