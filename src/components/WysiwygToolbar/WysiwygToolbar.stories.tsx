import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WysiwygToolbar, TOOLS, type ToolId } from './WysiwygToolbar'
import { TextArea } from '../TextArea'

const meta = {
  title: 'Data entry/WysiwygToolbar',
  component: WysiwygToolbar,
  parameters: {
    tier: 2,
    group: 'Data entry',
    description: 'Formatting controls for a rich text editor: grouped tools, active formats with aria-pressed, arrow-key navigation and a More menu for extended tools. Always connected to its editor with `controls`.',
  },
  args: { controls: 'demo-editor' },
} satisfies Meta<typeof WysiwygToolbar>
export default meta
type Story = StoryObj<typeof meta>

export const Full: Story = { args: { variant: 'full', active: ['bold', 'alignLeft'] } }
export const Minimal: Story = { args: { variant: 'minimal', active: ['italic'] } }

export const Floating: Story = {
  args: { variant: 'floating', active: ['bold'], position: { top: 44, left: 24 } },
  render: (args) => (
    <div style={{ position: 'relative', minBlockSize: '7rem', maxInlineSize: '36rem' }}>
      <p id="demo-editor" style={{ margin: 0, paddingBlockStart: '4rem' }}>
        Select text in the editor and the toolbar appears above it. Here the selection is simulated: <mark>Accounts that opened the pricing page twice</mark> this week.
      </p>
      <WysiwygToolbar {...args} />
    </div>
  ),
}

export const ActiveFormats: Story = { args: { active: ['bold', 'italic', 'bulletList', 'alignCenter'] } }

export const DisabledTool: Story = { name: 'Disabled tool', args: { disabledTools: ['attachment', 'code'], active: ['bold'] } }
export const DisabledToolbar: Story = { name: 'Disabled toolbar', args: { disabled: true, active: ['bold'] } }

/** Extended tools collapse behind More. Core formatting (bold, italic, link, lists) never hides. */
export const CollapsedOverflow: Story = {
  name: 'Collapsed (More menu open)',
  args: { overflow: 'always', active: ['underline'], defaultMoreOpen: true },
  render: (args) => <div style={{ minBlockSize: '19rem', maxInlineSize: '24rem' }}><WysiwygToolbar {...args} /></div>,
}

const ST = [undefined, 'hover', 'pressed', 'focus'] as const
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <WysiwygToolbar
        {...args}
        label="Forced states"
        variant="minimal"
        tools={['bold', 'italic', 'underline', 'code']}
        active={['underline']}
        disabledTools={['code']}
        forcedStates={{ italic: 'hover' }}
      />
      {ST.map((s) => (
        <WysiwygToolbar key={String(s)} {...args} label={`State ${s ?? 'default'}`} variant="minimal" tools={['bold']} forcedStates={s ? { bold: s } : undefined} />
      ))}
    </div>
  ),
}

export const RightToLeft: Story = { name: 'RTL', args: { active: ['bold'] }, render: (args) => <div dir="rtl"><WysiwygToolbar {...args} /></div> }

/* ---- Pairing with TextArea. The toolbar formats the selection with plain markers, to show the connection. ---- */
const WRAP: Partial<Record<ToolId, [string, string]>> = { bold: ['**', '**'], italic: ['_', '_'], code: ['`', '`'], underline: ['<u>', '</u>'], link: ['[', '](https://example.com)'] }
const PREFIX: Partial<Record<ToolId, string>> = { bulletList: '- ', numberedList: '1. ' }

function Pairing() {
  const [text, setText] = useState('Quarterly note for the sales team.\nSelect some text, then use the toolbar.')
  const [active, setActive] = useState<ToolId[]>([])
  const [last, setLast] = useState('No tool used yet.')
  const apply = (tool: ToolId) => {
    const el = document.getElementById('pairing-editor') as HTMLTextAreaElement | null
    if (!el) return
    const { selectionStart: a, selectionEnd: b, value } = el
    const wrap = WRAP[tool]
    const prefix = PREFIX[tool]
    if (wrap) setText(value.slice(0, a) + wrap[0] + value.slice(a, b) + wrap[1] + value.slice(b))
    else if (prefix) { const start = value.lastIndexOf('\n', a - 1) + 1; setText(value.slice(0, start) + prefix + value.slice(start)) }
    setActive((cur) => (cur.includes(tool) ? cur.filter((t) => t !== tool) : [...cur, tool]))
    setLast(`${TOOLS.find((t) => t.id === tool)?.label} applied.`)
    el.focus()
  }
  return (
    <div style={{ display: 'grid', gap: 8, maxInlineSize: '40rem' }}>
      <WysiwygToolbar controls="pairing-editor" active={active} onToolClick={apply} label="Note formatting" />
      <TextArea id="pairing-editor" label="Note" value={text} onValueChange={setText} rows={5} />
      <p role="status" style={{ margin: 0 }}>{last}</p>
    </div>
  )
}
export const PairedWithTextArea: Story = { name: 'Paired with TextArea', render: () => <Pairing /> }
