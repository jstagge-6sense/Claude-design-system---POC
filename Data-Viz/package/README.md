# @6si/components (6DS), package copy for the 6sense web stack

A copy of the design-system library packaged for the 6sense frontend stack. The original library next to this folder is not modified.

Stack coverage: React and TypeScript; Next.js (newer apps), Create React App with Craco (older apps), Vite (migration target) and webpack; Material UI alongside the in-house 6DS components; Redux-Saga in existing apps; React Query and react-hook-form for new features.

What is added on top of the original library:

| Added | Where |
|---|---|
| Package renamed `@6si/components`, subpath exports, `typesVersions`, optional peers | `package.json` |
| Vite library build: ESM + CJS, `"use client"`, single `dist/styles.css` | `vite.config.ts` |
| Dark theme and Compact/Default/Spacious modes shipped in the stylesheet | `src/styles/tokens.css`, `tokens/modes/` |
| Material UI theme from the tokens | `src/mui/`, `scripts/build-mui-theme.mjs` |
| react-hook-form bindings | `src/hook-form/` |
| Examples (forms, React Query table, MUI + 6DS) | `examples/` |
| Adoption guide per build tool, MUI coexistence, Redux-Saga | `docs/ADOPTION.md` |

Open the samples first (no install needed, they work offline):

- `preview/design-system-preview.html`: all 51 components, token editor, dark mode and sizes.

Then read `docs/ADOPTION.md`.

```
npm install
npm run build          # tokens, modes, MUI theme, then vite build
npm run typecheck && npm test
npm run preview        # rebuild preview/design-system-preview.html (component preview with the token editor)
```

Status: POC. See "Known limits" in `docs/ADOPTION.md`.
