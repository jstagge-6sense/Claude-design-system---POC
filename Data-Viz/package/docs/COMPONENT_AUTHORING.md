# Component authoring contract

Read this fully before writing anything. It is the contract between the foundation and every component.
Reference implementation: `src/components/Button/*`, `src/components/Spinner/*`, `tokens/component/button.json`, `tokens/component/spinner.json`.

## Paths

- Repo root (bash): `/sessions/loving-zealous-knuth/mnt/outputs/ds-lib`
- Same folder for Read/Write/Edit tools: `/Users/justin.stagge/Library/Application Support/Claude/local-agent-mode-sessions/b6cac835-e743-44de-86fd-49261606b9f6/a6d38797-d1ee-4f73-8ada-93ca64c94808/66c29e04/outputs/ds-lib`
- Requirements (behavior only): `docs/source/Components-*.md`. Rules for every component: `docs/source/Components-Cross-Cutting Specifications.md`.
- Visual intent and per-state recipes: `docs/source/visual-design-decisions.md` (sections 2 to 6). Naming rules: `docs/source/COMPONENT_NAMING_CONVENTIONS.md`.
- `npm` is unavailable in this sandbox. There is no React install. Use the node scripts below. Do not try to install packages.

## You own only your components

Create or edit only: `src/components/<Name>/**` and `tokens/component/<name>.json` for the components assigned to you.
Do NOT edit: `scripts/`, `src/styles/`, `src/primitives/`, `src/icons/`, `src/preview/`, `tokens/primitive|semantic`, `src/index.ts`, `design-system-state.json`, other components, or `docs/source/*`.
If you need a new icon, put a local SVG in your component folder (do not edit the shared icon set) and report it.

## Files per component (folder `src/components/<Name>/`, PascalCase)

`<Name>.tsx`, `<Name>.module.css`, `<Name>.stories.tsx`, `<Name>.test.tsx`, `<Name>.figma.tsx`, `index.ts` (`export * from './<Name>'`, plus any subcomponents).
Compound components may add more `.tsx`/`.module.css` files. Token file: `tokens/component/<lowerCamelName>.json` (e.g. `splitButton.json`).

## Tokens

Layering is one-way: primitive -> semantic -> component. Component CSS uses `var(--component-*)` first, `var(--core-*)` semantic second.
Never use hex, rgb(), primitives (e.g. `--core-color-teal-700`), or arbitrary z-index values in component CSS. `scripts/lint-tokens.mjs` enforces this.

Name: `component.{component}.{variant}.{part}.{property}.{state}` (see COMPONENT_NAMING_CONVENTIONS.md). `component` is lowerCamel (`splitButton`).
`variant` is the style variant, or `all` when it applies to every variant. `part` is always present (`container`, `label`, `icon`, `track`, ...). `property` is one camelCase segment (`fill`, `border`, `shadow`, `color`, `radius`, `heightSmall`, `paddingInline`, `gap`, `typography`).
`state` is last and optional: `default | hover | pressed | focus | disabled` plus component states (`selected`, `checked`, `error`, `readOnly`, `active`, ...). Size goes into the property (`heightSmall`), not the state slot.
Only create a token when it answers a question no existing token answers. Do not add a token a state does not need (e.g. if hover equals default, skip it and reuse default in CSS).

Parent/inherited components: define the parent's tokens first. A child (Pagination, SplitButton, ButtonGroup, TextArea, NumberInput, Search, Chip, ...) adds only its delta and may alias the parent's component tokens, e.g. `{component.button.secondary.container.fill.default}`.
Validate a child with its parent: `--components pagination,button`.

### How to write token files

Use `scripts/lib/tok.mjs` from a throwaway generator in `/sessions/loving-zealous-knuth/work/` (see `gen-button.mjs` there). The output is plain DTCG JSON:
`{ "$type": "color", "$value": "{core.color.action.primary.default}", "$description": "...", "$extensions": { "gap": "GAP-id" } }`.
Types: `color`, `shadow`, `typography`, `sizing`, `spacing`, `borderRadius`, `borderWidth`, `dimension`, `number`.
Typography: alias a semantic text style as a whole (`{core.typography.label.1}`); CSS then uses `font: var(--component-x-all-label-typography-font)` (shorthand) and `text-decoration: var(--...-text-decoration)`.
Shadows: alias a whole semantic shadow (`{core.effect.shadow.card}`). The CSS var is a complete `box-shadow` value. To combine with the focus ring: `box-shadow: var(--core-effect-ring-focus), var(--x)`.
Gradients (`core.color.surface.page`, `.card`, `.action.selected`, `.border.group`) are CSS `<image>` values: use `background:` not `background-color:`.

### Layer rules the build enforces

