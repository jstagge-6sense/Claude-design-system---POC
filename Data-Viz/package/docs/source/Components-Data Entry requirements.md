---
title: Data Entry Components Audit - no visual direction
---

Data Entry Components

Components for user input — text, numbers, selections, dates, files, and rich content.

Input (Text Field)

INTENT

Allow users to enter, edit, and validate free-form text. The foundational form element for names, descriptions, IDs, labels, and configuration settings.

STATES

• Default — Empty field with visible label. Placeholder optional.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator. Label persists.
• Filled — User-entered content visible. Clear button optional.
• Error — Needs a distinct error state with error message below field.
• Disabled — Non-editable. Must still meet accessibility contrast requirements.
• Read-only — Visible, not editable. Distinct from disabled.
• Required — Must communicate required status to the user.
• Loading — Inline spinner for async validation.

VARIANTS

• Default text input — Single-line standard
• With leading icon — Search, currency, category
• With trailing icon — Clear, visibility toggle, validation
• With character counter
• With helper text — Below field
• Small — Dense layouts, table cells
• Medium — Default for standard forms

KEEP / NEED / DO

✓ Sizes (Regular/Small) for density contexts
✓ Consistent placement of icon, counter, hints, optional indicator
✓ Well-defined states (Default, Focused, Hover, Disabled, Error, Read-only)
✓ Inline, immediate validation feedback
✓ Character counter for length-limited fields

DITCH / DON'T

✗ Do NOT use for numeric-only values — use Number Input
✗ Do NOT use for selecting from options — use Select/Menu
✗ Do NOT use placeholder as label — label must persist
✗ Fix duplicate character limit patterns across products
✗ Standardize mandatory/optional indicator pattern

ACCESSIBILITY

• Visible persistent label via htmlFor/id
• Error messages via aria-describedby
• aria-required='true' and required status communicated to all users
• Disabled state must still meet accessibility contrast requirements
• Support autocomplete attributes

LIMITATIONS

• Placeholder guidelines needed: example input, never instruction
• Mandatory vs optional indicator needs standardized pattern

Text Area

INTENT

Allow users to enter multi-line text with validation, character limits, and comfortable editing. For descriptions, prompts, notes, comments, and AI prompt authoring.

STATES

• Default — Empty with label. Resize handle available.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator.
• Filled — Content visible. Optional auto-grow.
• Error — Needs a distinct error state with error message.
• Disabled — Non-editable. All child elements (tags) also disabled.
• Read-only — Visible, not editable.
• Auto-resize — Grows with content to max-height, then scrolls.

VARIANTS

• Standard — Fixed height with scroll
• Auto-resize — Grows with content
• With character counter
• With helper text
• With inline actions — AI generate, formatting
• Rich textarea — Inline formatting, tags, mentions

KEEP / NEED / DO

✓ Character limit, hints, info, optional indicator placement
✓ Tags support within textarea
✓ States matching Input patterns
✓ Auto-resize option
✓ Rich textarea with inline AI actions

DITCH / DON'T

✗ Do NOT use for short values — use Input
✗ Fix: disabled state must disable ALL children including tags
✗ Fix: scroll behavior needs standardized rules
✗ Fix: inline AI actions need layout guidance

ACCESSIBILITY

• Same as Input: persistent label, aria-describedby for errors
• Resize handle keyboard operable
• Character counter announced as limit approaches

LIMITATIONS

• Scroll vs auto-resize rule needed
• Inline AI actions create layout pressure

Number Input

INTENT

Enter, adjust, and validate numeric values via typing, steppers, or keyboard. For quantities, thresholds, limits, counts, and numeric filters.

STATES

• Default — Empty with label. Stepper buttons available.
• Hover — Needs a distinct hover state. Steppers may hover independently.
• Focused — Needs a visible focus indicator. Up/Down arrows increment/decrement.
• Filled — Numeric value displayed.
• Error — Needs a distinct error state with error message.
• Disabled — Non-editable. Steppers disabled.
• Min/Max constrained — Must communicate when value is at boundary.

VARIANTS

• Basic — Type-only, no steppers
• With stepper (+/- buttons)
• Min/Max constrained — Enforced boundaries
• With unit label — Suffix (%, px, days)
• Read-only / Disabled

KEEP / NEED / DO

✓ Direct typing for precision
✓ Working increment/decrement buttons
✓ Seamless Tab navigation
✓ Clear focus indicator
✓ Reject non-numeric chars immediately

