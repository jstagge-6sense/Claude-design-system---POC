# DBA charts (Highcharts)

Seven chart components built on Highcharts with one shared theme, palette and formatter set. Teams pass data and story text only.

| Component | DBA chart | Highcharts series | Color |
|---|---|---|---|
| `AreaChart` | Area (spline) | `areaspline` (`area` when `curved={false}`) | Single (gradient) |
| `LineChart` | Line graph | `line` (`spline` when `curved`) | Categorical |
| `BarChart` | Bar graphs (single) | `bar` / `column` | Single, sequential or categorical |
| `StackedGroupedBarChart` | Bar graphs (stacked and grouped) | `bar` / `column` + `stacking` | Categorical or single |
| `DonutChart` | Donut | `pie` + `innerSize` | Categorical |
| `FunnelChart` | Funnel | `funnel` | Sequential |
| `ParetoChart` | Pareto (beyond v1) | `column` + `pareto` | Single columns, categorical line |

## Setup (once, at app start)

```ts
import Highcharts from 'highcharts'            // 12.2+ (CSS variables in color options)
import 'highcharts/modules/accessibility'      // required
import 'highcharts/modules/funnel'             // FunnelChart
import 'highcharts/modules/pareto'             // ParetoChart
import 'highcharts/modules/pattern-fill'       // optional
import { initDbaCharts } from '@6si/components/charts' // or '../charts' in this repo
initDbaCharts(Highcharts)
```

Highcharts is a peer dependency, so the app owns the version and license. `src/charts/charts.setup.ts` does this for Storybook.

## Use

```tsx
<LineChart
  title="Pipeline by region"
  description="Pipeline created by region per month. North America leads in every month."
  categories={['Jan', 'Feb', 'Mar']}
  series={[{ name: 'North America', data: [4.1, 4.4, 4.9] }, { name: 'EMEA', data: [2.2, 2.5, 2.4] }]}
  valueFormat={{ kind: 'currency', compact: true }}
/>
```

`title` and `description` are required. The description is the screen-reader text alternative. All charts support `loading`, `error`, `emptyMessage`, `locale`, `height`.

## Responsive

Charts are always 100% of their parent's width and reflow when the parent resizes (ResizeObserver) or the window changes. `height` takes a number (fixed px, default 320) or a CSS length (`'60vh'`, `'calc(100vh - 8rem)'`, `'100%'`) to fill that space; with `'100%'` the parent needs a height. `DonutChart` accepts `size="fill"`. The theme adds a small-container rule (legend moves below, axis titles drop, x labels rotate) for containers narrower than 520px.

## Samples

`samples/` holds sample data, React usage (`ChartSamples.tsx`) and an offline page with the five core charts (9 variants), each 300px tall, full width, resizing with the window; Funnel and Pareto are not in the sample page (components remain):

```
npm run build:tokens && npm run samples:charts
open src/charts/samples/index.html     # open in Chrome, Edge, Safari or Firefox (not an in-app preview)
```

The page tries `samples/vendor/` first, then code.highcharts.com, jsDelivr and unpkg, and prints which source it used or which failed. If your network blocks all CDNs, run `npm run vendor:highcharts` to save a local copy (from `node_modules` or jsDelivr), then reload. Highcharts is licensed separately.

The page uses the same option builders and theme as the React components. Data is synthetic.

The page has the same header and live token editor as `design-system-preview.html`: token counts, Light/Dark and Compact/Default/Spacious toggles (DRAFT modes from `dist/modes.css`), and a Token editor with search, layer filter, color picker, raw value and alias per token, Copy edits, Download `token-edits.json` and Reset all. Edits apply as CSS variables, are saved in this browser (same storage key as the preview, so edits carry over) and redraw every chart. Chart series colors come from the teal, blue, green, amber, red and ink primitives, so edit those to recolor charts. Composite typography tokens are edited in the preview app. `npm run samples:charts` also writes `samples/dist/tokens-data.js` from `dist/tokens.json`, so run `npm run build:tokens` first.

## Structure

- `palette.ts` and `palette.generated.ts`: chart colors from 6DS tokens (generated), plus sequential, categorical and contrast helpers. The only hex values.
- `theme.ts`: global Highcharts options (`setOptions`). Text, borders and type use 6DS semantic tokens as CSS variables.
- `presets.ts`, `format.ts`: shared axes, legend, tooltip, bar spacing and value formatters ($, #, K/M/B, % change).
- `DbaChart.tsx`: base renderer (create, update, reflow, destroy, loading, error, empty).
- One file per chart, each exporting the component and a pure `build<Name>Options(props)`.
- `Charts.module.css`: SVG hooks and placeholders. Tokens only.

## Bar ends

Bars, columns and Pareto columns round only their value end by 8px (`barEndRadius()` in `presets.ts`): per bar for single and grouped charts, and the end of the whole stack for stacked and 100% charts. 6DS has no 8px data-viz radius token, so `BAR_END_RADIUS` is a constant (dimension gap); swap it for a token when one exists.

## Rules

1. No hex colors, fonts or spacing in a chart definition. Use the theme, presets and palette.
2. New styling goes into the theme or a preset, not one chart.
3. `highchartsOptions` is an escape hatch merged last. Using it deviates from the framework: tell the DBA team.
4. Light mode only.

## Colors: 6DS tokens only

Chart colors come only from the 6DS primitive color tokens (`tokens/primitive/color.json`): teal (primary), blue, green, amber, red and ink. No Highcharts default color and no color from the earlier Confluence hex table is used. The theme sets every color option Highcharts would otherwise default.

- `scripts/gen-chart-palette.mjs` (`npm run gen:chart-palette`) reads the tokens and writes `palette.generated.ts`. Never type hex values in chart files.
- Only steps with at least 3:1 contrast on white are usable: teal 500-900 (5), blue 400-700 (4), green 500-900 (5), amber 500-900 (5), red 300-900 (7), ink 600-900.
- Single color: middle usable step of teal (change `PRIMARY` in the generator to re-base). Sequential: evenly spaced usable steps, light to dark; with more stops than usable steps the darkest repeats, so keep sequential charts to 5 or fewer stops (red supports 7).
- Categorical: blue, amber, teal, red, green, then two more passes (15 colors). "Other" is an Ink step chosen for distance from the others.
- `npm run verify:charts` regenerates the palette and fails if any palette color differs from its token, falls below 3:1, or if a raw color appears in chart source.

The 6DS ramps are used as defined. The earlier chroma-trajectory saturation targets (light end ~40%, center ~100%, dark end ~50%) are reported as advisory only; the 6DS ramps do not follow them. 6DS has no semantic data-visualization tokens yet: `GAP-chart-palette`.

## Beyond v1

Pareto is not in the DBA v1 chart list. It is built from the shared theme and palette; confirm properties with the DBA team before wide use.

## Known limits

- Not run against a live Highcharts install in the authoring sandbox. Run `npm install`, `npm run typecheck`, `npm test` and Storybook first.
- `Bar` spacing (4 to 24 px) is approximated through `pointPadding` from the chart height and bar count.
- "Other" (Ink 800) is only about 17 Delta E 94 from the first categorical pass; 6DS has no true gray, so keep "Other" distinguishable with legend and outline, not color alone.
- Teal 500 and 600 cannot hold white or ink text at 4.5:1, so funnel labels on those steps move outside the block.
- Divergent palettes are not built (6DS has no divergent set); the seven charts do not use them.
- Divergent palettes were exploratory in the source and not used by these seven charts.
- Pattern fills (`pattern-fill` module) are loaded but not applied by default.
- Code Connect and Figma node IDs are not set. Figma library layouts are out of scope.
