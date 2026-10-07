---
title: Feedback & Status Components Audit
---

Feedback & Status Components

Components that communicate system state, operation results, loading progress, and user attention.

Toast

INTENT

Brief, non-blocking notification confirming a completed action or surfacing non-critical information. Appears temporarily and auto-dismisses.

STATES

• Visible — Toast appears. Auto-dismiss timer active.
• Hover — Timer pauses (user is reading).
• With action — Undo/Retry action link visible.
• Dismissing — Toast disappears.
• Stacked — Multiple toasts queue vertically (max 3 visible).

VARIANTS

• Info — Neutral confirmation: 'Settings saved'
• Success — Positive outcome: '3 workflows published'
• Warning — Caution without blocking: 'API rate limit approaching'
• Error — Failed action with retry: 'Export failed. Retry'

FEATURES:
• With action (Undo, Retry, View)
• Smart aggregation: '3 workflows published' instead of 3 separate toasts
• Auto-dismiss timing: 5s default, 8s with action, persistent for errors

KEEP / NEED / DO

✓ Document toast duration standards
✓ Smart aggregation (batch similar notifications)
✓ When to use 1 vs 2 toasts (never repeat same message)
✓ Alert escalation: define when toast becomes banner
✓ Notification priority: Error > Warning > Success > Info

DITCH / DON'T

✗ Ditch use case where user action is required — use banner instead
✗ Fix inconsistent typography (bold/not bold)
✗ Stop repeating same toast while previous is visible
✗ Remove variant with image — no valid use case
✗ Fix inconsistent iconography across severity levels

ACCESSIBILITY

• role='status' or role='alert' (for errors)
• aria-live='polite' (info/success) or 'assertive' (error)
• Toast must remain visible long enough for screen reader
• Action links must be keyboard focusable
• Ensure information available elsewhere if toast is missed

LIMITATIONS

• Standard Undo/Retry action patterns need documentation
• Close button: team question on whether needed (recommend: only for error/persistent toasts)

Banner (Alert + Banner — Merged)

INTENT

Persistent, contextual message communicating important information, warnings, or required actions. Unlike toast, banners persist until dismissed or resolved. Merges former 'Alert' and 'Banner' components.

STATES

• Visible — Banner displayed at designated placement level.
• With action — CTA button or link for user to act.
• Dismissible — Close button available (not for critical/P1).
• Collapsed — Multi-banner stacking with count indicator.

VARIANTS

SEVERITY:
• Info (P4) — FYI information.
• Success — Positive confirmation.
• Warning (P3) — Recommended action.
• Error/Danger (P1-P2) — Critical. System outage, blocked workflow.

PLACEMENT:
• Global — Top of application. System-wide issues.
• Page-level — Top of page content. Page-specific context.
• Section-level — Within a content section. Contextual.
• Inline — Adjacent to specific element. Field-level.

RULE: Only ONE P1 (critical) banner at a time.

KEEP / NEED / DO

✓ Link support in small alert variant
✓ Standardize link placement and typography (underline, arrow, inline)
✓ Priority system: P1 (system outage) → P2 (blocked) → P3 (recommended) → P4 (FYI)
✓ Placement standardization across levels
✓ Character count guidance for conciseness

DITCH / DON'T

✗ Limit banners per page — information overload risk
✗ Fix: over-reliance on a single severity level creates sameness
✗ Fix: inconsistent treatments across severity levels
✗ CTA needs to be more prominent/clear for actionable banners
✗ Do NOT split sentences across header and body

ACCESSIBILITY

• role='alert' for error/warning, role='status' for info/success
• Do not rely on color alone — use icon + text + color
• Dismissible banners: close button with accessible label
• Focus management: critical banners should receive focus

LIMITATIONS

• Checkbox-in-alert pattern needs evaluation (compliance use case)
• Center-aligned variant use case unclear — document or remove
• When to use header-only vs body-only vs both needs clear rules

Badge

INTENT

Non-interactive label that surfaces important metadata or status related to an object. Communicates type, category, status, or count at a glance.

