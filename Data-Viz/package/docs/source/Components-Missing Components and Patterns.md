---
title: Missing Components & Patterns
---

Missing Components & Patterns

Components and cross-cutting patterns identified as gaps against industry best practices.

Form Group

INTENT

Organizes form fields into a cohesive, validated unit. Handles form-level layout, validation summary, field grouping, and submit patterns. The missing orchestration layer above individual inputs.

STATES

• Default — Form fields visible, ready for input.
• Validating — Async validation in progress (submit button loading).
• Error — Validation summary visible at top. Individual field errors shown inline.
• Submitting — Form locked, submit button loading.
• Success — Confirmation (typically navigates away or shows toast).
• Dirty — Unsaved changes present. Warn on navigate-away.

VARIANTS

• Single section — Simple form
• Multi-section — Fieldsets with section headers
• Inline — Fields within page content (settings rows)
• Wizard — Multi-step with progress steps

KEEP / NEED / DO

✓ Validation summary at form top after failed submission
✓ Focus first error field after validation
✓ Mark optional fields with "(optional)" when most are required
✓ Auto-save for long forms (> 5 minutes estimated completion)
✓ Warn on unsaved changes when navigating away
✓ Button placement: consistent across all forms

DITCH / DON'T

✗ Do NOT validate untouched fields
✗ Do NOT clear errors until the user has fixed the value
✗ Do NOT use multi-column layouts unless for paired fields only (city/state, first/last name)
✗ Do NOT rely solely on inline errors — form-level summary needed for 5+ field forms

ACCESSIBILITY

• <form> element with aria-label
• Validation summary: role='alert' or aria-live='assertive'
• Error fields: aria-invalid='true' + aria-describedby linked to error message
• Required: aria-required='true' + visible indicator
• Navigate-away warning: accessible dialog, not browser confirm()

LIMITATIONS

• Auto-save strategy needs detailed spec (frequency, conflict resolution)
• Button placement (left vs right aligned) needs final decision

Data Table Toolbar

INTENT

Action bar for table-level operations: column configuration, export, density toggle, filter controls, bulk action bar, and search within table. Centralizes table controls above the data.

STATES

• Default — Toolbar visible with standard actions (search, filter, column config, export).
• Filtered — Active filter count shown. Clear-filters action available.
• Bulk selection active — Bulk action bar replaces or augments toolbar. Selection count shown.
• Search active — Search field expanded in toolbar.

KEEP / NEED / DO

✓ Consistent placement above table
✓ Filter count indicator when filters are active
✓ Bulk action bar appears on row selection
✓ Column show/hide and reorder accessible from toolbar
✓ Export in consistent location

DITCH / DON'T

✗ Do NOT scatter table actions across the page — centralize in toolbar
✗ Do NOT hide search behind icon when space allows
✗ Do NOT show bulk actions when nothing is selected

ACCESSIBILITY

• role='toolbar' with aria-label
• Filter count announced to screen reader
• Bulk action bar: announce selection count
• All toolbar actions keyboard accessible

Infinite Scroll

INTENT

Automatically loads more content as the user scrolls. Use for exploratory, feed-like content where users browse without specific targets. Not a replacement for pagination in structured data.

STATES

• Idle — Content loaded, user has not scrolled to threshold.
• Loading — Spinner at bottom while fetching next batch.
• Loaded — New content appended seamlessly.
• End of content — "You've reached the end" indicator.
• Error — "Failed to load more. Tap to retry."

KEEP / NEED / DO

✓ "Load more" button as fallback / alternative to auto-load
✓ Show total count if known ("Showing 40 of 200")
✓ Skeleton placeholders for loading slots
✓ Persist scroll position on back-navigation

DITCH / DON'T

✗ Do NOT use for structured data requiring comparison (use table + pagination)
✗ Do NOT use when users need to reach footer content (footer becomes unreachable)
✗ Do NOT use for small datasets (< 50 items)
✗ Do NOT steal focus when new content loads

ACCESSIBILITY

• aria-live='polite' announces when new content loads
• "Load more" button always available as keyboard alternative
• End of content: announce to screen reader
• Focus management: don't move focus on auto-load

Divider

INTENT

Visual separator between content sections or list items. Provides structure without interactive behavior.

VARIANTS

• Horizontal — Between stacked sections
• Vertical — Between side-by-side elements
• With label — Centered text within divider ("OR", section name)
• Inset — Indented to align with content, not container edges

KEEP / NEED / DO

✓ Use sparingly — whitespace is usually sufficient
✓ Consistent weight and spacing system-wide
✓ Inset dividers align with content, not container edges

ACCESSIBILITY

• role='separator' when semantically meaningful
• aria-hidden='true' when purely decorative

Sticky Behavior (Cross-Cutting Pattern)

INTENT

Pins elements to viewport edges during scroll. Applies to table headers, page headers, toolbars, and navigation.

WHERE TO APPLY

• Table column headers — Stick on vertical scroll
• Table first column — Stick on horizontal scroll (wide tables)
• Page header — Optional: stick on scroll, collapse to compact form
• Data table toolbar — Stick when table is partially scrolled
• Sidebar nav — Stick within viewport (independent scroll)

KEY RULES

• Sticky elements must not obscure more than 20% of viewport height.
• On mobile: reduce sticky height (collapse page header, hide toolbar until scroll-up).
• Sticky elements need a visible boundary to distinguish from scrolling content.
• Test: sticky elements within scrollable containers may not behave as expected — test nested scroll contexts.

