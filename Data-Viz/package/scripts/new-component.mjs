#!/usr/bin/env node
// Usage: node scripts/new-component.mjs Button [--tokens] [--root <dir>]
import { mkdirSync, writeFileSync, existsSync, readFileSync, appendFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
const args = process.argv.slice(2)
const name = args.find((a) => !a.startsWith('--'))
const rootIdx = args.indexOf('--root')
const root = resolve(rootIdx > -1 ? args[rootIdx + 1] : '.')
if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) { console.error('Give a PascalCase name, e.g. Button'); process.exit(1) }
const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const dir = join(root, 'src/components', name)
if (existsSync(dir)) { console.error(`${dir} exists; refusing to overwrite`); process.exit(1) }
mkdirSync(dir, { recursive: true })
const w = (f, s) => writeFileSync(join(dir, f), s)
w(`${name}.tsx`, `import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from './${name}.module.css'

export interface ${name}Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Mirror Figma properties 1:1: variants -> unions, TEXT -> children, BOOLEAN -> boolean, INSTANCE_SWAP -> slot.
  size?: 'small' | 'medium'
}

export const ${name} = forwardRef<HTMLButtonElement, ${name}Props>(function ${name}(
  { size = 'medium', className, ...rest },
  ref,
) {
  return <button ref={ref} className={[styles.root, className].filter(Boolean).join(' ')} data-size={size} {...rest} />
})
`)
w(`${name}.module.css`, `/* Bind to component tokens first, core (semantic) tokens second. Never raw colors or primitives. */
.root {
  min-block-size: var(--core-dimension-size-control-height-medium);
  padding-inline: var(--core-dimension-space-standard);
  border-radius: var(--core-dimension-radius-control-medium);
}
.root[data-size='small'] { min-block-size: var(--core-dimension-size-control-height-small); }
.root:focus-visible { outline: none; box-shadow: var(--core-effect-ring-focus); }
.root:disabled { box-shadow: none; }
@media (prefers-reduced-motion: reduce) { .root { transition: none; } }
`)
w(`${name}.test.tsx`, `import { render, screen } from '@testing-library/react'
import { ${name} } from './${name}'

describe('${name}', () => {
  it('renders with an accessible name', () => {
    render(<${name}>Save changes</${name}>)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy()
  })
})
`)
w(`${name}.stories.tsx`, `import type { Meta, StoryObj } from '@storybook/react'
import { ${name} } from './${name}'

const meta: Meta<typeof ${name}> = { title: 'Components/${name}', component: ${name} }
export default meta
type Story = StoryObj<typeof ${name}>

// One story per Figma variant and state. Force states with data attributes only in docs.
export const Default: Story = { args: { children: 'Label' } }
export const Small: Story = { args: { children: 'Label', size: 'small' } }
export const Disabled: Story = { args: { children: 'Label', disabled: true } }
`)
w(`${name}.figma.tsx`, `// Code Connect. Replace the URL with the node from the v4 state ledger (never guess IDs).
import figma from '@figma/code-connect'
import { ${name} } from './${name}'

figma.connect(${name}, 'https://www.figma.com/design/FILE_KEY?node-id=NODE_ID', {
  props: {
    size: figma.enum('Size', { Small: 'small', Medium: 'medium' }),
    disabled: figma.enum('State', { Disabled: true }),
    label: figma.string('Label'),
  },
  example: ({ size, disabled, label }) => <${name} size={size} disabled={disabled}>{label}</${name}>,
})
`)
w('index.ts', `export * from './${name}'\n`)
const idx = join(root, 'src/index.ts')
appendFileSync(idx, `export * from './components/${name}'\n`)
if (args.includes('--tokens')) {
  const t = join(root, 'tokens/component')
  mkdirSync(t, { recursive: true })
  writeFileSync(join(t, `${kebab}.json`), JSON.stringify({
    component: { [name[0].toLowerCase() + name.slice(1)]: { _comment_: undefined,
      /* Add only roles no semantic token answers. Alias semantics (core.*) only. Example:
      color: { content: { disabled: { $type: 'color', $value: '{core.color.content.disabled}' } } } */ } },
  }, null, 2) + '\n')
}
const sp = join(root, 'design-system-state.json')
if (existsSync(sp)) {
  const s = JSON.parse(readFileSync(sp, 'utf8'))
  s.components = s.components || {}
  s.components[name] = { status: 'scaffolded', figmaNodeId: null }
  writeFileSync(sp, JSON.stringify(s, null, 2) + '\n')
}
console.log(`Created ${dir}`)