- semantic -> primitive or semantic. component -> semantic or component.
- A component may alias a primitive ONLY for opacity, blur, the elevation ladder (`core.effect.shadow.0|50|100..400`) and `core.effect.glow.*` (visual-design-decisions 5.6), OR when the token carries `"$extensions": {"gap": "GAP-id"}`.
- No raw values in component tokens (only via a gap-flagged primitive alias). A raw value that is genuinely needed is a gap.

### Opacity composition (known conflict C-1, read this)

The semantic color JSON points `border.*`, `action.disabled.*`, `action.compact.*`, `surface.control.disabled`, `surface.scrim` at SOLID Ink 900 (or Red 900), but visual-design-decisions documents them as Ink at an opacity. The JSON appears to have lost the alpha. Until a human decides, compose the opacity in the COMPONENT token with the inline pattern the project already uses for shadows:
`"$value": "rgba({core.color.border.subtle},{core.effect.opacity.100})"` (helper: `rgba('core.color.border.subtle','core.effect.opacity.100')`).
Use this mapping (percent -> opacity primitive): 0% opacity.0, 4% opacity.50, 8% opacity.100, 16% opacity.200, 24% opacity.300, 32% opacity.400, 48% opacity.500, 64% opacity.600, 100% opacity.700.

| Semantic token (solid) | Documented alpha | Notes |
|---|---|---|
| `core.color.border.subtle` | 8% | Tertiary and faint separators |
| `core.color.border.standard` | 16% | Secondary border, dividers, decorative borders |
| `core.color.border.strong` | 24% | Assumption ("medium borders 24%"). Mention in description |
| `core.color.border.control.default` | 64% | Input and form control borders (passes 3:1) |
| `core.color.border.disabled`, `core.color.action.disabled.border` | 16% | Disabled stroke |
| `core.color.action.disabled.fill`, `core.color.surface.control.disabled` | 8% | Disabled fill |
| `core.color.action.compact.default / hover / pressed` | 4% / 8% / 4% | Nav item and icon-action background |
| `core.color.border.destructive` | 8% | Red 900 at 8% |
| `core.color.surface.scrim` | 32% (proposal) | Not documented. Say so in the description |

Statuses (`core.color.status.success|info|warning|critical`, `core.color.surface.badge.*`) are solid. Do not invent tints. If a tinted status surface is needed (banner, toast), compose `rgba({core.color.status.critical},{core.effect.opacity.200})` and say it is a proposal in `$description`.

### Gaps

If no semantic token covers a role, do not silently pick a primitive. Alias the nearest primitive AND flag it: `"$extensions": {"gap": "<id>"}` and say what is missing and the nearest semantic candidate in `$description`.
Gap id convention: for a missing dimension use `GAP-dimension-<group>-<step>` (e.g. `GAP-dimension-size-500`, `GAP-dimension-borderWidth-100`, `GAP-dimension-space-800`, `GAP-dimension-radius-full`). Use the same id everywhere that value is needed, so gaps consolidate.
For a missing role (color, typography, ...) use `GAP-<component>-<n>`.
Known dimension gaps (all primitives, no semantic): borderWidth 1/2/4px, sizes 24/32/48px (semantic only has control heights 32 and 40, and icon 16), spacing 32/40/48px, radius full and 8px.
Semantic spacing available: tight 4, compact 8, comfortable 12, standard 16, spacious 24. Radius: control small 4, control medium 12, surface medium 16, surface large 24.
Semantic colors available: surface.{page,card,overlay,scrim,group,chip,control.default|disabled|readOnly,badge.critical|warning|success}, content.{primary,secondary,placeholder,disabled,inverse,link.default|hover|visited}, status.{success,info,warning,critical}, border.{subtle,standard,disabled,strong,control.default,highlight,group,destructive,focus}, action.{primary,secondary,tertiary,destructive}.{default,hover,pressed}, action.{disabled.fill|border,tint.hover,selected,compact.*}.
Semantic text styles: heading.1-4, greeting.1, paragraph.1-2, help.1, label.1-2, table.columnHeader|cellPrimary|cellSecondary, footer.1, button.1-2, metric.1, link.1-2, nav.primary|secondary.
Semantic shadows: `core.effect.shadow.{primary,secondary,tertiary,destructive}.{default,hover,pressed,focus}`, `navigation.{hover,pressed,focus}`, `containerGlass`, `card`, `formSection`, `core.effect.ring.focus`.

Light mode only. There are no dark values in the token files, and the instructions are never to invent them. Do not add dark overrides.

## CSS rules