STATES

• Static — Always visible, non-interactive.
• Dynamic — Count or status updates (e.g., notification count).

NOTE: Badges are NOT interactive. They display information only.

VARIANTS

• Status — Active, Inactive, Pending, Error
• Category — Type/feature classification
• Count — Numeric indicator (notification count)
• New/Beta — Feature moniker
• With leading icon — Status + icon for clarity

RULES:
• 1–2 words maximum
• Consistent capitalization (decide: 'New' vs 'NEW')
• Light/dark mode guidelines required

KEEP / NEED / DO

✓ Ensure badges are non-interactive
✓ Light/dark mode guidelines
✓ Keep to 1–2 words
✓ Capitalization standardization needed
✓ Consistent New/Beta moniker treatment

DITCH / DON'T

✗ Badge is overused — audit every usage for necessity
✗ Do NOT use for long text or notifications (use toast/banner)
✗ Do NOT use red badges for info-only content
✗ Do NOT expect users to know what each color means — pair with text
✗ Do NOT use avatar variant unless specific use case confirmed
✗ Fix inconsistent styling for same statuses across products

ACCESSIBILITY

• Never rely on color alone — icon + text + color
• Dynamic badges: aria-live for count changes
• Ensure underlying meaning clear to assistive tech
• Consider users with color blindness or memory disabilities

LIMITATIONS

• Badge vs Tag/Chip/Status Indicator distinction needs documentation
• Badge Group vs Alert: when to use which
• Dynamic badge behavior (counts, active badges) needs spec

Chip

INTENT

Compact, interactive element representing a user-generated input, selection, or filter. Always tied to a user action — unlike badge which is system-generated.

STATES

• Default — Chip visible with text (+ optional icon/avatar).
• Hover — Needs a distinct hover state.
• Focused — Needs a visible focus indicator.
• Selected — For choice chips, clearly communicates selection.
• Dismissible — Close button (×) visible and interactive.
• Disabled — Non-interactive.

VARIANTS

• Dismissible — User can remove (multi-select results, filter tags)
• Choice — User selects from chip set (filter categories)
• View-only — Non-interactive display (specs, tags)
• With icon/avatar — Leading visual element

Usage patterns:
• Multi-select results as dismissible chips
• Filter tags (individually and bulk dismissible)
• Category/company tags
• Non-interactive specifications

KEEP / NEED / DO

✓ Industry-standard form and function
✓ Dismissible individually AND bulk ('Clear all')
✓ Can be used with icon/avatar + text
✓ Always tied to user input
✓ Can be used in multi-select and filter patterns

DITCH / DON'T

✗ Do NOT use for system-generated status — use badge
✗ Do NOT use icon/avatar without text
✗ Do NOT use in place of small buttons
✗ Fix: Select_Chip, Chip_Choice, Chip_Dismissible should be ONE component with variants
✗ Fix: inconsistent font weights within same component
✗ Fix: some products still using old chips — enforce migration

ACCESSIBILITY

• Dismissible chips: close button has 'Remove [text]' label
• Choice chips: aria-pressed or aria-selected
• Chip sets: role='group' with descriptive aria-label
• Minimum touch target must meet accessibility standards, including close button

LIMITATIONS

• Naming should follow industry standard — audit Select_Chip vs Chip_Choice
• Unique use cases for chips need documentation (what jobs-to-be-done)

Spinner

INTENT

Communicates that the system is processing. Use for short waits (<10s) where content structure is unknown. For longer waits, use progress indicator. For known structure, use skeleton.

STATES

• Active — Processing indicator visible. Optional label text.
• With label — 'Loading...' or contextual message.
• Inline — Within a specific element (button, table cell, dropdown).
• Overlay — Blocks interaction on parent area.

VARIANTS

• Inline — Within a field, row, or small container
• Button spinner — Replaces button label during async action
• Section/page — Centered in loading area
• Overlay — Full-section blocking with scrim
• With loading text — Contextual message

