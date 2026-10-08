# Design System Project — Knowledge Base
*Running archive — dated snapshots, oldest first. Each section reflects a moment in time, not a live record. Check with the person for anything more recent before treating a detail as current. The project description (kept separately, outside this archive) holds the stable "what this is and why" framing; this document holds the sequencing, status, and decisions that move.*
 
---
 
# Snapshot: July 11, 2026
 
**Precedence note**: semantic tokens have been updated since these decisions were documented (confirmed); primitive tokens may or may not have changed (unconfirmed). Wherever this doc or the session archive states a specific token name, value, or mapping, treat the uploaded primitive/semantic token JSON as the source of truth if the two disagree. Treat the *rationale, naming conventions, and architectural decisions* in this doc and the archive as still current unless told otherwise — those don't go stale the way specific values do.
 
---
 
## Purpose & Context
 
Building a token-governed design system to resolve the disconnect between Figma and code. Core approach: a strict three-layer token architecture — **Primitive → Semantic → Component**. Success = a scalable, non-redundant system where every token earns its existence by answering a question nothing else in the system already answers.
 
**Organizational context**: Staff Visual Designer at a 1000+ person Bay Area company. Works with a team of UX designers. The existing Figma library was inherited from a predecessor — copied from Untitled UI, never developed further. Storybook exists as a reference for component props/states, but Storybook, Figma, and product code don't reliably connect to each other.
 
**Reporting line (updated)**: previous manager was let go from the company and has been replaced by a group manager, who has been at the company for a number of years and has outlasted the previous two UX leaders. She has proven more capable of understanding the problem being solved and more effective at unblocking work so focus can stay on the task.
 
**UX Engineer role (updated)**: the UX Engineer who was collaborating on this project has left; the role is open and being recruited for, but not yet filled.
 
**Stated goals**: reduce codebase size and latency, improve interaction design and function, build a strong accessibility framework, enable localization, deliver a modern look and feel, and provide scalable/flexible components built with AI experience in mind — built as building blocks for years to come.
 
---
 
## Token Architecture
 
**Primitive tokens**: structured across four categories — Color, Dimension, Effect, Typography — using a `core → category → primitiveGroup → identifier` naming convention with numeric scales.
 
**Semantic tokens**: role-based naming — `location → category → property → modifier → state` — explicitly avoiding size-first taxonomy and appearance-based naming (name describes *role/meaning*, not visual presentation). Numeric suffixes (e.g. `label.1`, `label.2`) used where words would falsely imply hierarchy.
 
**Component tokens** — status: **paused, in flux, intentionally excluded from this doc's specifics.** Component tokens were completed for Button, Dropdown Button, Split Button, Button Group, and Link, built to match the current pre-refresh UI. After the manager transition, the new group manager redirected the project: pause further component-token work and instead show leadership a North Star vision of the visual refresh on 3 key product screens first. If that vision gets buy-in, component tokens may be rebuilt for the new visual language instead of the current one — avoiding duplicate work. The completed Button/Dropdown/Split/Button Group/Link component tokens in the session archive reflect the *pre-refresh* UI and should not be treated as final or current. Primitive and semantic tokens could also shift if the refresh is approved quickly, though less likely to move than component tokens.
 
**Component token philosophy** (architectural principle — holds regardless of the pause above): Button-adjacent components (Dropdown Button, Split Button) inherit fully from Button's component tokens. Dedicated component tokens are created *only* for genuinely new interaction mechanics (e.g. Split Button's divider, Dropdown Button's chevron). Anything answering the same question as an existing Button token has no right to exist as a separate token. This reasoning applies whether the underlying visual design is the current UI or the refreshed one — it will carry forward into whichever direction leadership picks.
 
---
 
## Button Hierarchy (direction agreed; implementation in progress)
 
- **Primary**: dark blue filled surface, white text.
- **Secondary**: light brand-color tint surface, dark blue text.
- **Tertiary**: white/transparent surface, blue border, blue text. Border is required — a borderless tertiary was tested and rejected for lacking affordance. Border must be brand blue, not neutral gray — gray fails against light-gray backgrounds (cards, panels, modals) where the button would otherwise disappear.
- **Rejected**: a gray-filled secondary with white text (made primary and secondary read as siblings rather than a hierarchy). A borderless tertiary.
- **Logic**: filled → tinted → outlined, all within the same blue color family — background-agnostic affordance at every level.
- **Structural follow-up not yet done**: secondary's content color currently shares `core.color.content.inverse` with primary in the token JSON; the new light-tint-surface/dark-text treatment needs its own content color slot. This is a pending restructuring, not yet executed.
---
 
