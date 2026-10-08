---
title: Container Components Audit
---

Container Components

Components that organize, group, and surface content in structured layouts.

Dialog (Modal + Dialog Box — Merged)

INTENT

An overlay that interrupts the user's workflow to confirm an action, present critical information, or complete a focused task. Merges former 'Modal' and 'Dialog Box' into one component with size/complexity variants.

STATES

• Closed — Not visible. Page behind is interactive.
• Open — Overlay visible. Page behind non-interactive.
• With form — Form fields within dialog body.
• Confirming — Action in progress (spinner in CTA).
• Closing — Dismissing.

VARIANTS

COMPLEXITY:
• Confirmation dialog — Simple message + 2 actions (confirm/cancel). For irreversible actions, unsaved changes, destructive operations.
• Form dialog — Short form that can be completed without page context. Rename, create, configure.
• Information dialog — Read-only content presentation. Preview, summary.

SIZE:
• Small — Confirmations, simple messages
• Medium — Short forms, previews
• Large — Complex forms, detailed content

RULE: Use min/max width, NEVER fixed pixel dimensions.

KEEP / NEED / DO

✓ Confirms actions with consequences (data loss, unsaved changes, destructive)
✓ Provides critical information to continue a user-initiated process
✓ Short forms completable without broad page context
✓ Backdrop overlay blocks background interaction
✓ All dialogs follow lightbox effect (background non-interactable)
✓ Simple actions (rename, delete) work very well in dialogs

DITCH / DON'T

✗ Do NOT use for long forms, dense tables, complex data sets, or multi-page workflows
✗ Do NOT use when user needs to reference blocked content to decide
✗ Do NOT use for field-level errors
✗ Do NOT stack dialogs (modal on modal)
✗ Do NOT use for information user can safely ignore — use toast/banner
✗ Do NOT overuse dropdowns/menus that open beyond dialog bounds
✗ Fix: inconsistent button placement — STANDARDIZE
✗ Fix: inconsistent icon usage — standardize or remove
✗ Fix: inconsistent close button placement and presence
✗ Fix: dialog sizes not standardized
✗ Do NOT use word 'please' in dialog messages
✗ Do NOT use passive tense in messages

ACCESSIBILITY

• Multiple dismiss paths: cancel button, X, Escape key, click overlay
• Must have label/title indicating purpose
• Do not rely on color alone for severity
• Focus trapped within dialog while open
• Focus returns to trigger element on close
• Announce dialog title to screen reader on open

LIMITATIONS

• Distinguish clearly when to use Dialog vs Drawer vs Side Panel
• Downstream impact preview in dialogs: team has vetoed accordions-in-modals before but worth exploring
• Scrolling within dialog: if that much content, consider different component

Card

INTENT

A contained surface that groups related information and actions for a single subject. The primary container for data objects, records, and actionable content units.

STATES

• Default — Static card with content.
• Hover — Needs a distinct hover state (if clickable).
• Focused — Needs a visible focus indicator (if interactive).
• Selected — Clearly communicates selection (in multi-select contexts).
• Loading — Skeleton placeholder matching card layout.
• Expanded — Additional details revealed (if expandable).

VARIANTS

• Basic — Content container with optional header/footer
• Clickable — Entire card is a link/action trigger
• With actions — Footer with action buttons
• With media — Image/chart header area
• Metric card — KPI display with trend indicator
• Compact — Dense layout for lists/grids

KEEP / NEED / DO

✓ Groups related data into scannable units
✓ Clear boundary distinguishing card from surroundings
✓ Consistent internal spacing and layout
✓ Supports flexible content: text, metrics, media, actions
✓ Works in grid and list layouts

DITCH / DON'T

✗ Do NOT use cards for unrelated content grouping
✗ Do NOT make cards too complex — if it needs tabs or accordions, reconsider
✗ Do NOT nest cards within cards
✗ Standardize card treatment across products

ACCESSIBILITY

• Clickable cards: use <a> or <button> with descriptive label
• Card content must be readable without interacting with card
• Focus order within card follows logical reading order
• Group of cards: use landmark or list role for navigation

LIMITATIONS

• Need to define card vs section vs panel distinction clearly
• Metric card variant may overlap with Data Metric component — reconcile

Accordion

INTENT

Progressive disclosure component that shows/hides content sections. Reduces visual complexity by letting users expand only what they need.

STATES

