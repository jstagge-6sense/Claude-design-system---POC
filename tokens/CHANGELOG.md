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

## Motion pilot (Drawer, Menu)

- New primitives: `core.motion.duration.{fast,base,slow}`, `core.motion.easing.{standard,enter,exit}`, `core.motion.distance.short`.
- New semantics: `core.motion.feedback.{duration,easing}`, `core.motion.popup.{enter,exit}.{duration,easing}`, `core.motion.popup.offset`, `core.motion.panel.{enter,exit}.{duration,easing}`.
- Drawer uses `core.motion.panel.*` (slide and scrim; exit is shorter and accelerates). Menu uses `core.motion.popup.*` (fade plus a 4px nudge away from the anchor, enter only).
- `--ds-motion-*` and `--ds-ease` in `foundation.css` now alias the primitives, so other components follow the tokens without edits. Reduced motion zeroes the durations and offset in one place (`foundation.css`).
- Pilot extended to Accordion and Popover. New semantics `core.motion.expand.{duration,easing}`. Accordion panels now animate height (grid 0fr to 1fr, markup gains a `panelContent` wrapper) and the chevron uses `core.motion.feedback.*`. Popover uses `core.motion.popup.*` (enter only).
- Pilot extended to Dialog, ProgressBar and ProgressCircle. New primitive `core.motion.scale.subtle`. New semantics `core.motion.modal.{enter,exit}.{duration,easing}`, `core.motion.modal.scale`, `core.motion.progress.{duration,easing}`. Dialog uses modal; the progress fill and circle arc slide in from empty on mount, follow value changes, and the percentage counts up in step (`useCountUp`, reads the duration token). The stepped fill under reduced motion is replaced by the token-level rule (durations 0, fill appears at its value).
- New primitive `core.motion.duration.slower` (480ms). `core.motion.progress.duration` now uses it, so the progress fill, circle arc and count-up run one step slower than before (320ms to 480ms). Reduced motion zeroes it too.
- Drawer: removed corner radius. Deleted `component.drawer.all.container.radius` (no longer used).
- Drawer: new `behavior="push"` option. The drawer sits in a flex row and squeezes the content beside it (no scrim, no scroll lock, rendered in place). Uses the same `core.motion.panel.*` tokens, animating width instead of sliding. No new tokens.