## Icon Library
 
- Flattened/outlined from Untitled UI.
- Built as 24×24 fixed auto-layout frames with clip content on.
- Vector fill bound to `core.color.content.primary` as a live Figma Variable (not hardcoded — enables clean per-variant overrides).
- Icon names match engineering SVG filenames exactly.
- Button variants override icon color per variant: inverse for primary/secondary/destructive, primary for tertiary.
- Icon sizing governed by component tokens per button variant, not a multi-size icon library.
- Canvas organization uses Figma **Sections** (not slash-prefix naming).
---
 
## AI-Assisted Workflow
 
Windsurf AI agent validated for auto-generating Figma components and variants at roughly 80% accuracy, ~20% manual cleanup required — tested on button and button-like components.
 
**Status (updated)**: on hold. This workflow was being driven jointly with the UX Engineer, who has since left the company. Continuing it depends on the replacement UX Engineer being hired and agreeing it's worth pursuing — not currently active work.
 
---
 
## Key Learnings & Principles
 
1. **Tokens must earn existence** — justified only if it answers a question no existing token already answers, not because a component *feels* distinct or belongs to a different family.
2. **Anti-snowflake vigilance** — already eliminated per-variant disabled and per-variant destructive states for buttons, replacing them with single shared treatments across Primary/Secondary/Tertiary. This is the standing precedent for future consolidation calls.
3. **Inheritance over duplication** — dependencies from having components inherit from a canonical token source are fine when structurally sound. The real costs to avoid are token bloat, workload, and refresh complexity — not dependency itself.
4. **Role-based over appearance-based naming** for semantic tokens.
5. **Match current visuals before refreshing — superseded for now.** The original sequencing logic (build components to match current product first, reducing engineer cognitive load at reconnection, then refresh visuals as phase two) still holds as a design principle. But the *process* has changed: the new manager paused component-token work in favor of validating a North Star visual-refresh direction with leadership first, on 3 key screens. Depending on the outcome, component tokens may skip the "match current UI" step entirely and go straight to the refreshed direction. Treat this as the live sequencing until leadership responds to the North Star pitch.
6. **Icon color flexibility requires live variable binding**, not hardcoded fills.
---
 
## Working Approach & Patterns
 
- Uses Claude as a pre-build thinking partner to pressure-test architectural decisions before committing them in Figma.
- Shares token context via copy/paste of CSS or Token Studio JSON (no file uploads/image sharing on personal account — may differ on work account).
- Pastes relevant token slices per session rather than full documents; table-heavy Confluence docs are hard to transfer accurately.
- References prior decisions explicitly as precedent when evaluating new ones (e.g. disabled-state consolidation as evidence for the inheritance decision).
- Exports all tokens at once — both Variables and Styles (Typography and Effects require Styles; shadow/blur tokens require Effects Styles enabled).
---
 
## Tools & Resources
 
- **Design**: Figma (Variables and Styles), Token Studio
- **Reference**: Storybook (component props/states), Confluence (token documentation)
- **AI-assisted generation**: Windsurf
- **Potential future pipeline**: Style Dictionary (raised as a consideration for token transformation, not yet adopted)
---
 
## Consolidated Open Questions
*(rolled up from the detailed session archive — see below. Check the updated token JSON first: several of these may already be resolved.)*
 
- Does a light `action` color tint already exist in the semantic set, or does one need to be created for the Secondary button surface?
- `component.button.color.content.disabled` is missing from the token JSON — needed before the disabled button state can be built in Figma.
- Secondary's content-color token needs its own slot, separate from Primary's shared `core.color.content.inverse`, to support the new light-tint/dark-text treatment.
- Input-component token architecture — apply the same inheritance/anti-snowflake logic as Button; validation and state tokens are the likely place snowflaking hides (e.g. a chevron color that should reuse an existing error token rather than invent a new one).
- Icon category placement — `activity`, `contrast`, `placeholder`, `circle` flagged as possibly miscategorized; pending UX designer review.
- Icons — Documentation page vs. Components page: consolidate to one, unless a stakeholder presentation artifact is needed.
- Icon size scale ceiling (48px / token 1200) — questioned but deliberately deferred, not resolved either way.
- Fluid typography `clamp()`: deliberately not in the token files. Parked until an engineering partner is available. Verified formulas exist in `fluid-typography-decisions.md`. See the October 1, 2026 snapshot.
- Effect/Dimension/Typography Confluence docs — not yet in context; the JSON alone may not capture all rationale and edge cases those docs hold.
## Other Items on the Horizon
 