DITCH / DON'T

✗ Do NOT accept alphabets or special characters (e+, e-, etc.)
✗ Do NOT show errors without messages
✗ Fix: min/max limits must be communicated
✗ Fix: same filter behaves differently across screens

ACCESSIBILITY

• role='spinbutton' with aria-valuemin/max/now
• Stepper buttons: accessible labels
• Error messages via aria-describedby
• Arrow key support

LIMITATIONS

• Inconsistent stepper availability across products
• Same filter appears as slider AND number input — needs single pattern

Single-Select

INTENT

Choose exactly one option from a predefined list. Use when there are too many options for radio buttons (5+) and users need search/filter capability.

STATES

• Default — Closed with label and placeholder.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator. Enter/Space opens.
• Open — Dropdown visible. Type-ahead active.
• Selected — Chosen value shown in trigger.
• Disabled — Non-interactive. Explanation required.
• Error — Needs a distinct error state with error message.
• Loading — Spinner while options load.

VARIANTS

• Standard — Click to open, select one
• Searchable — Type to filter options
• With groups — Section headers
• With create — 'Create new...' option
• Small — Dense layouts, table cells

KEEP / NEED / DO

✓ Chevron changes direction when open
✓ Minimum 3+ options (fewer → radio)
✓ Visible labels ALWAYS
✓ Click outside auto-closes
✓ Searchable for long lists

DITCH / DON'T

✗ Do NOT use for 2 options — use toggle or radio
✗ Do NOT use placeholders as labels
✗ Fix: inconsistent labeling mechanisms
✗ Fix: inconsistent 'add new' experiences

ACCESSIBILITY

• aria-haspopup='listbox', aria-expanded
• role='option' with aria-selected
• Type-ahead screen reader compatible
• Arrow keys, Enter, Escape, Tab

LIMITATIONS

• 'Create new' option needs standardized pattern
• Distinguish visually from multi-select and menu

Multi-Select

INTENT

Choose multiple options from a list. For selecting several items with search, filtering, and bulk operations. ACKNOWLEDGED AS NEEDING REDESIGN.

STATES

• Default — Closed with label and placeholder or chip summary.
• Open — Dropdown with checkboxes visible. Search active.
• Partially selected — Count or chips shown.
• All selected — 'All selected' indicator.
• Error — Needs a distinct error state with error message.
• Disabled — Non-interactive.

VARIANTS

• Standard — Checkboxes in dropdown
• Searchable — Type to filter
• With chips — Selected items as dismissible chips
• With select all / clear all
• With groups — Section headers

KEEP / NEED / DO

✓ Make list searchable
✓ Provide Select All / Clear All
✓ Show selected count
✓ Checkbox affordance for multi-selectable
✓ Keep dropdown open after each selection

DITCH / DON'T

✗ NEVER close dropdown after individual selection
✗ Fix: inconsistent mechanisms (checkboxes vs one-at-a-time)
✗ Fix: groups not recognizable or selectable
✗ NEEDS SIGNIFICANT REDESIGN

ACCESSIBILITY

• role='option' with aria-selected
• Count announced to screen reader
• Chip dismissal: 'Remove [name]' label
• Bulk ops announced

LIMITATIONS

• Needs major redesign — selecting 30+ items extremely tedious
• Group selection not implemented

Toggle

INTENT

Immediate binary on/off switch. Takes effect instantly without form submission. The toggle IS the action.

STATES

• Off — Resting off state. Clearly communicates inactive.
• On — Active state. Clearly communicates enabled.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator.
• Disabled (Off/On) — Non-interactive. Shows locked state.
• Loading — Optional spinner during async state change.

VARIANTS

• Standard — Toggle with adjacent label
• With description — Label + helper text
• Small — Dense layouts, settings lists

KEEP / NEED / DO

✓ Immediate effect — no save button
✓ Label always present
✓ Label describes ON state
✓ Clear on/off distinction through multiple cues

DITCH / DON'T

✗ Do NOT use when action needs confirmation — use checkbox + submit
✗ Do NOT change label text on toggle — confusing
✗ Guidelines needed for placement (left/right of label)

ACCESSIBILITY

• role='switch' with aria-checked
• Label describes ON state
• Space to toggle, Tab to navigate

LIMITATIONS

• Placement guidelines needed
• Should never appear without label

Radio

INTENT

Select exactly one option from a small visible set (2–7). For mutually exclusive choices displayed inline.

STATES

