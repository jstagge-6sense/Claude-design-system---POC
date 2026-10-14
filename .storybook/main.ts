// Global Storybook styles.
//
// Keep these aligned with the standalone design-system preview
// so Storybook renders components using the same design tokens,
// reset, focus styles, theme modes, and density modes.

import '../src/styles/tokens.css'
import '../src/styles/reset.css'
import '../src/styles/focus.css'

// Generated theme and density overrides.
// Keep this last so the mode overrides take precedence.
import '../dist/modes.css'

const preview = {}

export default preview