KEEP / NEED / DO

✓ Use for operations under 10 seconds
✓ Contextual placement (inline where possible)
✓ Button spinner preserves button width
✓ Conveys 'system is working, please wait'

DITCH / DON'T

✗ Do NOT use for fast operations (<300ms)
✗ Do NOT use for structured content — use skeleton
✗ Do NOT use for background tasks that don't block user
✗ Fix: inconsistent loading text ('Loading…' vs no text)
✗ Fix: multiple spinners in same dropdown — use ONE
✗ Fix: different styles/sizes across products — standardize

ACCESSIBILITY

• role='status' with aria-label describing what's loading
• aria-busy='true' on container being loaded
• aria-live='polite' for loading text
• Respect prefers-reduced-motion

LIMITATIONS

• Standardize spinner sizes: small (inline), medium (section), large (page)
• Decide: always include loading text or only for long operations?

Skeleton Loader

INTENT

Loading indicator that mimics incoming content structure. Creates illusion of faster loading. Use when content structure is known and loading time is short-to-moderate.

STATES

• Loading — Animated placeholder shapes mimicking content structure.
• Loaded — Content replaces skeleton (smooth transition).

VARIANTS

• Text skeleton — Lines mimicking text blocks
• Card skeleton — Card shape with placeholder areas
• Table skeleton — Row/column grid structure
• Custom layout — Matches specific page layout

RULE: Animation must feel calm and unobtrusive.

KEEP / NEED / DO

✓ Mimics incoming content structure
✓ Creates faster perceived loading
✓ Use when multiple items load at once (avoids multiple spinners)
✓ Match the actual layout being loaded
✓ Use for short loading states, similar to loading indicator duration

DITCH / DON'T

✗ Do NOT over-complicate skeleton shapes
✗ Do NOT show skeleton together with spinners
✗ ALL skeletons should look and function the same across products
✗ Use simple page layout placeholders — don't overwhelm

ACCESSIBILITY

• aria-busy='true' on skeleton container
• aria-label='Loading content'
• Screen reader: announce when content is loaded
• Respect prefers-reduced-motion (pause animation)

LIMITATIONS

• Consider combining Skeleton, Spinner, Progress Indicator into a 'Loading' component family
• Loading Grid: standardize grid-specific skeleton patterns

Progress Indicator (Bar)

INTENT

Communicates status of an ongoing process with measurable progress. Use when action takes >10 seconds and progress can be quantified.

STATES

• Determinate — Progress communicated proportional to completion percentage.
• Indeterminate — Communicates ongoing progress for unknown duration.
• Complete — Full completion, success state.
• Error — Progress stopped, error state with message.

VARIANTS

• Linear bar — Horizontal progress fill
• With percentage label — Shows numeric completion
• With status text — Contextual message about current step
• Multi-step — Series of tasks in one action

NOTE: Rename consideration — 'Progress Indicator' vs 'Progress Bar' for clarity

KEEP / NEED / DO