- CSS Modules, one `.module.css` per file. Pseudo-classes for real states AND a `[data-state='hover|pressed|focus']` twin for forced states (the preview forces states for token testing). Pattern: see `Button.module.css`.
- Map tokens to local `--_*` custom properties per variant once, then keep state rules generic.
- Focus: `:focus-visible` plus `[data-state='focus']` using the semantic focus shadow (buttons) or `core.effect.ring.focus` (everything else). Never remove focus outlines without a replacement.
- Disabled: no shadows, disabled tokens, `aria-disabled` for buttons and links; native `disabled` for form controls.
- Persistent states (selected, checked, on) change color or border, not shadow alone.
- 44x44px hit area (`--ds-hit-min`) for anything interactive with a smaller visual size. Use a pseudo-element or padding.
- RTL: logical properties only (`margin-inline-start`, `inset-inline-end`, `padding-block`). No fixed label widths. Directional icons are mirrored by `Icon` already.
- Motion only inside `@media (prefers-reduced-motion: no-preference)` or disabled in `reduce`. Use `--ds-motion-*` and `--ds-ease`.
- z-index only `var(--ds-z-*)` (base 0, sticky 100, menu 200, sidepanel 300, drawer 400, dialog 500, toast 600, tooltip 700).
- Layout lengths that are structural (min-width, max-width, grid track counts) may be raw but must be minimal and never fixed dialog/drawer sizes: use min/max width. Raw colors and primitives are errors; raw px for spacing is a warning that means you missed a token or gap.
- Typography via `font: var(--component-...-typography-font)`. Do not set font-size or weight by hand.

## React rules

- TypeScript, React 18+, `forwardRef`, spread native props to the root, merge `className` with `cx` from `../../primitives/cx`, one root element.
- Props mirror the Figma-style properties: variants -> string unions, TEXT -> string/children, BOOLEAN -> boolean, INSTANCE_SWAP -> `ReactNode` slot (icons are slots, never an enum of icons).
- Forced state prop for docs: pass `data-state` through (`'hover' | 'pressed' | 'focus'`).
- Shared helpers: `../../primitives` (cx, mergeRefs, useControllableState, VisuallyHidden, Portal, useEscapeKey, useClickOutside, useFocusTrap, useScrollLock, usePrefersReducedMotion) and `../../icons` (`<Icon name="chevronDown" />`; see `src/icons/paths.ts` for names).
- Use `useId()` for label/description/error wiring. Controlled and uncontrolled support via `useControllableState` where a value exists.
- Overlay components (Menu, Popover, Dialog, Drawer, Toast, ...) accept `portal?: boolean` (default `true`). When `false` they render in place so the preview can show them inside a positioned frame. Provide `defaultOpen` (or `open`) so stories can render them open.
- Accessibility per the requirements doc "ACCESSIBILITY" section for each component: roles, aria-*, keyboard map, focus management. Icon-only needs an accessible name. Color is never the only signal.
- Copy: sentence case. Button text is verb + noun. No "please". Errors state what happened and what to do.
- No `any` unless unavoidable. No `console.log`. No TODO stubs: every variant and state in the requirements ships, unless the requirements mark it deprecated or an open question (then implement the safest option and report it).

## Stories (drive both Storybook and the preview)

CSF3, `import type { Meta, StoryObj } from '@storybook/react'` (type-only import). Default export `meta` with `title: '<Group>/<Name>'` and `parameters: { tier: 1|2|3|0, group: '<Action|Data entry|Container|Feedback and status|Navigation and structure|Patterns>', description: '<one sentence>' }`.
One named story per variant and one forced-state matrix story (`data-state`). Stories render without extra providers. `render: (args) => JSX` is allowed and may use hooks inside a nested component. Keep demo layouts simple: inline styles for layout only (no colors). Stories must show overlays open and in place.
Tier values: 1 critical, 2 high value, 3 specialized, 0 atomic data unit or pattern.

## Tests and Code Connect

`<Name>.test.tsx`: Vitest + Testing Library: role/name queries, keyboard behavior, aria state, disabled behavior (`vi.fn()`, `globalThis` vitest globals). Cannot be run here: they must at least compile (the checker transpiles them).
`<Name>.figma.tsx`: Code Connect with `FILE_KEY` / `NODE_ID` placeholders (like Button). Never invent node IDs.

## Validate your work (required before you report)

Run from the repo root in bash (`cd /sessions/loving-zealous-knuth/mnt/outputs/ds-lib`). Use a private dist so parallel agents do not collide:

```
node scripts/build-tokens.mjs . --out /tmp/dist-<you> --components <yourTokenFile1>,<yourTokenFile2>[,<parent>]
node scripts/lint-tokens.mjs . --dist /tmp/dist-<you> --only <Name1>,<Name2>
node scripts/check-components.mjs <Name1> <Name2>
```
All three must pass. Warnings from lint are acceptable only when they are structural lengths (explain in your report). Do not run these without `--out` / `--dist` (that would overwrite the shared `dist/`).
Then re-read your own CSS once and confirm: every state in the requirements has a real-pseudo-class rule and a `data-state` twin, no raw colors, tokens exist for every `var(--component-*)` you use and every token you wrote is used.

## Report format (your final message, under 250 words)

1. Components built (folder names), 2. token files and counts, 3. gaps you flagged (ids), 4. conflicts or doc ambiguities you hit and how you handled them, 5. anything not implemented and why, 6. exports other components will need (names, key props).
