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

      return Story()
    },
  ],

  parameters: {
    layout: 'padded',

    backgrounds: {
      default: 'page',
      values: [
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
