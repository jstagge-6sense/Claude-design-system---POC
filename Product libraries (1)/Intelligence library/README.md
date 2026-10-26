# Intelligence library

Components for the intelligence product and Revvy AI. It lives inside the 6sense design system repo and treats that repo, its **parent** (two folders up), as the single source. It **copies nothing and adds no tokens, styles or overrides of its own.**

## How it reads the parent

- Components import from `src/base.ts`, which points at the parent's `src` through the `@base` alias.
- Styles and tokens load from the parent: `@base/styles/index.css` pulls in the parent's token CSS from `../../dist`.
- `npm run dev` watches the parent too. Change a parent component, style or rebuilt token file and the preview updates.
- After editing token JSON in the parent, run `npm run tokens` here (it runs the parent's token build).
- `git pull` updates the design system and this library together, since they live in one repo.
- The rules live in the parent: `../../docs/source` (requirements, naming, cross-cutting specs), `../../docs/COMPONENT_AUTHORING.md`, `../../tokens`, `../../README.md`. Read those before building a component. `CLAUDE.md` in this folder tells Claude to do the same.

## Rules

- A component belongs here only if it is specific to intelligence or Revvy AI. If another product could use it, add it to the parent.
- Build new components from parent components. Do not edit the parent from here.
- CSS may use only parent tokens (`var(--core-*)`, `var(--component-*)`). `npm run check` fails on anything else, including raw colors.

## Run it

```
npm install        # in this folder
npm run tokens     # builds the parent's token CSS if ../../dist is missing
npm run dev        # preview with live updates
```

Add a component: copy `src/components/InsightCard`, rename it, export it from `src/index.ts`.

## Samples

`samples/revvy-explainability/` is a single-file interactive sample: explainability cards, their Markdown (rendered or source) and the RevvyAI companion, all fed by the same Markdown. It reads the parent's token CSS, component CSS and icon set at build time and copies nothing by hand.

```
npm run build:revvy-explainability   # writes samples/revvy-explainability/revvy-explainability.html
```

Edit `revvy-explainability.template.html`, then rebuild. The build fails if the sample's own CSS uses anything but parent tokens.

Notes: thumbs down on a RevvyAI response opens the "What went wrong?" feedback popover (Popover, Checkbox, TextArea); thumbs up never does. The page carries the Google tag. If the parent is missing a CSS module the sample needs, the build reads its last committed version from git and prints a warning.
