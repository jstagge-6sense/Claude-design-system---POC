import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// The parent folder (the repo root, two folders up) is the 6sense design system. Everything under @base is read straight
// from it, never copied, so the dev server sees it: change a parent component, style or rebuilt token file and the preview updates.
const base = fileURLToPath(new URL('../../', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@base': `${base}src`, '@tokens': `${base}dist` } },
  server: { fs: { allow: [base] }, watch: { ignored: ['!**/dist/**', '!**/tokens/**'] } },
})
