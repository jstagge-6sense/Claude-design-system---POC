import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// Three entry points: core (.), ./mui (Material UI theme bridge) and ./hook-form (react-hook-form bindings).
// Both ESM and CJS are emitted so Next.js, Create React App (Craco), Vite and webpack apps can all consume the package.
// Every chunk starts with "use client": the components use state, effects and DOM APIs, so they are Client Components
// in the Next.js App Router. Server Components can still import them as leaf nodes.
// Styles are one file: dist/styles.css (tokens, dark theme, density modes and all component CSS).
export default defineConfig({
  plugins: [react(), dts({ include: ['src'], exclude: ['src/preview/**', '**/*.stories.tsx', '**/*.test.tsx', '**/*.figma.tsx'] })],
  build: {
    lib: {
      entry: { index: 'src/index.ts', mui: 'src/mui/index.ts', 'hook-form': 'src/hook-form/index.ts' },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@mui\//, /^@emotion\//, 'react-hook-form'],
      output: { banner: '"use client";', assetFileNames: (a) => (a.name?.endsWith('.css') ? 'styles.css' : 'assets/[name][extname]') },
    },
  },
})
