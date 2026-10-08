---
title: Additional Decision Trees
---

Additional Decision Trees

Supplementary decision trees covering form layout, data display, confirmation strategy, text input selection, and density.

Form Layout — When to Use What

DECISION TREE

How many fields?
  1–3 → Single column, inline within content
  4–8 → Single column, dedicated form area
  9–15 → Single column with sections/fieldsets, or multi-step wizard
  15+ → Multi-step wizard (progress steps)

What field relationship?
  Independent fields → Single column
  Paired fields (first/last name, city/state) → Two-column for paired fields only
  Grouped fields → Fieldset with legend per group

KEY RULES:
• Default to single column — multi-column forms reduce completion rates.
• Use section headers / fieldsets for grouping, never columns.
• Button placement: pick left-aligned or right-aligned and standardize system-wide.
• Form-level validation summary at top after failed submit.
• Auto-save for forms that take > 5 minutes to complete.

Data Display — Table vs Cards vs List

DECISION TREE

Is the data structured with many comparable columns?
  YES → Table
  NO → Are items visually distinct (images, rich content)?
    YES → Card grid
    NO → Is it a simple list of homogeneous items?
      YES → List view
      NO → Table with expandable rows

How many items?
  < 10 → Show all (no pagination needed)
  10–100 → Pagination
  100+ → Pagination + search/filter. Consider virtual scrolling.
  Exploratory / feed content → Infinite scroll

KEY RULES:
• Table: best for comparison, sorting, bulk actions.
• Cards: best for browsing, visual content, heterogeneous items.
• List: best for sequential scanning, simple selection.
• Offer view toggle (table / card / list) when users have different mental models.

Confirmation Strategy — Before or After

DECISION TREE

Is the action reversible?
  YES → No confirmation needed. Use undo-via-toast (5–8 seconds).
  NO → Is it destructive (delete, remove, revoke)?
    YES → Dialog confirmation. Require typing to confirm for high-severity (delete account, remove all access).
    NO → Is it high-consequence (publish, send, charge)?
      YES → Dialog confirmation with summary of what will happen.
      NO → No confirmation. Toast feedback sufficient.

KEY RULES:
• Default to undo over confirmation — faster user experience.
• Confirmation dialog action text must match the action ("Delete Segment" not "OK").
• Bulk destructive actions: show count and sample ("Delete 47 segments? This cannot be undone.").
• Never ask "Are you sure?" — state what will happen.

Text Input Type — Which Component to Use

DECISION TREE

What is the user entering?
  Short text (name, email, ID) → Input
  Long text (description, notes) → Text Area
  Formatted text (rich content) → Rich Text Area + WYSIWYG Toolbar
  Code / technical content → Code Snippet (read-only) or dedicated code editor
  Numeric value → Number Input
  Search query → Search
  Date → Date Picker
  Time → Time Picker
  File → File Upload
  Password → Input (with visibility toggle)

KEY RULES:
• Match the component to expected content type.
• Never use text input where a constrained control (select, date picker) would reduce errors.
• Autocomplete attributes must match content type (email, tel, address, etc.).

Density — When to Use Compact vs Default vs Spacious

DECISION TREE

Who is the primary user?
  Power user / daily operator → Compact (small components, dense spacing)
  General user / occasional use → Default (medium components)
  New user / consumer-facing → Spacious (large components, generous spacing)

What is the content density?
  Data-heavy (tables, dashboards, admin) → Compact
  Mixed (standard CRUD, settings) → Default
  Content-focused (marketing, onboarding, landing) → Spacious

KEY RULES:
• Offer user-controlled density switching in data-heavy views.
• Never mix density levels within the same view/section.
• Compact density still requires minimum touch targets on touch devices.

