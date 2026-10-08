# Token changelog

Record every token add, rename, or removal, and the matching Figma change.

## Initial build
- Primitive tokens imported unchanged from project knowledge: color, gradient, typography, dimension, effect (131).
- Semantic tokens imported unchanged: color, typography, dimension, effect (109).
- Component tokens drafted for 51 components (see tokens/component/*.json). All drafts: Validate requirements is unchecked in TASKS.md, so none are signed off.
- Gaps are flagged with "$extensions.gap" and listed in dist/gaps.json and the preview Gaps page.

## Unreleased

- Token cleanup (source): removed 849 component pass-through tokens (CSS now references the semantic token directly), 19 same-role duplicate component tokens, and 4 unused semantic tokens (`core.dimension.space.none`, `core.effect.shadow.containerGlass`, `core.typography.greeting.1`, `core.typography.table.columnHeader`). 1,523 -> 651 tokens (primitive 132, semantic 113, component 406). Resolved values of every component CSS reference are unchanged (2,477 refs checked). Figma component-level variables for removed tokens go away on next sync.


- Gaps: added semantic borderWidth.thin/medium/thick, radius.pill, size.feedback.medium/large, color content.brand, a mono font family and typography.code.1. Open gaps 101 to 15.
- Conflict C-1 resolved: eight semantic Ink tokens (border.subtle/standard/strong/disabled/control.default, surface.control.disabled, surface.scrim, action.compact.hover) now carry their documented opacity. Component tokens reference them directly. Dark overrides carry the same opacity. build-modes.mjs accepts rgba({color},{opacity}) in overrides.
- Compression: merged 55 same-role duplicate component tokens. Lean set 756.
