---
title: Action Components Audit - no visual directions
---

Action Components

Components that trigger operations, submit data, navigate, or present action choices.

Button

INTENT

Triggers an action or submits data. The primary mechanism for user-initiated operations. Use when a user needs to perform an action — save, create, delete, submit, or navigate a workflow step.

STATES

• Default — Resting. Clearly communicates interactivity.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator. Keyboard accessible via Tab + Enter/Space.
• Active/Pressed — Needs a distinct pressed state.
• Disabled — Non-interactive. MUST include adjacent explanation of why.
• Loading — Spinner replaces label text. Button width preserved. Pointer events disabled.

VARIANTS

PRIORITY:
• Primary — Most important action per logical task area. ONLY ONE per task area.
• Secondary — Supporting actions: cancel, back, edit.
• Tertiary — Lower-priority actions: view details, learn more, optional actions.
• Destructive — Irreversible actions: delete, remove, revoke access. Must be clearly distinguishable.

CONTENT MODE:
• Text — Standard button with label. Optionally leading icon, trailing icon, or leading badge.
• Icon-only — Single universally-understood icon. MUST have accessible label/tooltip. NOT available in Primary.

SIZE:
• Small — Dense areas, inline actions, table rows.
• Medium — Default. Most common usage.
• Large — Prominent CTAs, landing areas, onboarding flows.

KEEP / NEED / DO

✓ Only ONE primary button per logical task area (page/modal/drawer)
✓ Button text must state the action: "Save Changes", "Create Segment", "Delete Account"
✓ Keep simple, consistent sizing: small for dense, medium for default, large for prominence
✓ If 3 buttons in a group, use all three priority levels — never multiple secondaries
✓ Icon-only ONLY when icon is universally understood AND accessible label exists
✓ Loading state preserves button width to prevent layout shift
✓ Keyboard: Tab to focus, Enter/Space to activate, visible focus indicator

DITCH / DON'T

✗ Remove [link button] variants — buttons trigger actions, links navigate
✗ Do NOT mix button and link styles — maintain clear visual distinction
✗ Do NOT use icon-only for primary buttons
✗ Do NOT use disabled state without explaining WHY the action is unavailable
✗ Do NOT add tooltips to standard buttons with clear labels — improve the label instead
✗ Do NOT use similar styling to chips or badges
✗ Do NOT let buttons overflow their container — use responsive width rules

ACCESSIBILITY

• Minimum touch target must meet accessibility standards across all sizes
• Use native <button> element. Use <label> when possible.
• aria-label only when visible label lacks context sighted users have
• Focus indicator must be visible in all themes
• Disabled state: use aria-disabled="true" and provide explanation text
• Text must have sufficient contrast against background per accessibility standards

LIMITATIONS & OPEN QUESTIONS

• Decision needed: exact limits on secondary buttons per task area
• Decision needed: naming for disabled state — team prefers "unavailable" over "disabled"
• Split button overlap: clarify when to use split button vs. button + dropdown

Split Button

INTENT

Combines a default action with access to related alternative actions. Use when there is a clear primary action but users occasionally need alternatives accessible via a dropdown trigger.

STATES

• Default — Primary action button + chevron trigger, presented as a connected unit but independently interactive.
• Hover (Primary) — Needs a distinct hover state on primary action area. Chevron area unchanged.
• Hover (Trigger) — Needs a distinct hover state on chevron area. Primary action unchanged.
• Focused — Needs a visible focus indicator for the entire component. Arrow keys switch focus between sections.
• Active — Each section has independent pressed state.
• Disabled — Both sections disabled and non-interactive. Explanation required.
• Open — Dropdown visible. Chevron indicates open state.

VARIANTS

• Primary — For important actions with alternatives (Save / Save As / Save & Close)
• Secondary — For supporting actions with alternatives

NOT available in: Tertiary, Icon-only
Chevron always on right (left-to-right reading order).

KEEP / NEED / DO

✓ Split button = 2 independently operating actions
✓ Primary action on left, dropdown trigger on right
✓ Chevron flips when dropdown opens
✓ Treat secondary trigger as an icon-only button (essentially a 2-button group)
✓ Use when clear default action exists but alternatives are needed
✓ Both sections must operate independently — never coupled

DITCH / DON'T

✗ Stop confusing split button with button + icon (they are different patterns)
✗ Stop confusing split button with dropdown select
✗ Do NOT use when there is no clear default action — use a menu/dropdown instead
✗ Do NOT use for more than ~5 alternative actions

ACCESSIBILITY

• Both sections independently focusable via keyboard
• Dropdown trigger: aria-haspopup="true", aria-expanded state
• Menu items navigable with arrow keys
• Escape closes dropdown and returns focus to trigger
• Screen reader must announce both the primary action and "more options"

LIMITATIONS & OPEN QUESTIONS

• Visual distinction from filters and dropdowns needs documentation
• Need clear guidance on when split button vs. button group vs. menu

Button Group

INTENT

Groups related actions or selection options into a visually connected set. Use for toggling views (day/week/month), grouping related actions, or selection sets with 2-5 options.

STATES

ACTION GROUP states (per button within group):
• Default, Hover, Focused, Active, Disabled — same as standalone button

SELECTION GROUP states (per segment):
• Unselected — Resting state.
• Selected — Clearly communicates current selection.
• Hover — Needs a distinct hover state on non-selected segments.
• Focused — Needs a visible focus indicator per segment. Arrow keys to move between.
• Disabled — Individual segments can be disabled independently.

