# Docs Style Guide

A map of every document in the Design System project and the rules for using and changing them. Read this first. If a doc is added, merged, or deleted, update this file in the same change.

*Built from the project's document summaries and the current file list. Entries marked **Confirm** have not been checked against the file itself.*

---

## 1. Ground rules

1. **Real values beat documentation.** The token JSON files and the real CSS are the source of truth for values. If a doc disagrees with them, fix the doc in place. Do not defend the doc.
2. **Two update styles. Do not mix them.**
   - *Living reference* (`visual-design-decisions.md`): correct values in place. No dated entries, no stacked history.
   - *Dated log* (`design-system-project-knowledge.md`): add a new dated snapshot at the bottom. Include a precedence note saying which earlier snapshot it overrides.
3. **Who may edit.** Each entry below has an edit rule. "Claude may edit" means drafting and editing is fine. "Approval required" means propose the change and wait for a human yes. Claude should paste-in drafts for approval files, not rewrite them.

---

## 2. Project history, process, and decisions

| File | What it is | Use it when | Edit rule | Update style |
|---|---|---|---|---|
| `design-system-project-knowledge.md` | Running log of dated snapshots (July 11 to now): token architecture, team changes, sequencing, audit authority rules, finalized primitives, fluid typography decision and formulas | You need project history, the current status, or the reason a decision was made | Claude may edit | Dated log. Append a new snapshot with a precedence note |
| `DOCS_STYLE_GUIDE.md` | This file. Map of every document in the project and the rules for using and changing them | Starting any task. Read it first, and update it whenever a doc is added, merged, or deleted | Claude may edit | Living reference. Amend in place, never date |
| `TASKS.md` | Task list. Holds the component workflow and build order that used to be separate files | You need to know what to do next and who does it | Claude may edit | **Confirm** |

---

## 3. Visual decisions

| File | What it is | Use it when | Edit rule | Update style |
|---|---|---|---|---|
| `visual-design-decisions.md` | Rationale for color, buttons, effects, accessibility trade-offs, and Marketing palette alignment (§2.11). Includes hex values, per-state recipes, naming principles, and open items | Checking whether a color or button treatment is intentional, or why the product does not just match Marketing | Approval required | Living reference. Amend in place, never date |

Notes:

- Open items live in §7 of that file. "Not yet decided" means do not assume it is resolved.
- The Marketing decision record was merged into §2.11. Do not recreate it as a separate file.

---

## 4. Component requirements (behavior only, no visuals)

Claude may edit all of these. They describe what a component does, not how it looks. Each component entry covers intent, states, variants, do and don't rules, accessibility notes, and open questions.

| File | Covers | Use it when |
|---|---|---|
| `Components-Action - requirements.md` | Button, Split Button, Button Group, Link, Menu | Generating tokens for action components |
| `Components-Container-requirements.md` | Dialog, Card, Accordion, Drawer, Popover, Side Panel, Code Snippet | Generating tokens for containers |
| `Components-Data Entry requirements.md` | Input, Text Area, Number Input, Single-Select, Multi-Select, Toggle, Radio, Checkbox, Date Picker, Time Picker, Slider, File Upload, Search, WYSIWYG Toolbar | Generating tokens for form and input components |
| `Components-Feedback_and_Status-requirements.md` | Toast, Banner, Badge, Chip, Spinner, Skeleton, Progress Bar, Progress Circle, Avatar, Empty State | Generating tokens for feedback and loading components |
| `Components-Navigation and Structure-requirements.md` | Top Bar, Page Header, Sidebar Nav, Tabs, Breadcrumb, Pagination, Progress Steps, Table, Truncation, Data Metric | Generating tokens for navigation and data display |
| `Components-Missing Components and Patterns.md` | Gaps found against industry practice: Form Group, Data Table Toolbar, Infinite Scroll, Divider, Sticky Behavior | Checking what the core audit left out |

Do not merge these into one file. Each is long and organized by category on purpose.

---

## 5. Cross-component guidance

Claude may edit all of these.

| File | What it is | Use it when |
|---|---|---|
| `Components-Cross-Cutting Specifications.md` | System-wide rules: validation timing, focus, reduced motion, responsive breakpoints, RTL, theming, touch targets, z-index, scroll, state persistence, errors, content, shortcuts | A rule applies to every component |
| `Components-Decision Matrix and Relationships.md` | Decision trees for loading, overlays, selection controls, feedback, navigation. Lists deprecated and merged components and the final component count | Choosing between similar components, or confirming what is in scope |
| `Components-Additional Decision Trees.md` | Decision trees for form layout, data display, confirmation strategy, text input type, density | Layout and pattern choices beyond the core matrix |

---

## 6. Token files (data, not notes)

All of these require approval to edit. They are the source of truth for values (ground rule 1). Look values up here. Do not copy values into prose docs unless the doc is explaining a decision.

**Primitive tokens** (raw values, not used directly in components):

| File | Contains |
|---|---|
| `primitiveTokens-color.json` | White, black, Sage, Ink, Teal, Blue (7 steps), Red, Amber, Green |
| `primitiveTokens-gradient.json` | Four sage and white gradients. Export to Figma as Color Styles, since Variables do not support gradients |
| `primitiveTokens-typography.json` | Atkinson Hyperlegible Next, five font weights, eight font sizes on a 1.2 scale, two line heights, two text decorations |
| `primitiveTokens-dimension.json` | Space, radius, size, and border width scales, each with a zero value |
| `primitiveTokens-effect.json` | Opacity, blur, shadow ladder (0 to 400, plus 50), white glow |

**Semantic tokens** (role-based, mapped to primitives):

| File | Contains |
|---|---|
| `semanticTokens-color.json` | Roles for surfaces, content, status, borders, actions |
| `semanticTokens-effect.json` | Bevel shadow recipes per state for Primary, Secondary, Tertiary, Destructive, Navigation. Container glass, card, form section, and focus ring shadows |
| `semanticTokens-typography.json` | Text styles for headings, paragraphs, labels, tables, buttons, metrics, links, navigation |
| `semanticTokens-dimension.json` | Radius, control height, icon size, spacing |

---

## 7. Known conflicts to resolve

Do not fix these silently. Decide which side is right first.

1. **Inset naming for Navigation.** `visual-design-decisions.md` §4.5 uses "entry" for the 2,4 offset layer, but uses "entry" for the -2,-4 layer on Primary, Secondary, and Tertiary. The JSON matches the other tiers, so the Navigation labels in the doc are likely inverted.
2. **Re-check (may be fixed already):** component count (Decision Matrix says 42, the old workflow and build order docs said 48) and semantic token status (old workflow doc said semantics were still on the old visual language, the JSON uses the new palette). Both source docs were deleted. Confirm against `TASKS.md`.

---

## 8. Adding, merging, or retiring a doc

1. Check this guide for an existing home before creating a file.
2. Decisions go in the dated log or the living reference, not in a new file, unless the topic is large enough to stand alone.
3. When merging, move the content first, then delete the source, then update this guide.
4. Prefer the existing file naming pattern. Current files mix styles (`Components-Action - requirements.md` and `Components-Feedback_and_Status-requirements.md`). Pick one pattern for new files and consider renaming the old ones later.
5. Keep the edit rule and update style for the doc in the tables above.
