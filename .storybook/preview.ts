import { createElement } from 'react'
import type { Preview } from '@storybook/react'

import '../src/styles/tokens.css'
import '../src/styles/reset.css'
import '../src/styles/focus.css'

// Generated theme and density overrides.
// Keep this last so mode overrides take precedence.
import '../dist/modes.css'

const preview: Preview = {
  decorators: [
    (Story) => {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.setAttribute('data-density', 'default')

      // Centered, responsive column: fills the canvas up to 60rem, never shrinks to content width.
      return createElement('div', { style: { inlineSize: '100%', maxInlineSize: '60rem', marginInline: 'auto', boxSizing: 'border-box' } }, createElement(Story))
    },
  ],

  parameters: {
    layout: 'padded',

    // Guidelines is the first export in each component's stories file, so it lists first.
    backgrounds: {
      default: 'white',
      values: [
        { name: 'white', value: '#FFFFFF' },
        {
          name: 'page',
          value: 'var(--core-color-surface-page)',
        },
        {
          name: 'card',
          value: 'var(--core-color-surface-card)',
        },
        {
          name: 'overlay',
          value: 'var(--core-color-surface-overlay)',
        },
      ],
    },

    controls: {
      expanded: true,
    },
  },
}

export default preview
