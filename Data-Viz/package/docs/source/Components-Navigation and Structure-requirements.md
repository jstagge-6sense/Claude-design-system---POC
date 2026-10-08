---
title: Navigation & Structure Audit
---

Navigation & Structure

Components for wayfinding, page structure, and organizing application-level layout.

Top Bar

INTENT

Persistent horizontal bar at the top of the application providing global navigation, user identity, and frequently used actions. The application's primary orientation point.

STATES

• Default — Visible at top of viewport. Contains logo, navigation, user avatar.
• Scrolled — Optional: needs a distinct scrolled state.
• With notification — Badge count on notification icon.
• Responsive — Collapses navigation behind hamburger on small viewports.

VARIANTS

• Standard — Logo + primary nav + search + user avatar
• With app switcher — Switching between product areas
• With notification center — Notification icon + badge count
• With global search — Integrated search in top bar

KEEP / NEED / DO

✓ Persistent area for global navigation and identity
✓ App switcher for multi-product navigation
✓ Correct menu patterns for profile/account (keyboard, focus, Escape)
✓ Announce dynamic updates (notifications, search results)
✓ Provide meaningful labels for all interactive elements

DITCH / DON'T

✗ Do NOT change navigation behavior between pages
✗ Do NOT hide critical actions behind unclear icons
✗ Do NOT make header taller without adding value
✗ Do NOT remove predictable navigation placement
✗ Do NOT use on single-purpose pages (landing, simple form)

ACCESSIBILITY

• Landmark: role='banner' or <header>
• Navigation within: role='navigation' with aria-label
• Skip navigation link as first focusable element
• Profile menu: keyboard accessible, Escape to close
• Notification count: aria-live for updates

LIMITATIONS

• Standardize top bar content and behavior across all products
• App switcher interaction pattern needs consistent documentation

Page Header

INTENT

Page-level header providing title, context, and page-specific actions. Sits below the top bar and above page content. Establishes what page the user is on and what they can do.

STATES

• Default — Title + optional breadcrumb + optional actions.
• With tabs — Page-level tab navigation below title.
• With description — Subtitle/description text.
• With actions — Primary/secondary action buttons.
• Loading — Skeleton for async page title.

VARIANTS

• Simple — Title only
• With breadcrumb — Hierarchical context above title
• With actions — Right-aligned action buttons
• With tabs — Sub-navigation within the page
• With metadata — Status badges, last-modified, owner info

KEEP / NEED / DO

✓ Consistent page identification
✓ Breadcrumb for hierarchical context
✓ Clear action placement (right-aligned)
✓ Works across product areas with consistent structure

DITCH / DON'T

