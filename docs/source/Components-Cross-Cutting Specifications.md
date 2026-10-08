---
title: Cross-Cutting Specifications
---

Cross-Cutting Specifications

Universal rules that apply across all components — validation, focus, motion, responsive, accessibility, and content.

Validation Timing Strategy

UNIVERSAL RULE

Standard validation timing for all form inputs:
• On blur (field exit) — Validate required fields and format constraints. Show error immediately.
• On change (while typing) — Only for character counters, real-time password strength, and search debounce. Never show errors while user is actively typing.
• On submit — Full form validation. Scroll to and focus the first error field. Show all errors simultaneously.
• After first error shown — Switch that field to on-change validation so errors clear as user fixes them.
• Async validation (username, email uniqueness) — Debounce 300–500ms after typing stops. Show inline spinner.

KEY RULES:
• Never validate an untouched field.
• Never clear an error that hasn't been fixed.
• Always provide a path to fix every error before re-submitting.
• Form-level validation summary required for forms with 5+ fields.

Focus Management

UNIVERSAL RULE

Where focus moves after key interactions:
• Dialog opens → Focus first interactive element (or close button if no form).
• Dialog closes → Return focus to the element that triggered it.
• Drawer opens → Focus first interactive element or heading.
• Drawer closes → Return focus to trigger.
• Toast appears → Do NOT steal focus. Toast is non-blocking.
• Inline error (on submit) → Move focus to first error field.
• Async loading completes → Return focus to initiating element, or first new content item.
• Accordion expands → Focus remains on trigger. Content scrolls into view if needed.
• Deletion → Focus moves to next sibling item, or previous if last was deleted.
• Tab trapping — Only Dialog and Drawer trap focus. Side Panel does NOT unless explicitly modal.

KEY RULES:
• Focus must never disappear (e.g., when focused element is removed from DOM).
• Focus must always be visible — never programmatically focus a non-visible element.
• After programmatic focus, the element must be scrolled into view.

Reduced Motion & Animation

UNIVERSAL RULE

Respect prefers-reduced-motion across all components:
• Toast: slide-in → instant appear/disappear.
• Drawer: slide transition → instant show/hide.
• Dialog: fade/scale → instant show/hide.
• Accordion: expand/collapse → instant toggle.
• Spinner: reduce or stop rotation. Show static "loading" indicator.
• Skeleton: pulse/shimmer → static placeholder.
• Progress bar: smooth fill → stepped fill.

KEY RULES:
• Functional animations (progress) reduce intensity, not removed entirely.
• Decorative animations (hover, micro-interactions) removed.
• Auto-dismissing toasts: extend duration when animation is reduced.
• Never use animation as the only indicator of state change.

Responsive Behavior

UNIVERSAL RULE

BREAKPOINTS: Mobile < 768 | Tablet 768–1023 | Desktop 1024–1439 | Wide ≥ 1440

COMPONENT ADAPTATIONS:
• Top Bar → Hamburger on mobile. Search collapses to icon.
• Sidebar Nav → Icon rail on tablet. Hamburger on mobile.
• Tabs → Scrollable on narrow viewports. Never wrap. Consider dropdown on mobile.
• Dialog → Full-screen on mobile. Overlay on tablet+.
• Drawer → Full-screen on mobile. Standard on tablet+.
• Table → Horizontal scroll. Pin first column. Consider card layout for simple data.
• Button groups → Stack vertically on mobile if exceeding container width.
• Page Header → Actions collapse to overflow menu on mobile.

KEY RULES:
• Never hide functionality on smaller viewports — restructure for the medium.
• Touch targets increase to minimum 48×48 on touch devices.
• Hover states must have equivalent focus/active states (no hover on touch).

RTL & Internationalization

UNIVERSAL RULE

• All layouts must mirror in RTL mode (reading direction, icon positions, navigation).
• Split Button chevron moves to left in RTL. Sidebar Nav moves to right edge.
• Breadcrumb separator direction reverses. Progress Steps direction reverses.
• Text expansion: allow 30–40% extra space for translated labels (German, Finnish longest).
• Number formatting: locale-aware grouping separators and decimal points.
• Date formatting: locale-aware (DD/MM/YYYY vs MM/DD/YYYY vs YYYY-MM-DD).
• Currency: locale-aware symbol placement and formatting.
• Pluralization: never concatenate strings — use ICU message format or equivalent.
• Icons with directional meaning (arrows, chevrons) must mirror. Symmetric icons do not.

Dark Mode / Theming

UNIVERSAL RULE

• All components must support light and dark themes at minimum.
• Focus indicators must be visible in all themes — test against both backgrounds.
• Error, warning, success, info semantic colors must have accessible contrast in all themes.
• Never hardcode colors — all values must reference semantic tokens.
• Disabled state must be distinguishable from default in all themes.
• Badge, chip, and status colors must maintain contrast ratios across themes.

Touch Targets

UNIVERSAL RULE

• All interactive elements: minimum 44×44 CSS pixels (WCAG 2.5.8 AA).
• Touch devices: recommend 48×48 minimum.
• Adjacent targets: minimum 8px gap between edges to prevent mis-taps.
• Icon-only buttons: visual icon can be smaller but hit area must meet minimums.
• Applies to: chip dismiss buttons, stepper buttons, pagination controls, breadcrumb links.
• Inline links within body text are exempt if line height provides adequate spacing.

