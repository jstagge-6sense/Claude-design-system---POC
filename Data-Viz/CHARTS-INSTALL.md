# DBA charts add-on for 6ds-team-kit-v2

Only the charts. Unzip over the kit root (`6ds-team-kit-v2/`); every file lands in a new path, nothing existing is overwritten.

Adds: `package/src/charts/` (components, theme, palette, samples), four `package/scripts/*chart*|vendor-highcharts` scripts, `reference/DBA-chart-rules-and-guidelines.md`.

## Edit these existing files once

`package/package.json`
- exports: `"./charts": { "types": "./dist/charts/index.d.ts", "import": "./dist/charts.js", "require": "./dist/charts.cjs" }`
- peerDependencies: `"highcharts": ">=12.2"`; peerDependenciesMeta: `"highcharts": { "optional": true }`
- devDependencies: `"highcharts": "^12.2.0"`
- scripts:
  - `"verify:charts": "node scripts/gen-chart-palette.mjs >/dev/null && node scripts/verify-chart-palette.mjs"`
  - `"gen:chart-palette": "node scripts/gen-chart-palette.mjs"`
  - `"samples:charts": "node scripts/build-chart-samples.mjs"`
  - `"vendor:highcharts": "node scripts/vendor-highcharts.mjs"`

`package/vite.config.ts`
- add `charts: 'src/charts/index.ts'` to `build.lib.entry`
- add `/^highcharts($|\/)/` to `rollupOptions.external`

## Use

```
cd package
npm install
npm run build:tokens
npm run samples:charts
open src/charts/samples/index.html     # Chrome, Edge, Safari or Firefox
```

See `package/src/charts/README.md`. Samples: Area, Line, Bar (single), Bar (stacked, grouped, 100%), Donut, each 300px tall. Funnel and Pareto components are included but not on the sample page.
