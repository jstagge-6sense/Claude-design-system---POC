---
title: Decision Matrix & Relationships
---

Decision Matrix & Component Relationships

Quick-reference decision trees and disambiguation guides for commonly confused components.

Loading States — When to Use What

DECISION TREE

Is the content structure known?
  YES → Is load time < 5 seconds?
    YES → Skeleton Loader (mimics layout)
    NO → Progress Bar with status text
  NO → Is the wait < 300ms?
    YES → No loading indicator needed
    NO → Is the wait < 10 seconds?
      YES → Spinner (with optional label)
      NO → Progress Indicator with contextual messaging

KEY RULES:
• Never show spinner + skeleton together
• Never show multiple spinners in the same container
• Always include contextual text for waits > 5 seconds
• For button actions: use inline button spinner (preserves width)

Overlays — Dialog vs Drawer vs Side Panel

DECISION TREE

Does the user need to see the page behind?
  NO → Is it a simple confirmation or short form?
    YES → Dialog (Modal)
    NO → Are they completing a multi-step workflow?
      YES → Navigate to a new page
      NO → Dialog (Large variant)
  YES → Is the content persistent/always-available?
    YES → Side Panel (collapsible rail when closed)
    NO → Drawer (temporary slide-in surface)

KEY RULES:
• Dialog: blocks page. Use for confirmations, short forms, critical info.
• Drawer: temporary secondary workspace. Context preserved.
• Side Panel: persistent secondary surface. State preserved when collapsed.
• NEVER stack overlays (dialog on dialog, drawer on drawer).
• If content requires scrolling heavily, consider using a new page.

Selection Controls — Which Input to Use

DECISION TREE

How many options exist?
  2 (binary) → Is it an instant on/off setting?
    YES → Toggle
    NO → Is it a form field requiring submission?
      YES → Checkbox (single) or Radio (if one must be chosen)
      NO → Toggle
  3–7 → Should all options be visible?
    YES → Do users choose exactly one?
      YES → Radio Group
      NO → Checkbox Group
    NO → Single-Select (dropdown)
  8+ → Do users choose exactly one?
    YES → Single-Select (with search)
    NO → Multi-Select (with search + chips)
  
2–5 + visual grouping → Button Group (selection mode)

KEY RULES:
• Toggle = instant effect (no save button)
• Checkbox = requires form submission
• Radio = mutually exclusive, all visible
• Select = too many options to show inline
• Multi-Select = multiple from large list
• Button Group = compact toggle between views/modes

User Feedback — Toast vs Banner vs Dialog

DECISION TREE

Does the user NEED to take action?
  NO → Is it confirming a completed action?
    YES → Toast (auto-dismisses, 5 seconds)
    NO → Is it persistent context?
      YES → Banner (Info level, dismissible)
      NO → Toast
  YES → Is it critical/blocking?
    YES → Is the action simple (confirm/cancel)?
      YES → Dialog (confirmation variant)
      NO → Banner (Error level, persistent, with CTA)
    NO → Banner (Warning level, with action link)

PRIORITY ESCALATION:
P1 (Critical) → Persistent Banner (Error). Only 1 at a time.
P2 (Blocking) → Persistent Banner (Warning). CTA required.
P3 (Important) → Dismissible Banner or Toast with action.
P4 (Info) → Toast. Auto-dismiss.

KEY RULES:
• Toast: ephemeral, non-blocking, auto-dismiss
• Banner: persistent until dismissed/resolved, contextual
• Dialog: interrupting, requires user response
• Toast → Banner: when action is needed
• Banner → Dialog: when action is critical and must be acknowledged

Navigation Pattern — When to Use What

DECISION TREE

What level of navigation?
  Application-wide sections → Sidebar Nav (persistent left rail)
  Within a page → Tabs (horizontal panel switching)
  Hierarchical position → Breadcrumb (parent trail)
  Large result sets → Pagination (page-by-page browsing)
  Multi-step process → Progress Steps (linear workflow)
  Global utilities → Top Bar (identity, search, settings)

DISAMBIGUATION:
• Nav vs Tree View: Nav navigates between pages. Tree View browses hierarchical content (deprecated as standalone).
• Tabs vs Button Group: Tabs switch content panels. Button Group toggles modes or filters.
• Breadcrumb vs Tabs: Breadcrumb shows hierarchy depth. Tabs show peer-level content.
• Pagination vs Infinite Scroll: Pagination for structured data (tables, search). Infinite scroll for exploratory browsing.

Deprecated Components

DO NOT USE — REMOVED FROM DESIGN SYSTEM

COMPONENT                  REASON                                          REPLACEMENT
Range Slider               Two endpoints in one control is confusing         Two Number Inputs
Carousel                   Not appropriate for data-focused workflows        Card grid or table
Tree View (standalone)     Overlaps with Nav; unclear distinction            Nav with nested items
Pendo Guides               Third-party integration, not a DS component       Popover + Banner patterns
List (standalone)          No active usage found in any product              Table (for structured data)
Circular Checkbox          Not in production anywhere                        Standard square checkbox
Link Button variants       Buttons trigger actions, links navigate           Button or Link (not hybrid)

Merged Components

CONSOLIDATED — FEWER COMPONENTS, CLEARER PURPOSE

MERGED INTO                   FROM                                    RATIONALE
Menu                          Dropdown + Select Menu                  Same interaction pattern, two modes (action/selection)
Banner                        Alert + Banner                          Same purpose, different placement levels
Popover                       Tooltip + Popover                       Same overlay pattern, two content modes (simple/rich)
Dialog                        Modal + Dialog Box                      Same interruption pattern, size/complexity variants
Side Panel                    Side Panel + Collapsible Panel          Same component with collapsible prop

Final Component Count

TOTAL COMPONENTS IN MINIMAL DESIGN SYSTEM: 42

Tier 1 (Critical — 12):   Button · Input · Menu · Table · Search · Dialog · Toast · Banner · Spinner · Skeleton · Top Bar · Page Header
Tier 2 (High Value — 18): Text Area · Number Input · Toggle · Radio · Checkbox · Date Picker · Tabs · Nav · Breadcrumb · Pagination · Card · Accordion · Drawer · Badge · Chip · Avatar · Empty State · Popover
Tier 3 (Specialized — 12): Split Button · Button Group · Link · Multi-Select · Time Picker · File Upload · Slider · WYSIWYG · Progress Steps · Progress Indicator · Side Panel · Code Snippet

Cross-cutting patterns (not components): Truncation + Ellipsis
Atomic data units: Data Metric · Progress Circle
Separate project: Charts / Graphs / Data Visualization

Components deprecated: 7
Components merged: 5 pairs → 5 singles
Net reduction from original ~87 components: ~40% fewer components