- **North Star pitch (current priority)**: present a visual-refresh direction to leadership on 3 key product screens. Outcome determines whether component tokens are rebuilt for the refresh or continue matching current UI.
- Visual refresh — was planned as second phase after reconnection; now potentially reordered ahead of further component-token work, pending North Star outcome.
- A one-pager on the value of visual design, requested by a manager (may be worth revisiting with the new group manager, given her stronger grasp of the problem).
- Windsurf-assisted generation: validated at ~80% accuracy on button components, but paused pending a new UX Engineer hire and their buy-in on continuing it.
---
 
## Detailed Session Archive
 
Five detailed session summaries — Button States & Icons, Semantic Token Layer, Primitive Token Layer, Component Tokens & Button Hierarchy, and Component Token Inheritance — hold the full rationale, exact token names/values, and rejected alternatives behind the decisions summarized above. Upload them alongside this file: this document is the index; those are the detail. If something here seems too brief to act on, check the archive before assuming it's undocumented.
 
**Caveat on component tokens specifically**: the archive's Button/Dropdown Button/Split Button/Link component-token decisions were made *before* the North Star pivot and reflect the current pre-refresh UI. Treat them as historically accurate but not necessarily the active plan — they may be rebuilt for a refreshed visual direction depending on leadership's response to the North Star pitch.
 
---
 
# Snapshot: August 17, 2026
 
**Precedence note**: this snapshot supersedes the July 11 snapshot wherever the two conflict, particularly on project scope, sequencing, and the status of primitive/semantic tokens. Where July 11 is silent (e.g. detailed rationale in the session archive), it still holds.
 
---
 
## Major Developments Since July 11
 
**New product, new design system.** Leadership decided to build a new product from scratch and views this as an opportunity to build a new design system and new visual design with no dependency on anything that came before. This supersedes the July 11 framing of a single sequential project (tokens → components → refresh) for the existing product.
 
**North Star pitch: largely approved.** The visual-refresh direction is now the direction leadership wants. It will be pressure-tested by building new Figma components to *replace* the old ones, rather than validated separately before component work resumes.
 
**Scope resolved: one project going forward, not two competing systems.** The old Figma library was never a token-governed design system in practice — primitives and semantics were defined for it, and a former engineering partner implemented them in code, but no engineering team ever adopted that code, and no component tokens were built (work was paused for the North Star pitch before that happened). As a token effort, it was inert; nothing downstream depends on it. That old Figma library continues to exist and serve the old product, untokenized, but it is explicitly **out of scope** for this project going forward. The former partner's code implementation still exists in a repo and is viable — not adopted by any team, but not abandoned either. The person plans to reach out to an engineer familiar with it to keep it in sync with any tweaks made here.
 
**Existing primitive and semantic tokens: reused, not rebuilt.** Correction to an earlier assumption in this project: Confluence documentation for primitives and semantics (Color, Typography, Dimension, Effect layers) is mature and architecturally sound, not a thin or half-built layer. The work ahead is gap-filling (missing values needed repeatedly) and value swaps (new color ramps, typeface, shadow recipes) to match the new visual language, using the levers already defined, not new architecture. Semantic work specifically is lighter than initially framed: mostly getting crisp on the roles semantics play in light of the new visual language, not a rethink of the roles themselves.
 
**Correction (logged same day):** an earlier version of this snapshot incorrectly stated that primitive and semantic tokens were deleted from Token Studio. They were not. Confirmed via screenshot (Aug 17, 2026) that primitives (color, dimension, effect, typography), semantics (typography, dimension, effect, color), and all five component token sets (button, buttonGroup, dropdownButton, splitButton, link) remain live and active in Token Studio, unchanged, ahead of the planned visual updates. What was actually deleted was the JSON documents of these tokens from Claude's working context/memory, done to avoid conflicting copies across sessions, not from Token Studio itself.
 
