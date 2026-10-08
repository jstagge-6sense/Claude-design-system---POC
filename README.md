# 6sense design system (React)

React component library built from the project tokens: primitive -> semantic -> component. 51 components, light mode, draft status.

## Look at it
Open `design-system-preview.html` (one file, in the folder above this one) in a browser. It loads React and the Atkinson Hyperlegible Next font from a CDN, so it needs internet. Everything else is inside the file.

- Left: foundations (colors, type, space, effects, gaps and conflicts) and every component by tier.
- Right: the token editor. Change any token and every component updates live. Edits are saved in your browser.
- "Copy edits" exports your changes as token JSON. Send it back in the thread, or run `node scripts/apply-token-edits.mjs edits.json`.

## Layout
```
tokens/primitive|semantic   project token JSON, unchanged (approval-only files)
tokens/component/*.json     one draft file per component, aliasing semantic tokens
dist/                       generated: primitive.css semantic.css component.css tokens.json figma-syntax.json gaps.json tokens.d.ts
src/components/<Name>/      <Name>.tsx .module.css .stories.tsx .test.tsx .figma.tsx index.ts
src/primitives, src/icons   shared hooks and the icon set
src/preview/                the preview app
docs/COMPONENT_AUTHORING.md the contract every component follows
docs/source/                the project docs these were built from
design-system-state.json    level, components, conflicts, deferred work
```

## Commands (node scripts, no install needed)
`node scripts/build-tokens.mjs .` build tokens. `node scripts/lint-tokens.mjs .` no raw colors, no primitives, no unknown variables in component CSS. `node scripts/check-components.mjs` compile every component, story and test. `node scripts/smoke-test.mjs` render every story with a stand-in React. `node scripts/gen-index.mjs` regenerate `src/index.ts`. `node scripts/build-preview.mjs --copy <dir>` rebuild the single preview file.

With npm available: `npm install`, then `npm run storybook`, `npm test`, `npm run build`. Not run yet: Storybook, Vitest, tsc, a real-browser pass.

## Token naming
`component.{component}.{variant}.{part}.{property}.{state}`, for example `component.button.primary.container.fill.hover` -> CSS `--component-button-primary-container-fill-hover`. Same path in Figma: `component/button/primary/container/fill/hover`.

## Known open items
See the Gaps and conflicts page in the preview, or `design-system-state.json` and `dist/gaps.json`.