Z-Index & Stacking Context

UNIVERSAL RULE

Layering hierarchy (lowest to highest):
• Base content: 0
• Sticky headers / table headers: 100
• Dropdowns / Menus / Popovers: 200
• Side Panel: 300
• Drawer: 400
• Dialog overlay + backdrop: 500
• Toast: 600
• Tooltip: 700

KEY RULES:
• Never use arbitrary z-index values. Use the defined tiers.
• Creating a new stacking context (transform, opacity animation) can break layering — test overlays within transformed parents.
• Tooltips always render on top of everything.
• Toasts always render above dialogs (error toasts must be visible with dialog open).

Scroll Management

UNIVERSAL RULE

• Dialog open → Lock body scroll. Restore on close.
• Drawer open → Lock body scroll if drawer blocks content. Do NOT lock if content remains interactive alongside.
• Side Panel → Never lock body scroll.
• Popover / Menu → Never lock body scroll.
• Return-from-detail-view → Restore scroll position to where user left the list.
• Pagination page change → Scroll to top of table/list container, not page top.
• Accordion expand → Scroll expanded content into view if it extends below viewport.
• Long dialog content → Scroll within dialog body. Header and footer remain fixed.

State Persistence

UNIVERSAL RULE

Which component states survive navigation:

PERSIST ACROSS NAVIGATION:
• Sidebar Nav collapsed/expanded state
• Table column configuration (show/hide, order, widths)
• Table sort and filter selections (within same session/context)
• User's preferred density/view mode (list vs grid)
• Search scope/filter preferences

RESET ON NAVIGATION:
• Dialog state (always closed on navigate)
• Drawer state (always closed on navigate)
• Toast queue (dismiss all on navigate)
• Form field values (unless draft/auto-save implemented)
• Scroll position (unless explicitly restored)

PERSIST ACROSS SESSIONS (local storage):
• Sidebar collapse preference
• Density preference
• Column configuration
• Theme preference (light/dark)

Error Handling Philosophy

UNIVERSAL RULE

Unified error approach:

SEVERITY → PATTERN:
• Field-level validation → Inline error below field (aria-describedby).
• Form-level validation → Summary at form top + inline per-field errors. Focus first error.
• Action failure (save, delete) → Toast with retry. If unrecoverable, Banner (Error).
• Page-level load failure → Empty state (Error variant) with retry CTA.
• System outage → Global Banner (P1, persistent, non-dismissible).
• Network offline → Global Banner with reconnection status.
• Timeout → Toast with retry. If repeated, Banner with help link.
• Partial failure (3 of 5 failed) → Toast with count + "View details" action.

KEY RULES:
• Every error must say: what happened, why (if known), and what to do next.
• Never show raw error codes or technical messages.
• Errors should be recoverable (retry, undo, edit, contact support).
• Active voice: "We couldn't save your changes" not "Changes could not be saved."

Content Guidelines

UNIVERSAL RULE

Standards for component text:

BUTTONS: Verb + noun: "Save Changes", "Create Segment". Not "OK", "Yes", "Submit".
LINKS: Describe destination: "View documentation". Never "Click here" or bare "Learn more".
ERRORS: [What happened] + [What to do]. "This email is already registered. Try signing in or use a different email."
EMPTY STATES: [Why empty] + [What to do]. "No segments yet. Create your first segment to start targeting."
DIALOGS: Title states the decision. Body provides context. Actions mirror the title.
TOASTS: Brief confirmation. "Segment saved" not "Your segment has been successfully saved."
LABELS: Sentence case everywhere. Title Case only for proper nouns and product names.
REQUIRED FIELDS: Mark optional fields with "(optional)" when most are required. Mark required when most are optional.

Double-Submit & Optimistic Updates

UNIVERSAL RULE

DOUBLE-SUBMIT PREVENTION:
• After any form submit or destructive action, disable the trigger and show loading state.
• Re-enable only after server response (success or failure).
• Never rely solely on frontend debounce — backend must also be idempotent.

OPTIMISTIC UPDATES:
• Use for low-risk, easily reversible actions: toggle, reorder, mark-as-read, pin.
• Do NOT use for: destructive actions, financial transactions, multi-step workflows.
• On failure: revert UI to previous state + error toast with explanation.
• Always pair with undo (toast with Undo action for 5–8 seconds).

Keyboard Shortcuts

UNIVERSAL RULE

Reserved global shortcuts:
• / → Focus search (when no input is focused)
• Escape → Close topmost overlay (dialog > drawer > popover > menu)
• Tab / Shift+Tab → Standard forward/reverse focus navigation
• Enter → Activate focused button/link
• Space → Toggle focused checkbox/toggle, activate focused button

Component-specific (document but don't enforce globally):
• Arrow keys → Navigate within composite widgets (tabs, menus, radios, tree, table rows)
• Home / End → Jump to first/last item in a list
• Page Up / Page Down → Scroll by viewport in long lists

KEY RULES:
• Never override browser defaults (Ctrl+C, Ctrl+V, Ctrl+Z).
• All keyboard shortcuts must have equivalent mouse/touch interactions.
• Shortcuts should be discoverable (? to show shortcut list).