• Collapsed — Header visible with expand indicator. Content hidden.
• Expanded — Header + content visible. Expand indicator reflects open state.
• Hover — Needs a distinct hover state on header.
• Focused — Needs a visible focus indicator on header.
• Disabled — Non-expandable. Non-interactive.
• Loading — Optional: content area loading after expand.

VARIANTS

• Single expand — Only one panel open at a time (auto-closes others)
• Multi expand — Multiple panels can be open simultaneously
• With checkbox — Selectable accordion items (for filter sets)
• Nested — Accordion within accordion (USE SPARINGLY — usually an IA problem)
• With expand/collapse all — Bulk operation header

KEEP / NEED / DO

✓ Progressive disclosure for large information sets
✓ Space constraints in layouts
✓ Organizing groups (filter sets, settings categories)
✓ Consider expand/collapse all option
✓ Allow multiple to be open at once by default

DITCH / DON'T

✗ NEVER nest accordions — if you feel you need to, it's an IA problem
✗ Do NOT use for critical information (errors, compliance warnings)
✗ Do NOT use to hide small amounts of content
✗ Do NOT use for navigation — use nav/tabs
✗ Do NOT use instead of wizard for multi-step flows
✗ Fix: inconsistent hover/active states
✗ Fix: inconsistent expand/collapse affordance location
✗ Fix: inconsistent padding when used in panels/drawers
✗ Fix: inconsistent border/container treatment

ACCESSIBILITY

• Headers: role='button' or <button> within heading element
• Content: role='region' with aria-labelledby pointing to header
• aria-expanded on trigger
• Enter/Space to toggle, Tab between headers
• Content becomes focusable when expanded

LIMITATIONS

• Open/closed defaults: document when to start expanded vs collapsed
• Loading state for async accordion content: needs spec
• Limit on number of accordions per screen: consider for non-filter contexts
• Overlap with tree component: document clear distinction

Drawer

INTENT

Contextual secondary workspace that temporarily extends the page. Allows viewing, editing, or configuring related information while preserving awareness of underlying content.

STATES

• Closed — Not visible. Page at full width.
• Opening — Transitions in from edge.
• Open — Visible panel. Page content may resize or be partially obscured.
• Closing — Transitions out.
• Loading — Content area loading state.

VARIANTS

• Small — Quick details, simple editing
• Medium — Standard forms, detail views
• Large — Complex editing, side-by-side comparison

FEATURES:
• Header with title + actions + close
• Scrollable content body
• Optional footer with actions
• Optional lead icon in header

KEEP / NEED / DO

✓ Contextual secondary workspace
✓ Preserves awareness of underlying content
✓ View, edit, or configure related info
✓ Transitions in and out contextually
✓ Multiple sizes for different content density
✓ Replaceable content area

DITCH / DON'T

✗ Do NOT use when original screen context is irrelevant — use page/dialog
✗ Do NOT use for primary tasks — use page navigation
✗ Do NOT use for long workflows — use pages
✗ Do NOT use for critical decisions — use dialog
✗ Do NOT use for highly structured data — use page
✗ Fix: header doesn't have placement for actions
✗ Fix: no lead icon option in header
✗ Fix: no tertiary action placement in footer
✗ Fix: no documentation for positioning

ACCESSIBILITY

• Focus moves to drawer on open
• Focus trapped within drawer while open (optional: may allow background interaction)
• Escape closes drawer
• Focus returns to trigger on close
• Drawer title announced on open

LIMITATIONS

• Max drawer size needs definition
• Inline drawer pattern: needed or not? (Not used today)
• SI's heavy drawer usage: does our drawer definition accommodate, or should SI not use drawer this way?

Popover (Tooltip + Popover — Merged)

INTENT

Contextual overlay that appears near a trigger element. Simple mode (tooltip): brief supplemental text on hover/focus. Rich mode (popover): structured content with headings, body, or interactive elements on click.

STATES

SIMPLE MODE (Tooltip):
• Hidden — Not visible.
• Visible — Appears on hover or keyboard focus. Auto-positions.
• Dismissed — Disappears on mouse leave or blur.

RICH MODE (Popover):
• Hidden — Not visible.
• Visible — Appears on click/tap. Contains interactive content.
• Dismissed — Closed by click outside, Escape, or explicit close.

VARIANTS

• Simple (tooltip) — Plain text, non-interactive. Hover/focus triggered.
• Rich (popover) — Headings, body text, interactive elements. Click triggered.
• With close button — For rich popovers with persistent content