✗ Fix: inconsistent button placement and count in headers
✗ Fix: inconsistent use of metadata (some headers have owner, some don't)
✗ Do NOT overload header with too many actions
✗ Do NOT inconsistently position search/actions
✗ Fix: no standard for tab placement within page header

ACCESSIBILITY

• Page title: <h1> or appropriate heading level
• Actions: clearly labeled, keyboard accessible
• Breadcrumb: <nav> with aria-label='Breadcrumb'
• Tab navigation: role='tablist' within header structure

LIMITATIONS

• Need to standardize which metadata belongs in page header vs page content
• Tab placement within header vs below header needs decision
• Action button limits per header need governance

Nav (Sidebar)

INTENT

Primary application navigation providing access to all major sections. Persistent vertical sidebar on the left edge of the application.

STATES

• Default — Visible sidebar with navigation items.
• Hover — Needs a distinct hover state.
• Active/Current — Clearly communicates currently selected page.
• Collapsed — Icon-only rail with tooltips.
• Expanded — Full labels visible.
• With nested items — Expandable sub-navigation.

VARIANTS

• Fixed — Always expanded with labels
• Collapsible — Toggle between expanded and icon-only rail
• With groups — Sections separated by headers or dividers
• With badges — Count indicators on items (notifications, tasks)
• With nested items — Expandable sub-sections

KEEP / NEED / DO

✓ Clear active/current page indication
✓ Consistent positioning (left side)
✓ Collapsible for space efficiency
✓ Group related navigation items
✓ Badge indicators for attention-worthy sections

DITCH / DON'T

✗ Fix: unclear distinction between nav and tree view — nav is for page navigation
✗ Fix: inconsistent styling and behavior across products
✗ Do NOT use nav for content organization — use accordion or tree
✗ Do NOT nest more than 2 levels deep

ACCESSIBILITY

• role='navigation' with aria-label='Main navigation'
• Current page: aria-current='page'
• Collapsed items: aria-label on icons
• Nested items: aria-expanded on parent
• Keyboard: Tab into nav, arrow keys between items

LIMITATIONS

• Nav vs Tree View: nav is for page navigation, tree is for content hierarchy (tree deprecated as standalone)
• Max nesting depth: 2 levels recommended

Tabs

INTENT

Organize related content into switchable panels within the same page context. Use to separate content that shares a relationship but doesn't need to be viewed simultaneously.

STATES

• Default — Tab bar with items. First or previously-selected tab active.
• Hover — Needs a distinct hover state.
• Active/Selected — Clearly communicates current tab.
• Focused — Needs a visible focus indicator.
• Disabled — Non-interactive.
• With badge — Count/status indicator on tab label.
• Scrollable — Horizontal scroll for many tabs.

VARIANTS

• Standard — Horizontal tab bar
• Filled — Alternative selected-tab treatment
• Compact — Smaller tab size for dense layouts
• With icon — Icon + label per tab
• With badge — Count or status per tab
• Vertical — Side-mounted tabs (rare, for specific layouts)
• Scrollable — Many tabs with scroll arrows

KEEP / NEED / DO

✓ Clear selected state
✓ Consistent tab positioning
✓ Badge/count support for attention indicators
✓ Keyboard navigable (arrow keys between tabs, Tab to panel)
✓ URL/deep-link support (tab state in URL)

DITCH / DON'T

✗ Tabs must look and function distinctly from button groups
✗ Compact tab variant blurs line with button group — need visual distinction
✗ Fix: inconsistent tab-to-panel association
✗ Do NOT use tabs for sequential steps — use progress steps
✗ Do NOT use for primary navigation — use sidebar nav

ACCESSIBILITY

• role='tablist' with role='tab' items and role='tabpanel'
• aria-selected on active tab
• Arrow keys navigate tabs, Tab moves to panel content
• Disabled tabs: aria-disabled='true' with explanation
• Tab panels lazy-loaded: announce when content loads

LIMITATIONS

• Compact tab vs button group: need clear visual and behavioral distinction
• Vertical tabs: document when appropriate (very rare use case)

Breadcrumb

INTENT

Shows the user's current location within the application hierarchy and provides navigation to parent levels. Answers 'Where am I?' at a glance.

STATES

• Default — Horizontal chain of links separated by dividers.
• Hover — Needs a distinct hover state on breadcrumb items.
• Current — Last item is plain text (not a link).
• Truncated — Middle items collapsed behind ellipsis (...).
• Focused — Needs a visible focus indicator on breadcrumb links.

VARIANTS

• Standard — Full path visible
• Truncated — Collapses middle items for deep hierarchies
• With icon — Home icon for root level
• Responsive — Collapses to show only parent + current on mobile

KEEP / NEED / DO

✓ Answers 'Where am I' simply
✓ Provides context about current location
✓ Easy jump to parent levels
✓ Use when content has ≥3 levels of hierarchy
✓ Useful when users arrive from search/external links
✓ Consistent positioning (top of page)

DITCH / DON'T

✗ Do NOT make current page clickable
✗ Do NOT confuse with primary navigation
✗ Do NOT make every item identical — current must be clearly distinguishable
✗ Do NOT truncate important levels (hiding meaningful context)
✗ Do NOT use for ≤2 hierarchy levels — adds clutter
✗ Avoid overly long trails — overwhelming to scan

ACCESSIBILITY

• <nav> with aria-label='Breadcrumb'
• <ol> for ordered path
• Current item: aria-current='page'
• Separator: decorative (aria-hidden='true')
• Each link must be descriptive out of context

LIMITATIONS

• Truncation strategy for deep hierarchies needs spec
• Responsive behavior (mobile/narrow viewport) needs definition

Pagination

INTENT

Navigate through large collections by dividing content into manageable pages while maintaining orientation and control.

STATES

• Default — Page numbers + prev/next + results count.
• Hover — Needs a distinct hover state on page numbers.
• Active/Current — Clearly communicates current page.
• Disabled — Prev disabled on page 1, Next on last page.
• Loading — Skeleton or spinner while new page loads.

VARIANTS

• Page numbers — Standard numbered pages
• Previous/Next — Simple forward/backward
• Truncated — Ellipsis for many pages (1 2 3 ... 98 99 100)
• With page size — Dropdown to change items per page
• With result count — 'Showing 1–20 of 500 results'
• Mini — Compact for limited space (prev/next only)

KEEP / NEED / DO

✓ Clear labels, easy to understand
✓ Consistent layout aligned with common practices
✓ User control over items per page
✓ Perfect workaround for slow page loads with large datasets
✓ Essential for: search results, admin tables, reports, file lists

DITCH / DON'T

✗ Do NOT use for tiny lists — unnecessary interaction
✗ Do NOT use when infinite exploration is the goal — use infinite scroll
✗ Do NOT lose user's scroll position when returning from detail view
✗ Do NOT show unclear result count
✗ Fix: inconsistent disabled vs hidden pagination elements
✗ Pagination should feel controlled and predictable, not like a maze

ACCESSIBILITY

• <nav> with aria-label='Pagination'
• Current page: aria-current='page'
• Disabled buttons: aria-disabled='true'
• Page changes: announce new page content to screen reader
• Keyboard: Tab between pagination controls

LIMITATIONS

• Disabled vs completely removing pagination elements: standardize
• Consider keyboard shortcuts for power users (Shift+Left/Right for prev/next page)

Progress Steps (Stepper)

INTENT

Communicates user's position within a multi-step process. Provides confidence about what's been completed, what's happening now, and what remains.

STATES

• Completed — Clearly communicates completion. Step label present. Clickable to go back.
• Active/Current — Clearly communicates current step.
• Upcoming — Clearly communicates not-yet-reached. Non-interactive until reached.
• Error — Step failed. Needs a distinct error state with error info.
• Disabled — Step not available in current flow.

VARIANTS

• Horizontal — Desktop workflows, checkout, setup flows
• Vertical — Long processes, mobile, sidebar placement
• Linear — Must complete in order
• Non-linear — Can jump between steps (rare)
• Compact — Numbers only, for limited space

KEEP / NEED / DO

✓ Use when task has multiple distinct stages
✓ Announce step changes to assistive tech
✓ Provide meaningful labels on each step
✓ Each state must be clearly distinguishable through multiple cues (completed, active, upcoming)
✓ Include text on steps — never icon-only

DITCH / DON'T

✗ Do NOT show progress when there's no real sequence
✗ Do NOT use too many steps (recommend max 5–7)
✗ Do NOT show no indication of completion
✗ Do NOT make future steps clickable if they require prior completion
✗ Do NOT block users from going backward
✗ Fix: inconsistent usage across products and in Figma
✗ Fix: same visualization for active and inactive — MUST differ

ACCESSIBILITY

• role='list' with role='listitem' per step, or aria-label on stepper
• Current step: aria-current='step'
• Completed steps: announced as complete
• Step changes announced via aria-live
• Keyboard: navigate between completed steps

LIMITATIONS

• Horizontal vs vertical: document when each is appropriate
• Why so many variants in Figma? Prune to essential set
• Non-linear stepping: document carefully or remove

Table

INTENT

The primary component for displaying structured, tabular data. Enables users to scan, sort, filter, select, and act on records. The most complex and highest-value data display component.

STATES

• Default — Headers + rows with data.
• Hover — Needs a distinct hover state on rows.
• Selected (single) — Single row selected. Clearly communicates selection.
• Selected (bulk) — Multiple rows selected. Bulk action bar appears.
• Sorting — Column header shows sort direction (asc/desc).
• Loading — Row skeleton or spinner.
• Empty — Empty state with guidance.
• Error — Row-level or table-level error state.

VARIANTS

• Standard — Sortable columns, selectable rows
• With pagination — For large datasets
• With filters — Column or header-level filtering
• With bulk actions — Checkbox selection + action bar
• With inline editing — Editable cells
• With expandable rows — Row drill-down
• Compact/Dense — Reduced row height for data-heavy views
• With column customization — Show/hide/reorder columns

KEEP / NEED / DO

✓ Single/bulk selection with clear states
✓ Sortable columns with direction indicator
✓ Filterable (standardize with Filters component)
✓ Pagination for large datasets
✓ Inline editing where appropriate
✓ Row expansion for detail preview

DITCH / DON'T

✗ Fix: character limit handling in table cells inconsistent
✗ Fix: inconsistent table loader sizes
✗ Fix: column header text not prominent enough
✗ Fix: secondary text indistinct from default
✗ Fix: table column scaling not standardized
✗ Fix: cell size standards not defined
✗ Fix: universal pattern for showing disabled/enabled in lists

ACCESSIBILITY

• <table> with <thead>, <tbody> semantics
• Sortable columns: aria-sort='ascending'/'descending'/'none'
• Selectable rows: checkboxes with aria-label per row
• Bulk selection: announce count selected
• Column headers: <th> with scope='col'
• Pagination: connected to table via aria-describedby

LIMITATIONS

• Table will take longest to build — plan accordingly
• Column scaling strategy needs spec (fixed, fluid, min/max)
• Inline editing patterns need detailed spec
• Filters: consolidate with table filters into design system

Truncation + Ellipsis

INTENT

Pattern for handling text overflow when content exceeds available space. Not a component but a cross-cutting behavior specification that applies to any text-containing component.

STATES

• Truncated — Text cut with '...' at end. Full text available via tooltip/popover.
• Expanded — Full text visible (on hover, click, or by default).
• Multi-line truncation — Content cut after N lines.

VARIANTS

• Single-line — Overflow hidden with ellipsis at end
• Multi-line (line clamp) — Cut after 2–3 lines with ellipsis
• Middle truncation — For file paths, URLs (show start + end)
• Expandable — Click/hover to reveal full text

KEEP / NEED / DO

✓ Consistent truncation behavior across all components
✓ Full text always accessible (tooltip, expand, or detail view)
✓ Middle truncation for paths/URLs where end matters

DITCH / DON'T

✗ Do NOT truncate critical information without reveal mechanism
✗ Do NOT truncate short text that could fit with minor layout adjustment
✗ Do NOT rely solely on tooltip for truncated content (touch devices)

ACCESSIBILITY

• Truncated text: aria-label with full text content
• Tooltip/expand mechanism accessible by keyboard
• Do NOT truncate screen-reader output — announce full text

LIMITATIONS

• Standard truncation thresholds (characters, lines) per component need definition
• Touch device strategy for revealing truncated text (no hover available)

Data Metric

INTENT

Standardized display for KPI, metric, or statistical value. Surfaces a single quantitative data point with optional trend indicator and comparison context.

STATES

• Default — Value displayed with label.
• Positive trend — Upward trend indicator.
• Negative trend — Downward trend indicator.
• Neutral — No trend change.
• Loading — Skeleton or spinner.
• Error — Error indicator with retry option.

VARIANTS

• Simple — Label + value
• With trend — Value + direction indicator + percentage change
• With comparison — Value vs. previous period
• With sparkline — Mini chart showing trend over time
• Compact — For dense dashboard layouts

KEEP / NEED / DO

✓ Consistent indicator treatment for trends
✓ Clear label describing what the metric measures
✓ Comparison context (vs. last period, vs. target)
✓ Standardized formatting (numbers, percentages, currency)

DITCH / DON'T

✗ Do NOT use inconsistent trend indicators across products
✗ Do NOT show metrics without clear labels
✗ Do NOT rely on a single visual property for trend direction — use multiple cues

ACCESSIBILITY

• Metric value: semantically marked up, not just visual
• Trend direction: described in text (not color alone)
• Screen reader: announce metric name, value, and trend together
• Live regions for real-time updating metrics

LIMITATIONS

• May overlap with Card (metric card variant) — reconcile
• Charts/graphs separated into own project — Data Metric is the atomic unit

