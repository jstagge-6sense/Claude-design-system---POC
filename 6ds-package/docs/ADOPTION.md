# Adopting @6si/components (6DS) in 6sense web apps

This package is a copy of the design-system library shaped for the 6sense stack. Nothing here changes the original library; token values and components are the same. What differs: the package name, the build (ESM and CJS, one `styles.css`, `"use client"`), a Material UI theme built from the tokens, react-hook-form bindings, and the examples in `examples/`.

> Status: POC. The package name `@6si/components` is the in-house 6DS name. If the published 6DS already owns that name, rename it in `package.json` before publishing, or publish under a scope that does not collide.

## What is in the box

| Entry | Import | Contents |
|---|---|---|
| Core | `@6si/components` | 51 components, icons, primitives |
| Styles | `@6si/components/styles.css` | Tokens, dark theme, Compact/Default/Spacious modes, component CSS. Import once per app. |
| Material UI bridge | `@6si/components/mui` | `createSixDsTheme`, `SixDsProvider` (needs `@mui/material`) |
| react-hook-form | `@6si/components/hook-form` | `FormInput`, `FormNumberInput`, `FormSelect`, `FormCheckbox` (needs `react-hook-form`) |
| Tokens | `@6si/components/tokens.json` | Resolved token data for tooling |

`@mui/material`, `@emotion/*` and `react-hook-form` are optional peer dependencies. Apps that do not use them never load those entries.

## Dark mode and size

Set two attributes on `<html>`. Nothing else is needed.

```html
<html data-theme="dark" data-density="compact">
```

`data-theme`: `light` (default) or `dark`. `data-density`: `compact`, `default` or `spacious`. Compact and Spacious scale spacing and control height; type size stays fixed. The dark palette is a draft pending design sign-off.

## By build tool

### Next.js (newer apps)

Components ship with `"use client"`, so they work in the App Router as Client Components and in the Pages Router. No `transpilePackages` is needed because the package is pre-built.

```tsx
// app/layout.tsx (App Router)
import '@6si/components/styles.css'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-theme="light" data-density="default"><body>{children}</body></html>
}
```

- Pages Router: import the stylesheet in `pages/_app.tsx` (global CSS from `node_modules` is allowed there).
- Render `data-theme` and `data-density` on the server (from a cookie) to avoid a flash. `SixDsProvider` also sets them after hydration.
- Server Components can render 6DS components as leaves; pass serializable props only (no functions) from a Server Component.
- The components touch `window` and `document` only inside effects and event handlers, so server rendering does not need guards. `scripts/smoke-test.mjs` renders every story in Node with no DOM as a regression check.

### Create React App with Craco (older apps)

- CRA 5 (webpack 5): works as is. Import `@6si/components/styles.css` in `src/index.tsx`.
- CRA 4 (webpack 4) does not read the `exports` map. Subpaths `@6si/components/mui` and `/hook-form` then need an alias in `craco.config.js`:

```js
const path = require('path')
module.exports = { webpack: { alias: {
  '@6si/components/mui': path.resolve(__dirname, 'node_modules/@6si/components/dist/mui.cjs'),
  '@6si/components/hook-form': path.resolve(__dirname, 'node_modules/@6si/components/dist/hook-form.cjs'),
} } }
```

- TypeScript with `"moduleResolution": "node"` finds the subpath types through `typesVersions` in the package. `"bundler"` or `"node16"` use `exports`.

### Vite (migration target)

```ts
// main.tsx
import '@6si/components/styles.css'
```

No plugin or alias is needed. During a CRA-to-Vite migration, keep the same import; the package works in both.

### webpack

Any config that already handles CSS from `node_modules` (`css-loader` plus `style-loader` or `MiniCssExtractPlugin`) works. The package CSS is plain CSS with no CSS-module loader needed (module class names are already compiled).

## Material UI coexistence

6DS and Material UI can share a screen. `SixDsProvider` gives MUI a theme built from the same tokens (palette, radius, type, control heights, spacing) and follows the same dark and density settings.

```tsx
import { SixDsProvider } from '@6si/components/mui'
<SixDsProvider mode="dark" density="compact"><App /></SixDsProvider>
```

Notes:
- The MUI theme uses static values resolved at build time, because MUI's color helpers cannot read CSS variables. Run `npm run build:mui-theme` after token changes.
- Both libraries export a `Button`, `Input`-like components and so on; import MUI from `@mui/material` and 6DS from `@6si/components` and alias one on import when both appear in a file.
- Style order: MUI (Emotion) injects styles at runtime; 6DS ships a stylesheet. If a MUI rule must not win over 6DS, wrap with Emotion `StyledEngineProvider injectFirst`.
- Migrate screen by screen: replace MUI components with 6DS equivalents where a 6DS component exists (Button, Input, Select, Tabs, Table, Dialog, Toast and others); keep MUI for components 6DS does not have yet.

## react-hook-form (new features)

```tsx
import { useForm } from 'react-hook-form'
import { FormInput, FormSelect, FormCheckbox } from '@6si/components/hook-form'
const { control, handleSubmit } = useForm<Values>()
<FormInput control={control} name="email" label="Work email" rules={{ required: 'Enter your work email.' }} />
```

- The field error from react-hook-form becomes the component `error`. The component sets `aria-invalid` and links the message.
- Keep validation in the form (rules or a resolver such as zod). Do not also pass `validate` to the component.
- `control` can be omitted inside `<FormProvider>`.
- Full example: `examples/hook-form/SignupForm.tsx`.

## React Query (new features)

6DS components do not fetch. Pass query state in as props: `loading`, `error` (with `onRetry`) and `emptyState` on `Table`; `loading` on `Card` and `Button`. Controlled sort and selection go through the query key. Full example: `examples/react-query/AccountsTable.tsx`.

## Redux-Saga (existing apps)

6DS is state-agnostic: components take props and call callbacks, and have no store, context or data-layer dependency. That makes adoption in Redux-Saga apps a wiring exercise, not a rewrite.

- Read from the store with your existing selectors and pass the result in as props.
- Turn callbacks into actions: `onValueChange`, `onSortChange`, `onSelectionChange`, `onClick`, `onOpenChange` map to `dispatch(action(...))`. Sagas keep doing the async work.
- Controlled pattern for server-side sorting or paging: keep `sort`, `page` and `selectedIds` in the store; the table renders what it is given. Components also work uncontrolled (`defaultValue`) when the state is local.
- Loading and errors: map saga request status to `loading` and `error`. For toasts, call the `ToastProvider` API from a component that dispatches on a success action; do not call it from the saga.
- Forms in legacy screens: use the components with plain controlled state (`value` plus `onValueChange`) and dispatch on submit. Use react-hook-form only for new forms.
- Do not put component instance state (open menus, focus) in Redux. The components own it.
- Mixed apps: Redux-Saga screens and React Query screens can use the same components side by side; the library does not care where state lives.

## Known limits

- The package has not been built or typechecked in this sandbox: dependency installs are blocked, so `vite build` and `tsc` have not run. What was checked: the token build, the dark-mode contrast check, the token lint, the component structure check, and a render smoke test of every story. Run `npm install && npm run build && npm run typecheck && npm test` first and expect to fix small type issues in `src/mui`, `src/hook-form` and `examples/`.
- Examples assume `@tanstack/react-query` v5.
- Dark theme values and the Compact and Spacious scales are drafts.