• Unselected — Resting unselected state.
• Selected — Clearly communicates selection.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator.
• Disabled (Unselected/Selected) — Non-interactive.
• Error — Needs a distinct error state at group level with message.

VARIANTS

• Vertical group — Default, best for scanning
• Horizontal group — 2–3 short labels only
• Radio card — Larger target with description
• With description — Per-option helper text

KEEP / NEED / DO

✓ Use for 2–7 mutually exclusive options
✓ Vertical by default
✓ Pre-select when sensible default exists
✓ fieldset + legend for grouping

DITCH / DON'T

✗ Do NOT use for 7+ options — switch to select
✗ Do NOT use to toggle views — use tabs/button group
✗ Horizontal layout guidelines needed

ACCESSIBILITY

• <fieldset> with <legend>
• Arrow keys within group, Tab between groups
• One item in tab order per group

LIMITATIONS

• Radio group vs button group usage needs documentation
• Horizontal spacing guidelines needed

Checkbox

INTENT

Select zero or more options, or toggle a single binary choice requiring explicit form submission (unlike toggle).

STATES

• Unchecked — Resting unchecked state.
• Checked — Clearly communicates checked.
• Indeterminate — Communicates partial selection (parent with partial children).
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator.
• Disabled — Non-interactive.
• Error — Needs a distinct error state at group level with message.

VARIANTS

• Single — Binary yes/no choice
• Group — Multiple options, 0 to all selectable
• With description — Per-option helper text
• Indeterminate — Parent with partial children

KEEP / NEED / DO

✓ Multi-selection from a set
✓ Indeterminate state for parent checkboxes
✓ Can combine with form submission
✓ fieldset + legend grouping

DITCH / DON'T

✗ DEPRECATE circular checkbox — not in production
✗ Horizontal spacing guidelines needed
✗ Do NOT use for instant-effect settings — use toggle

ACCESSIBILITY

• <fieldset> with <legend>
• Indeterminate: aria-checked='mixed'
• Space to toggle, Tab to navigate

LIMITATIONS

• Circular checkbox: confirm deprecation
• Horizontal spacing minimum needs definition

Date Picker

INTENT

Select a date or date range for filtering, scheduling, or configuration. Must support both calendar browsing AND direct keyboard entry.

STATES

• Default — Closed field with calendar icon.
• Focused — Typing accepted.
• Open — Calendar dropdown. Today clearly indicated.
• Date selected — Date shown in field.
• Range selected — Start + end in field.
• Invalid — Needs a distinct error state with error message.
• Disabled — Non-interactive.

VARIANTS

• Single date
• Date range — Start and end
• With presets — Last 7/30 days, This quarter, Custom
• With manual entry — Type directly
• With time — Date + Time Picker compound

KEEP / NEED / DO

✓ Leading calendar icon
✓ Clearly communicates input affordance
✓ Presets — standardize across products
✓ Support manual keyboard entry
✓ Make keyboard-friendly throughout

DITCH / DON'T

✗ Standardize preset options across products
✗ Standardize apply behavior (Apply button for ranges, auto for single)
✗ Fix inconsistent icon usage
✗ Don't force calendar when typing is faster
✗ Show constraints upfront, not after selection

ACCESSIBILITY

• Full keyboard nav: arrows for days, Tab for month
• Dates and states announced by assistive tech
• Manual entry accepts common formats
• Invalid dates prevented or explained

LIMITATIONS

• Timezone support needs business decision
• Apply button vs auto-apply: standardize
• Backend cost: Apply button recommended for ranges

Time Picker

INTENT

Select a time of day for scheduling or configuration. Support direct entry and structured selection.

STATES

• Default — Field with clock icon.
• Focused — Typing accepted (smart parsing: '930' → 9:30).
• Open — Time selection dropdown.
• Selected — Time displayed.
• Error — Invalid format.
• Disabled — Non-interactive.

VARIANTS

• Dropdown list — Preset time slots
• Granular (H:M:S) — Requires Apply button
• With presets — Morning, End of Day
• 12h/24h — Locale-aware

KEEP / NEED / DO

✓ Support manual entry with smart parsing
✓ Time presets for efficiency
✓ Leading clock icon
✓ Intelligent formatting (930 → 9:30 AM)

DITCH / DON'T

✗ Always support typing — never clock-only
✗ Simplify H/M/S — too many clicks
✗ Don't use single-select dropdown as time picker

ACCESSIBILITY

• Manual entry as primary path
• 12h/24h per locale preference
• Selection announced by screen reader