✓ Use when action takes >10 seconds
✓ Use for series of tasks in one action
✓ Provide contextual status text (what's happening now)
✓ Use when informing users with more context than a spinner provides

DITCH / DON'T

✗ Do NOT use static indicators (text saying 'loading...')
✗ Do NOT use when wait is too short to read content
✗ Do NOT make up percentages — if unmeasurable, use indeterminate
✗ Do NOT say 'do not click again'
✗ Avoid excessive motion that distracts

ACCESSIBILITY

• role='progressbar' with aria-valuemin/max/now
• aria-label describing what's progressing
• Labels clearly demonstrate what is happening
• Use more than color and shape to show progress

LIMITATIONS

• Naming: consider 'Progress Bar' to distinguish from spinner/skeleton family
• Need clear rules: spinner vs skeleton vs progress bar decision tree

Progress Circle

INTENT

Circular progress indicator showing completion of a specific metric or process. Use for displaying completion percentage in a compact visual.

STATES

• Determinate — Progress communicated proportional to value.
• Complete — Full completion, success.
• With label — Percentage or fraction displayed.

VARIANTS

• Standard — Circle with percentage
• With center label — Value, fraction, or icon
• Small — Compact for dashboard cards
• Large — Prominent feature display

KEEP / NEED / DO

✓ Effective for showing completion at a glance
✓ Works well in dashboard/metric contexts
✓ Progress levels clearly distinguishable

DITCH / DON'T

✗ Do NOT use for loading states — use spinner or progress bar
✗ Ensure adequate size for readability
✗ Do NOT rely on color alone for progress communication

ACCESSIBILITY

• role='progressbar' with aria-valuemin/max/now
• Center label provides accessible text
• Announced by screen reader with context

LIMITATIONS

• Consider if this should be a variant of Progress Indicator or standalone
• Questions raised about whether this component is needed at all — evaluate usage

Avatar

INTENT

Visual representation of a user identity. Provides consistent entry point for account-related actions and user recognition in collaborative contexts.

STATES

• Image — User photo displayed.
• Initials — First/last initial displayed.
• Placeholder — Generic person icon (fallback).
• With status — Online/offline/busy indicator.
• With dropdown — Opens profile/account menu on click.

VARIANTS

• Image / Initials / Placeholder — Based on available data
• With dropdown menu — Profile, settings, sign out
• In lists/tables — Ownership, assignment, collaboration
• Sizes: Small, Medium, Large, XL

KEEP / NEED / DO

✓ Consistent user identity in header
✓ Access to profile and account actions
✓ User ownership in lists, comments, assignments
✓ Initials for recognizability (better than generic icon)

DITCH / DON'T

✗ Do NOT use for companies, accounts, or generic entities
✗ Do NOT use for decoration
✗ Fix: inconsistent avatar sizes across products
✗ Fix: inconsistent dropdown content and interactions
✗ Fix: ABM uses generic icon where SI uses initials — standardize to initials

ACCESSIBILITY

• Avatars help users with text-recognition difficulties
• Avatars without paired text may hinder image-recognition difficulties
• Always pair with accessible name (alt text or aria-label)
• Dropdown menu: keyboard accessible, Escape to close

LIMITATIONS

• Low-contrast default company avatars: helpful or unhelpful? (First thing user sees for accounts)
• Avatar doesn't appear in My Profile page — should it?

Empty State

INTENT

Communicates why content is absent and guides users toward resolution. Turns a potentially frustrating dead-end into an actionable moment.

STATES

• First use — Welcome state, onboarding guidance.
• No results — Search/filter returned nothing. Show suggestions.
• Error — Data failed to load. Show retry action.
• No data — Legitimate empty (no items created yet). Show creation CTA.
• No permission — Access restricted. Show who to contact.

VARIANTS

• With illustration (Revvy mascot) — Delightful, for larger areas
• With CTA button — Actionable resolution path
• With description — Explains why and what to do
• Minimal — Text only, for compact areas

RULE: Every empty state MUST provide a path forward.

KEEP / NEED / DO

✓ Delight user with Revvy where space allows
✓ Help user overcome empty state with actionable workarounds
✓ Explain in actionable manner (not just 'No data found')
✓ Use CTA buttons AND clickable links for workarounds
✓ Use both visual and textual cues

DITCH / DON'T

✗ NEVER leave user in dead end without workaround
✗ Do NOT repeat same explanation — be specific
✗ Do NOT omit text or imagery
✗ Do NOT ignore the 'Why' behind the empty state
✗ Fix: inconsistent across and within products
✗ Fix: some empty states have CTAs, others don't — all should

ACCESSIBILITY

• Empty states with only images exclude users with image disabilities
• Empty states with only text exclude users with reading disabilities
• Always combine image/illustration + text + action
• CTA buttons must be keyboard accessible

LIMITATIONS

• Guidance needed on where to use/not use Revvy illustration
• Business concern: poor empty states hurt adoption and proof of value
• Need to document what constitutes 'actionable' vs 'redundant' messaging