**Backup taken before visual changes.** On Aug 17, 2026, before making any visual-language changes, the person exported a full token JSON snapshot from Token Studio (via Export file/folder → Multiple files) and archived it locally. A Git sync setup (GitHub/GitLab/etc., available on the paid Token Studio tier) is being explored with the engineer familiar with the token codebase as a more durable ongoing backup than a one-time export.
 
**New engineering partner: still not found.** The UX Engineer role remains vacant since the prior person's departure (unchanged from July 11). Separately, a new product engineering team will pick up this new design system once ready — that's a different relationship than the vacant UX Engineer role, and it's the team this project is now building for.
 
**Theming question: open.** Considered using Token Studio's theme feature to keep primitives as a separate theme from the old system. Flagged as likely the wrong fit: themes are built for swapping stable values under a shared, stable structure (e.g. light/dark mode), and here the layer above primitives (semantics) is still being actively adjusted, so treating old and new as theme variants may overstate how coupled they are. Given the scope resolution above (old system is genuinely separate and out of scope, not a sibling to theme against), a fully separate token set is the more likely direction, but not yet decided.
 
---
 
## Current Sequencing (as of this snapshot)
 
Four phases, sequentially dependent — each phase gates the next:
 
1. **Visual Design** — finalize new color ramps, type scale, and other visual primitives against the approved North Star direction. Prior primitive values have been exported and archived (see correction above) ahead of changing them. Lock once validated, though "locked" should be held loosely until component requirements (phase 3) are further along, since a late-surfacing requirement could reopen a locked decision.
2. **Semantic Tokens** — re-examine roles (especially shadow and color) against the new visual language, filling gaps and adjusting existing tokens as needed. Architecture and naming convention carry forward unchanged. Lighter lift than originally framed — see correction above.
3. **Component Tokens** — build against UX team's gathered component requirements, currently in a final "gut check" review for comprehensiveness, once semantics are settled.
4. **Figma Components** — build new components on the component token foundation, replacing the old (non-token-based) library. This build also serves as the pressure test for the North Star direction.
**Icon library**: explicitly deprioritized. Redoing icons for the new visual language would add too much time; treated as a "nice to have," addressed only if time remains after the above phases are complete.
 
**Timeline**: new product targets a November launch. As of August 17, 2026, the UX manager assumes an engineering team will be ready to pick up designs in about 4 weeks (mid-September), for a limited number of components. Given the four phases above are sequentially dependent rather than parallel, this is a tight timeline where a delay in any early phase compounds downstream. The critical open question, not yet answered: does "ready to pick up designs" mean engineering needs finished Figma components, or does it mean locked primitive/semantic tokens as JSON so engineering can start scaffolding while Figma component work continues in parallel? The answer significantly changes how achievable the 4-week mark is, and is worth raising directly with the UX manager.
 
**Accessibility**: contrast checking and other accessibility work should happen inside the Visual Design phase (while color ramps are being built) rather than as a later pass, since it's cheaper to catch early. Not yet explicitly assigned to a phase — worth deciding.
 
---
 
## Verified Against Confluence (this snapshot)
 
Confirmed via Confluence search that primitive and semantic token documentation is comprehensive across Color, Typography, Dimension, and Effect for both layers. Notable architectural statements found there, consistent with this project's principles:
- Primitive tokens "exist to support semantics and should not be applied directly to components."
- Semantic color tokens are described as "the stable API that components consume," referencing primitives rather than hard-coded values.
- Effect primitives separate "how a shadow looks" from "why it's used" (semantic layer) — directly relevant to the planned shadow recipe rework.
Not yet pulled in full: complete page content for Semantics Tokens - Color and Semantics Tokens - Effect, which would be the most relevant to check against current Token Studio state before finalizing shadow and color semantic work.
 
---
 
# Snapshot: September 9, 2026
 
**Precedence note**: this snapshot supersedes August 17 wherever the two conflict. Where August 17 is silent, it still holds.
 
---
 
## Kush's Component Requirements Audit — Origin and Authority, Resolved
 
Kush's component requirements docs (Action, Container, Data Entry, Navigation & Structure, Feedback & Status, Decision Matrix) mix originally-collected content with AI-filled content used to cover gaps, using an identical template throughout with no in-document markers distinguishing the two. Origin was not determinable from the files themselves.
 