POSITION: Auto-positions based on available space (top, bottom, left, right).
ARROW: Points to trigger element.

KEEP / NEED / DO

✓ Tooltips: brief, supplemental, non-essential information
✓ Popovers: richer structure including headings, body, interactions
✓ Clarify icon-only controls (tooltip)
✓ Explain a field label ONLY if not immediately intuitive

DITCH / DON'T

✗ NEVER hide essential information in tooltips — PUT IT ON THE UI
✗ NEVER just repeat visible text in tooltip — adds zero value
✗ Do NOT use tooltip when container needs interactive elements — use popover
✗ Do NOT nest popovers
✗ Do NOT show multiple popovers simultaneously
✗ Popover should not block task-critical information
✗ Fix: multiple tooltips showing on same element at same time
✗ Fix: using tooltip as input label replacement
✗ Fix: inconsistent use on icon-only vs labeled buttons

ACCESSIBILITY

• Tooltip: role='tooltip', triggered by hover AND focus
• Popover: role='dialog' with aria-labelledby
• Escape to dismiss
• Tooltip content accessible to screen readers via aria-describedby
• Popover focus management: focus moves in, returns on close

LIMITATIONS

• Critical question from team: if information is essential, it MUST be on the UI, not in a tooltip. Document this firmly.
• Need to clearly communicate: tooltip = hover info, popover = click interaction

Side Panel (Side Panel + Collapsible Panel — Merged)

INTENT

Persistent or collapsible secondary surface on the left or right edge for contextual information, filters, or settings. Preserves state when collapsed to a minimal rail.

STATES

• Expanded — Full panel visible with content.
• Collapsed — Minimal rail with icons only. State preserved.
• Expanding — Transitioning from rail to full width.
• Collapsing — Transitioning from full width to rail.
• Loading — Content loading state.

VARIANTS

• Fixed — Always visible, not collapsible
• Collapsible — Toggles between full and rail
• Left / Right — Position based on content relationship

FEATURES:
• Header with panel name/title
• Search and action buttons in header
• Scrollable content body
• Collapse/expand toggle

KEEP / NEED / DO

✓ Secondary surface from left or right edge
✓ Collapsible with state preservation
✓ Review details without losing place
✓ Adjust page-level filters or settings
✓ Complete short contextual tasks

DITCH / DON'T

✗ Do NOT use for long multi-step workflows
✗ Do NOT use to compare many fields/records at once
✗ Do NOT use as primary navigation (that's sidebar/nav)
✗ Do NOT hide critical actions in a panel
✗ Fix: no header/footer options
✗ Fix: collapse type doesn't have title option
✗ Fix: no multi-panel handling documented
✗ Fix: search/action positioning in header inconsistent

ACCESSIBILITY

• Collapse/expand toggle: accessible label describing action
• Panel content: landmark role for navigation
• Keyboard: toggle must be focusable and operable
• Announce expanded/collapsed state change

LIMITATIONS

• Significant overlap between side panels, drawers, and accordions — document clear use-case boundaries
• Side Panel: persistent/semi-persistent. Drawer: temporary. Accordion: inline disclosure.

Code Snippet

INTENT

Displays formatted code that users can read and copy. For API keys, configuration snippets, integration code, and technical reference content.

STATES

• Default — Code block displayed.
• Hover — Copy button clearly accessible.
• Copied — Success feedback after copy action.
• Multi-line — With optional line numbers.
• Scrollable — Horizontal scroll for long lines.

VARIANTS

• Single-line — Inline code or short snippet
• Multi-line — Block with line numbers
• With copy button — One-click copy (always present)
• With language label — Identifies code language

KEEP / NEED / DO

✓ Line numbers work well for multi-line
✓ No text color formatting for copied output (dev tools apply their own)
✓ Copy action always tied to code snippet
✓ Clearly distinguished from body text

DITCH / DON'T

✗ Do NOT apply syntax color formatting that would transfer on copy
✗ Currently only one variant (multi-line) — add single-line/inline
✗ Copy button should never be hidden

ACCESSIBILITY

• Code block: appropriate semantic element (<code>, <pre>)
• Copy button: accessible label 'Copy code'
• Success feedback announced to screen reader
• Keyboard: Tab to copy button, Enter to copy

LIMITATIONS

• Need single-line/inline variant
• Consider read-only vs editable code input distinction

