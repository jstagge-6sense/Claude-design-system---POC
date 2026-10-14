// Global Storybook styles.
//
// Load the generated design-system stylesheet so Storybook uses
// the same tokens and component styles as the built library.
import '../dist/styles.css'

// Global reset and focus styles used by the design system.
import '../src/styles/reset.css'
import '../src/styles/focus.css'

// Generated theme and density overrides.
// Keep this last so mode overrides take precedence.
import '../dist/modes.css'

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