**Confirmed with Kush directly.** The following components were AI-filled: Radio, Checkbox, Toggle, Slider, Select Menu/Dropdown, Single-select, Multi-select, Collapsible panel, List, Empty State, Table, Tree view. Everything else in the audit is originally collected.
 
**Standing rule, regardless of origin:** the purpose of this audit is to speed up component-token creation using the existing primitive/semantic tokens, not to supply visual direction. No color, opacity, or treatment value in any of Kush's docs, AI-filled or human-collected, carries decision weight against visual-design-decisions.md or the North Star refresh. Only the behavioral/state requirement in each bullet survives; the visual value attached to it does not. This is now an explicit step in Phase 1 of component-token-workflow.md (strip visual language at transcription, before the file reaches Phase 2 or 3).
 
**Menu / Dropdown, resolved:** "Menu (Dropdown + Select Menu — Merged)" in the Action components audit is the one real component. If a separate standalone "Dropdown" page turns up elsewhere in Kush's source files, disregard it — it does not represent a distinct decision.
 
**Review-priority list carried forward from the AI-filled confirmation, for Phase 1–3 attention:**
- Highest risk (genuinely new token decisions): Radio, Toggle, Slider, Menu (Dropdown + Select Menu), Table.
- Lower risk: Checkbox, Single-select, Multi-select, Collapsible panel, List, Truncation + Ellipsis, Empty State, Tree view.
- Note: Collapsible panel, List, and Tree view are not live components in the current 42-component minimal set — Collapsible panel is merged into Side Panel, List and Tree view are deprecated in favor of Table and Nav respectively. They don't need component-token work at all; flagged here only so they aren't mistaken for open work.
- Multi-Select carries a real, non-visual open decision (its own audit page: "ACKNOWLEDGED AS NEEDING REDESIGN," selection at scale is unresolved) — this survives the visual-language strip and stays open regardless of AI origin.
---
 
# Snapshot: September 17, 2026
 
**Precedence note**: this snapshot supersedes September 9 wherever the two conflict, particularly on primitive token status. Where September 9 is silent, it still holds.
 
---
 
## Primitive Effect Tokens: Finalized
 
Effect primitives (opacity, blur, shadow, glow) were pressure-tested and finalized in a dedicated session, completing the primitive token layer alongside the already-finished Color, Gradient, Typography, and Dimension categories. **All primitive tokens are now updated to the new visual language.** Next step: Semantic Tokens (Phase 2), starting in a new conversation.
 
Key outcomes from that session:
 
- **Opacity and blur ramps**: validated against real shadow recipes pulled from Figma and Dev Mode CSS across buttons, tabs, card, and container. No new values needed — every opacity and blur amount actually used in the new visual direction already existed in the primitive scale.
- **Shadow ladder (`shadow.0`–`400`)**: unchanged in value, but corrected a latent bug — every reference to a `gray.900` color token was fixed to `ink.900`, since no `gray` family exists in the actual primitive color file. `shadow.0` is preserved as the explicit "no shadow" reference token (not repurposed), consistent with the zero-value convention used across every other primitive group.
- **New: `shadow.50`** — Card's soft ambient shadow (`0,0,24px, ink.900@4%`), which didn't match any existing step in the ladder (existing steps top out at 16px blur in a two-layer form; Card needed a single-layer, max-blur/min-opacity recipe).
- **New: `glow` family, `glow.100`** — the button pressed-state effect (`0,0,8px, white`, solid, no opacity math). Deliberately **not** added to the `shadow` ladder or named for its use case (e.g. "pressedGlow"): a primitive's name should describe an intrinsic property of the value, not a use case — the same principle that keeps `Teal` and `Red` as separate color families from `Ink`, rather than naming a family after what it's used for. `shadow` = ink-based, darkening effects. `glow` = fixed-white, lightening effects. A second family exists because this is a genuinely different technique, not a magnitude step on the same ladder.
- **Evaluated and rejected: dedicated `tealAlpha` / `redAlpha` / `whiteAlpha` color primitives.** Every teal-at-opacity and red-at-opacity use case found in the new button CSS can be composed inline as `rgba({color},{opacity})` directly wherever needed, the same way the existing `inkAlpha` family's own primitives are actually consumed in practice (the shadow tokens compose `rgba({core.color.ink.900},{core.effect.opacity.X})` inline rather than referencing `inkAlpha` itself, even though `inkAlpha` already exists). Building dedicated alpha families for teal and red would have added primitive surface without a functional need.
- **Scoped out of primitives, deferred to Semantic Tokens (Phase 2):** the button bevel shadows themselves (drop shadow + two inset layers, per color family × state), and the focus/selection ring. The ring in particular was confirmed to already exist correctly at the semantic tier only (`core.effect.ring.focus` / `core.effect.ring.selection`), with no primitive layer, by design, since its value doesn't need independent reuse outside those two semantics.
- **Correction to `visual-design-decisions.md` §2.5 (formerly "Cobalt"):** confirmed `blue.600` (`#0C47A7`) is the current, correct focus-ring and link color. The previously documented `Cobalt 700` (`#0D4DB4`) was accurate when blue was a single defined value in the ramp; the blue ramp has since been expanded to a full 7-step primitive family, and `blue.600` is the value carrying the focus/link role now. `visual-design-decisions.md` has been updated in place to reflect this, not stacked as a new entry, per that document's own convention. Open gap flagged there: the document still has no rationale recorded for Blue's other steps, or for the Red, Amber, and Green primitive color families that now exist in the token JSON.