VARIANTS

• Action Group — Collection of related actions. Clicking executes something.
  Save / Cancel / Publish; Sort options; Page actions
• Selection Group — Choosing one or more options. Clicking changes state.
  Day / Week / Month; List / Grid view; Price preferences
  Can be single-select or multi-select depending on usage.

LIMIT: 2–5 buttons per group. Beyond 5, use tabs or a different pattern.

KEEP / NEED / DO

✓ Use action groups for related actions — unrelated actions increase cognitive load
✓ Segments presented as a connected unit within the same component
✓ Always show clear selected state for selection groups
✓ Can be single-select or multi-select depending on context
✓ Limit to 2–5 buttons

DITCH / DON'T

✗ Do NOT mix button group with pagination, WYSIWYG toolbar, or tab patterns
✗ Do NOT create separate components for action groups vs selection groups — one component, two modes
✗ Tabs must look and function distinctly from button groups
✗ No need for "group of buttons" as a separate pattern — governance handles placement

ACCESSIBILITY

• Selection groups: role="group" with aria-label describing the group purpose
• Arrow keys navigate between segments; Tab moves to/from the group
• Selected state announced by screen reader (aria-pressed or aria-checked)
• Focus visible on each segment independently

LIMITATIONS & OPEN QUESTIONS

• Compact tab variant blurs the line with button group — needs visual distinction documentation
• Recommendation: governed spacing/hierarchy rules for ad-hoc button collections

Link

INTENT

An interactive text element that navigates users to another page, route, section, document, or external site. The fundamental distinction: links navigate, buttons act.

STATES

• Default — Clear navigational affordance. Must be distinguishable from surrounding text.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator. Keyboard accessible.
• Active/Pressed — Needs a distinct pressed state.
• Visited — Optional. Must communicate previously visited destinations.
• Disabled — Needs a non-interactive state. Rare — prefer removing non-navigable links entirely.

VARIANTS

• Inline Link — Within body text.
• Standalone Link — Outside running text. Can include trailing icon (external link, arrow).
• Link with Icon — Leading or trailing icon (must be clearly defined in system when to use).
• Destructive Link — For navigation to destructive flows. Must be clearly distinguishable. Rare.

KEEP / NEED / DO

✓ On click, navigates — NEVER triggers an action (use button instead)
✓ Label clearly describes destination or outcome — never "click here"
✓ Links must be identifiable through multiple cues — never rely on a single visual property alone
✓ Add icons when necessary (external link, download) — define "necessary" in docs
✓ Inline references in body text are the primary use case

DITCH / DON'T

✗ Links should NEVER trigger actions (change data, submit forms, open/close UI) — use buttons
✗ Links should NEVER be used as text decoration
✗ Do NOT use link styling that is indistinguishable from plain text

ACCESSIBILITY

• Use native <a> element with valid href
• Links must be identifiable through multiple cues, not a single visual property alone
• External links: indicate with icon AND aria-label including "opens in new tab"
• Keyboard: Tab to focus, Enter to activate
• Link text must be meaningful out of context (screen reader link lists)

LIMITATIONS & OPEN QUESTIONS

• Need clear definition of when icons are "necessary" on links
• Need to document inline link vs. standalone link visual differences

Menu (Dropdown + Select Menu — Merged)

INTENT

Presents a list of actions or options in an overlay triggered by a button, link, or other control. Consolidates the former 'Dropdown' and 'Select Menu' into a single pattern with two modes.

STATES

• Trigger: Default, Hover, Focused, Open, Disabled
• Menu overlay: Visible / Hidden
• Menu items: Default, Hover, Focused, Active, Disabled, Selected (selection mode only)
• Grouped items: Group headers (non-interactive), Dividers between groups

VARIANTS

• Action Menu — List of actions. Clicking executes (Edit, Delete, Duplicate, Export).
  Triggered by button, icon-only button, or split button trigger.
• Selection Menu — List of options. Clicking selects/deselects.
  Single-select: radio behavior. Multi-select: checkbox behavior.
  Used within Select, Multi-select, and similar compound components.

FEATURES:
• Searchable/filterable (for long lists)
• Grouped items with section headers
• Nested submenus (use sparingly — max 1 level deep)
• Keyboard navigable

KEEP / NEED / DO

✓ When type-to-search, highlight matching text in filtered options
✓ Consistent trigger affordance — chevron direction changes when open
✓ Clicking outside or focusing away automatically closes
✓ Group related items with headers
✓ Support keyboard navigation: arrow keys, Enter to select, Escape to close, type-ahead

DITCH / DON'T

✗ Do NOT use when options would be better shown upfront (e.g., true/false → use toggle or radio)
✗ Do NOT use placeholders or group headers as labels — visible labels required
✗ Do NOT hide critical actions in deeply nested submenus
✗ Do NOT use when there are fewer than 3 options — use radio or toggle instead

ACCESSIBILITY

• Trigger: aria-haspopup="menu" or "listbox", aria-expanded state
• Menu: role="menu" (action) or role="listbox" (selection)
• Items: role="menuitem" or role="option"
• Arrow keys navigate items, Enter/Space selects, Escape closes
• Type-ahead: typing characters focuses matching item
• Selected state announced by screen reader

LIMITATIONS & OPEN QUESTIONS

• Need clear documentation distinguishing Menu from Split Button trigger behavior
• Need minimum option count guidance (3+ for menu, fewer → inline controls)