LIMITATIONS

• 12h vs 24h needs locale decision
• H:M:S needs UX improvement

Slider

INTENT

Select a value within a defined spectrum by dragging. Use when relative position matters more than exact number.

STATES

• Default — Track with handle.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator. Arrow keys adjust.
• Dragging — Handle follows pointer.
• Disabled — Non-interactive.

VARIANTS

• Continuous — Any value in range
• Discrete — Snaps to steps
• With input field — Synced number input
• With value label — Current value above handle

KEEP / NEED / DO

✓ Smooth drag, no lag
✓ Clear selected value indication
✓ Pair with number input for precision
✓ Defined min/max communicated

DITCH / DON'T

✗ DEPRECATE range slider — use two number inputs
✗ Fix inconsistent styles across products
✗ Never hide current value

ACCESSIBILITY

• role='slider' with aria-valuemin/max/now/text
• Arrow keys adjust, Home/End for min/max
• Announce value changes

LIMITATIONS

• Range slider deprecated
• Same filter appears as slider AND number input — standardize

File Upload

INTENT

Upload files with clear format guidance, progress, and error handling. For importing data, documents, images, or attachments.

STATES

• Default — Drop zone with browse button. Accepted formats shown.
• Drag over — Needs a distinct drag-over state.
• Uploading — Progress indicator with percentage.
• Success — Confirmation with file name.
• Error — Specific reason shown.
• Disabled — Non-interactive.
• Multiple — File list with individual status.

VARIANTS

• Browse button — Simple trigger
• Drag-and-drop zone — Large drop area
• With progress — Per-file progress
• Single / Multi-file

KEEP / NEED / DO

✓ Clear CTA
✓ Large drag-and-drop target
✓ Progress percentage
✓ Restrict formats immediately
✓ Show limits upfront

DITCH / DON'T

✗ Standardize upload experience across products
✗ Never omit drag-and-drop where space allows
✗ Never skip progress or validation

ACCESSIBILITY

• Upload trigger keyboard accessible
• Progress via aria-live
• Error messages via aria-describedby

LIMITATIONS

• Min/max size restrictions need docs
• Keyboard nav for upload action currently missing

Search

INTENT

Find content, records, or filters by keywords with immediate results. Primary efficiency tool for large datasets.

STATES

• Default — Field with search icon.
• Focused — Cursor in field.
• Typing — Results appear (debounced). Loading indicator.
• Results — Dropdown, keyboard navigable.
• No results — Empty state with suggestions.
• Disabled — Non-interactive.

VARIANTS

• Basic — Type and submit
• With autocomplete
• With clear button (always present when text exists)
• With filters/scopes
• Global vs Contextual
• Small — Inline/dense

KEEP / NEED / DO

✓ Sizes for density contexts
✓ Clear button always present with text
✓ Inline loader during search
✓ Immediate debounced feedback

DITCH / DON'T

✗ Remove hover state — unnecessary
✗ Add scope/filter capability
✗ Distinguish global vs contextual
✗ Improve documentation (debounce, empty state)

ACCESSIBILITY

• role='searchbox' or 'combobox'
• Results: role='listbox'
• Announce result count
• Arrow keys, Enter, Escape

LIMITATIONS

• Global vs contextual needs visual distinction
• Scope/filter within search missing

WYSIWYG Toolbar

INTENT

Controls for formatting, structuring, and managing rich text content. Surfaces formatting without HTML/Markdown knowledge.

STATES

• Default — Tools in default state.
• Active format — Currently applied format clearly indicated.
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator. Arrow keys navigate.
• Disabled — Individual or entire toolbar.
• Collapsed — Overflow behind 'more' trigger.

VARIANTS

• Full toolbar — All options visible
• Minimal — Bold, italic, link, list only
• Floating — Appears on text selection

KEEP / NEED / DO

✓ Minimal tooltip-style works well
✓ Logical grouping of actions
✓ Keyboard accessible
✓ Example pairing with text area

DITCH / DON'T

✗ Fix: missing options (alignment, indent, attachment)
✗ Do NOT merge team presence into toolbar
✗ Use generic attachment, not image-specific
✗ Never hide core formatting
✗ Never disconnect toolbar from editor

ACCESSIBILITY

• role='toolbar' with aria-label
• Arrow keys within, Tab in/out
• Active states announced
• All tools need accessible labels

LIMITATIONS

• Define 'core' vs 'extended' features
• Responsive behavior needs spec