---

# Snapshot: October 1, 2026

**Precedence note**: this snapshot supersedes September 17 only on fluid typography. Everything else in September 17 still holds.

---

## Fluid Typography (clamp): Parked

**Decision.** Clamp-based fluid typography (fontSize scaling between a minimum and maximum as the viewport changes) is parked, not abandoned. Primitive fontSize tokens stay as plain static rem values. No token values changed because of this decision.

**Why parked.** Two separate reasons:

1. **No engineering partner yet.** How clamp gets implemented (generated live by the Tokens Studio "CSS Accessible Clamp" node, hand-maintained static `clamp()` strings, or generated in a build step) is an engineering decision, and there is no engineering counterpart for design tokens yet.
2. **Primitives should stay platform-agnostic.** `clamp()` is CSS syntax. Putting it in the most raw token layer mixes a browser-specific concern into a value meant to work everywhere. Non-browser surfaces (native app, PDF export, email) cannot parse `clamp()` and would need a fallback.

**Correction:** a Chrome extension is still browser-rendered, so `clamp()` works there and it is not a reason to delay. The real open question is only surfaces that are not CSS at all. If the roadmap stays within browser-rendered surfaces, keeping primitives platform-agnostic is still good architecture, but it is not blocking anything today.

**Already done and verified (do not redo).**

- The formula method is correct, including against Tokens Studio's own node documentation: `slope = (maxPx - minPx) / (maxViewport - minViewport) × 100`, with only the intercept converting to rem.
- An earlier version of `fluid-typography-decisions.md` had every vw coefficient divided by 16 by mistake, which would have flattened scaling to the minimum at every width. It was corrected and re-verified by checking each formula at both viewport bounds.
- All 8 fontSize steps have verified `clamp()` formulas in `fluid-typography-decisions.md`, anchored at 16px at a 360px viewport (min) and 19px at a 1920px viewport (max), 1.2 ratio.
- Accessibility trade-off: vw does not respect a user's browser text-size preference in the interpolated middle zone, only at the flat min and max. Accepted as a known, industry-wide limitation.

**Still to decide once there is an engineering partner.**

1. Where the formula lives: in the primitive `$value`, at a semantic or platform layer, or generated at build time from the static rem primitives.
2. Source of truth: Tokens Studio's graph engine generating it live, or the static strings already verified.
3. Fallback for non-CSS surfaces, if one is ever built. Not urgent, since nothing consumes these tokens outside the browser.

**Primitive typography state (unaffected by this decision).**

- fontSize: plain rem scale, 1.2 ratio, 8 steps.
- lineHeight: 2 stops (120%, 150%), confirmed intentional.
- fontWeight: stored as strings, confirmed working in Figma.
- letterSpacing: removed, after testing Atkinson Hyperlegible Next across buttons, tables, tabs, badges, and large headings (steps 6 to 8). Also supported by the decision to avoid all-caps text.
- fontFamily, textDecoration: unchanged, not revisited.

**To resume.** Bring an engineering partner in before making the implementation call above. Then reopen `fluid-typography-decisions.md`, which is ready to hand off as-is.