# Intelligence library: instructions for Claude

This folder is a sub library of the 6sense design system. The **parent folder (two levels up, the repo root) is the design system and the source of truth.** GitHub: https://github.com/jstagge-6sense/Claude-design-system---POC

Before building or changing anything here, read the parent. Do not copy it into this folder.

1. Components: `../../src/components/*` (each has the component, CSS module, stories and tests). Reuse them. Do not rebuild what exists.
2. Rules and requirements: `../../docs/source/*` (component requirements per group, naming conventions, cross-cutting specs, decision trees) and `../../docs/COMPONENT_AUTHORING.md`.
3. Tokens: `../../tokens` (primitive, semantic, component JSON) and the built CSS in `../../dist`. Use exact token names, for example `core.color.content.primary` / `--core-color-content-primary`.
4. Foundations: `../../src/styles`, `../../src/icons`, `../../src/primitives`.
5. `../../README.md` and `../../design-system-state.json` for status.

Rules for this folder:
- Import parent components only through `src/base.ts` (the `@base` alias). Never copy parent files here.
- Add no tokens, overrides or raw values. CSS uses only parent tokens. `npm run check` enforces it.
- Only intelligence or Revvy AI specific components belong here. If another product could use it, propose adding it to the parent instead.
- If a parent rule and something here disagree, flag the conflict and ask. Do not pick silently.
- Never edit the parent from here unless the person asks.
