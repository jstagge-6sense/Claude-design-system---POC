# DBA Chart Rules and Guidelines

Consolidated from "Guide to DBA charts & colors lvl.1" and its 15 child pages (Confluence, Justin.Stagge space). Source pages are dated Mar–Dec 2023; verify against current 6DS before adopting. Items marked **[Open]** were unresolved in the source.

## 1. Goals

1. 100% accessibility across all data visualization.
2. Easily understandable graphs, or complex graphs with solid data stories.
3. Continuity across all 6DS products, in both visuals and chart types.
4. Repeatable, easy-to-use components for product teams.
5. Guidance for product teams creating or updating data stories.
6. A delightful experience for users.

## 2. Process rules

- DBA acts as a provider to product teams. Product teams own the data story and data needs; DBA owns the individual visualization needs.
- Start with the Wireframing - Story Exercise, then narrow to low-level story needs with PMs and designers, then pick chart types, then build in the Figma DBA library.
- Choose chart type late in the story exercise, after the story is clear. This gives stronger hierarchies and story flow in dashboards.
- Use out-of-the-box DBA charts and properties first. Net-new chart types or properties are built by the product team, not added to the framework, unless DBA agrees to take them on.
- New charts are prioritized with engineering and product teams. DBA gathers needs from all designers, PMs, engineers and users before creating one.

## 3. Choosing a chart (v1)

| Chart | User intent | Story | Color type allowed |
|---|---|---|---|
| Area | Change over time of a single item | Time | Single |
| Line | Change over time of a group of items | Time | Categorical |
| Bar/Column (single) | Size of each item within a group | Time, ranking | Single, sequential, categorical |
| Bar/Column (stacked, grouped) | Size of items within subgroups and how subgroups compare | Time, comparison, ranking, part of a whole, relationship | Single, categorical |
| Data block | Quick high-level understanding | Single value, time | Single |
| Funnel | Flow of users through a predefined process | Flow, relationship | Sequential (divergent: **[Open]**) |

Not in v1: Donut (part of a whole; categorical), Heatmap (part of a whole; sequential or divergent), Map/Geography (geospatial; sequential or divergent).

Note: the palette page also lists Donut as categorical and Line as single-or-categorical, and the Bar (stacked) row as single/sequential/categorical. The child chart pages (Section 5) take precedence for v1 charts.

## 4. Color rules

### 4.1 Accessibility (non-negotiable)

- Every color step has at least a 3:1 contrast ratio (WCAG AA for graphical objects). All DBA ramps are designed to pass.
- Accessible color alone is not enough. Chart functions (labels, legends, outlines, patterns) must also pass for WCAG compliance.
- Palettes are designed for light mode only; no dark mode is planned. Do not borrow public-framework ramps wholesale, since about half their steps fail 3:1.
- Target is to stay at WCAG AA so the European market needs little extra work.

### 4.2 Choosing a palette type

| Type | Use when | Value range | Datasets | Hues |
|---|---|---|---|---|
| Sequential | A total amount, single range (0→100 or -100←0) | One range | 1 or more | 1 |
| Categorical | Multiple series broken out across categories | Any | 2 or more | 2 or more |
| Diverging | Positive and negative amounts around a midpoint | -100 ↔ 100 | 1 or more | About 3 |

- Sequential: steps within one hue present one data range.
- Categorical: hues distinguish categories; steps within a hue can present a range.
- Divergent: hue transitions present ranges on either side of a central point. Currently not in use.

### 4.3 Primary color

- Blue is the default primary color. It is neutral (least likely to read as good or bad) and matches the UI primary.
- Using a different primary hue (for example green for growth) is allowed but discouraged, because it makes later story changes harder.
- Do not assign meaning to hues per product. If purple means clicks in one product and accounts in another, users misread both.

> **Update:** the kit's charts (`package/src/charts`) now use 6DS color tokens only (teal, blue, green, amber, red, ink), not the hex ramps below. Where Sections 4.4 to 4.6 disagree with `package/src/charts/README.md`, the README governs the implementation. The DBA rules for accessibility (3:1), usage by chart type and single/sequential/categorical remain.

### 4.4 Token color method (authoritative: Sequential using chroma trajectory)

For all token colors, the chroma trajectory method is the governing rule. Where any other rule in this document or its sources conflicts with it, this section wins.

**Method (HSL saturation spike):**

1. Do not build ramps by simply running light-to-dark with saturated-to-unsaturated. That "traditional" approach was rejected, and the bottom 20% of such ramps fail WCAG AA.
2. Darkest (first) stop: 50% saturation.
3. Lightest (last) stop: 40% saturation, which raises lightness to about 56%.
4. Center stop: raise saturation to 100%.
5. Make minor hex adjustments in Leonardo (leonardocolor.io) to hit the contrast target.
6. Result must be 100% accessible (every step at least 3:1; AA).

**Usage:**

- For single-color charts and categorical palettes, the base color is the ramp midpoint or one step either side. Ends of the ramp are seen only in large-variance views (geography maps, single-hue heatmaps).
- Use the same trajectory for every hue so ramps are interchangeable.
- Divergent ramps follow the HCL process with saturation 100% → 50% → 100% (weight on the ends, not the middle). The middle may be a light gray taken from the existing palettes.
- Do not introduce hues outside the existing 6DS root hues. Do not hand-pick tints; derive them by the method.

**Resulting ramps** (from the Highcharts color sets, which are the output of this method):

- Six hues, 10 steps each (0–9): Blue (primary), Teal, Green, Yellow, Orange, Red, Pink, Purple (Gray is proof of concept only).
- Pick steps by the count needed:

| Count | Steps |
|---|---|
| 10 | 0-9 |
| 9 | 1-9 |
| 8 | 0,1,3,4,5,6,7,9 |
| 7 | 0,1,3,4,6,7,9 |
| 6 | 0,2,4,5,7,9 |
| 5 | 1,3,5,7,9 |
| 4 | 1,4,6,9 |
| 3 | 1,5,9 |
| 2 | 2,8 |
| 1 | 5 |

- Primary Blue ramp: `#6299bc #4f8fb9 #3a84b8 #2179b6 #036daf #01619d #035586 #0c486d #123a52 #132b39`.
- Heatmap/color-axis in Highcharts: add a white stop at -2.5%, the last palette step at 95%, and a black stop at 102.5%, so extremes get stronger contrast.

### 4.5 Categorical palette

- Order (6 hues in current use): `#5F9BBF`, `#DB6BB9`, `#00A6A3`, `#A77BFE`, `#E3763B`, `#A6A6A6`. Order follows Amazon Cloudscape, which favors hues that are easy to tell apart.
- Gray is appended as "Other": absence of color means different but still measured alongside the categories.
- Template: 5 hues repeated across 20 steps, assigned in automated consecutive order. The 15-stop "all colors" order needs more work **[Open]**.
- Adjacent hues must pass a Delta E 94 check for lightness, chroma and hue differences. "Other" gray only passes above 50 when very dark **[Open]**. Options considered: darker gray, lighter gray (hurts bar/column accessibility; stacked bars can rely on legend and outline), or a neutral tan/off-yellow that avoids good/bad connotation.

### 4.6 Divergent palettes (exploratory)

- Teal ↔ Gray ↔ Red and Green ↔ Yellow ↔ Red are the working sets. Blue/Yellow/Orange/Purple and Green/Yellow/Orange/Purple sets are exploratory.
- Step counts: 11 (5…-5), 9, 7, 5 or 3.
- Avoid red/green as the only differentiator for good versus bad.

## 5. Chart property rules

### Area
- Color: single only (gradient).
- Axes: title; steps with the option to show every other label; X grid lines; X and Y labels truncate with ellipsis; Y labels flat or slanted (single) and flat only (stacked); ticks.
- Line style: curved, for trend stories.

### Line
- Color: categorical only.
- Legend: symbols (icon, color), label, sub-label.
- Axes: same as Area.
- Line style: non-curved for detailed stories, curved for trend stories; icons on hover.

### Bar and column (single)
- Color: single, sequential or categorical.
- Series spacing: 4, 8, 12, 16, 18, 20 or 24 px.
- Label: icons; left or right aligned. Label/bar column layouts: 2/10, 4/8, 6/6, 8/4.
- Prefix or suffix: $, #, K/M/B abbreviations, or a chip showing % change.

### Bar and column (stacked and grouped)
- Color: single or categorical. All other properties as single bar.

### Donut
- Color: categorical.
- Series: 2–10 segments; size 100, 200, 300, 400 or 500 px.
- Legend: label, sub-label; right or bottom; 1, 2, 3 or 5 columns. Donut/legend layouts 4/8, 6/6, 8/4.
- Center metric: total ($, #, K/M/B), subtext and % change.

### Funnel
- Color: sequential.
- Series: 3–6 stages (more if needed).
- Labels: name and count. Internal labels white, or gray when the value is larger than the container; external labels sit on top of the block.

## 6. Figma library guidance

- Layouts: define card layouts at the library level, let designers choose them at the file level, and allow rows and columns to be adjusted without losing file components.
- Allow graphs to be added directly from the library into data blocks, plus custom file components for extra content.
- Worth adopting: nested component props, auto-layout min/max indicators, scoped color variables, variable modes for instance sublayers, and color/number/text/boolean variables.
- The optimization table (Efficiency, Knowledge, Capabilities, Quality) is partly unfilled in the source.

## 6b. Building charts in Highcharts (no one-off code)

Principle: every chart is a Highcharts options object assembled from shared DBA configuration. Teams supply data and story text only. Do not hard-code colors, fonts, spacing or axis styling in an individual chart, and do not draw chart elements with custom SVG or CSS when a Highcharts option exists.

### Layered options

Highcharts merges options in layers. Use them in this order:

1. **Global DBA theme** (`Highcharts.setOptions`, one file shared by all products): palette and colors, fonts, backgrounds, grid lines, axis label styles, legend, tooltip, credits off, accessibility defaults. Highcharts themes are "a set of pre-defined options applied as default options before each chart is instantiated".
2. **Chart-type presets** (one small options object per v1 chart): Area, Line, Bar/Column single, Bar/Column stacked-grouped, Donut, Funnel, Data block. Each preset encodes the allowed color types and properties from Section 5.
3. **Chart instance options**: only title, series data and names, units and formatters. Nothing else.

Merge with a helper (for example `Highcharts.merge(preset, instance)`) rather than copying option blocks between charts.

### Colors

- Define the DBA ramps once (Section 4.4 hex sets) and expose them as the theme palette and as named color sets (primary blue, teal, green and so on). Charts reference a palette by name; they never contain hex literals.
- DBA is light mode only, so define only the light palette. Do not use `light-dark()` values.
- Highcharts accepts CSS variables in color options (v12.2+), so palette values can map to 6DS design tokens. Highcharts v13 also exposes `palette` options that styled defaults derive from; set the base palette first and override only what DBA requires. Confirm the Highcharts version in use before relying on either.
- Categorical charts: set `colors` to the categorical set in order, with gray last for "Other".
- Sequential and heatmap charts: use `colorAxis` with the ramp steps (white stop at -0.025, ramp steps at 0.1 to 0.9, last step at 0.95, black at 1.025, per the Highcharts Color Themes page). Choose step counts from the Section 4.4 table.
- Divergent charts: `colorAxis` stops across the 11-step divergent set.

### Chart type mapping

| DBA chart | Highcharts series | Notes |
|---|---|---|
| Area | `area` (use `areaspline` for the curved trend style) | Single color, gradient fill |
| Line | `line` (`spline` for curved trend style) | Categorical colors; icons or markers on hover |
| Bar (single, stacked, grouped) | `bar` for horizontal, `column` for vertical; `plotOptions.series.stacking` for stacked | Spacing via `pointPadding`/`groupPadding`; value prefix/suffix via `dataLabels.format` |
| Donut | `pie` with `innerSize` | 2–10 segments; total in the center via a title or label option |
| Funnel | `funnel` (module required) | Sequential colors, 3–6 stages |
| Heatmap | `heatmap` plus `colorAxis` | Not in v1 |
| Map | Highcharts Maps `map` series plus `colorAxis` | Not in v1 |

Load only the modules needed (for example `funnel`, `heatmap`, `accessibility`, `pattern-fill`) to keep bundles small.

### Accessibility

- Always load and enable the Accessibility module. Provide a chart title, series names and a text description for every chart.
- Color is not the only differentiator: back it with legends, labels, outlines or Highcharts pattern fills (`pattern-fill` module) where categories could be confused. This matches the DBA rule that both color and chart functions must pass WCAG.
- Keep every color at 3:1 contrast or better against the plot background.

### Labels and formatting

- Use Highcharts format strings and formatters for $, #, K/M/B abbreviations and % change chips, defined once as shared helpers.
- Use axis `labels` options for step skipping and truncation instead of manual text edits.
- Use `responsive.rules` for container-size changes instead of separate charts per breakpoint.

### Example structure

```js
// dba-theme.js (shared, loaded once)
Highcharts.setOptions({
  colors: DBA.categorical,            // from the chroma-trajectory token set
  chart: { backgroundColor: DBA.surface, style: { fontFamily: DBA.font } },
  credits: { enabled: false },
  accessibility: { enabled: true },
  xAxis: { gridLineColor: DBA.grid, labels: { style: { color: DBA.text } } },
  yAxis: { gridLineColor: DBA.grid, labels: { style: { color: DBA.text } } },
  legend: { itemStyle: { color: DBA.text } }
});

// presets/line.js
export const linePreset = { chart: { type: 'line' }, plotOptions: { line: { marker: { enabled: false } } } };

// a product chart: story-specific options only
Highcharts.chart('container', Highcharts.merge(linePreset, {
  title: { text: 'Accounts engaged over time' },
  accessibility: { description: 'Line chart of engaged accounts by week.' },
  series: [{ name: 'Engaged', data }]
}));
```

`DBA.*` values are placeholders for the token-derived values from Section 4; they are not defined in the source pages.

### Rules

1. No hex colors, font names or pixel spacing inside a chart definition; use theme and presets.
2. New styling needs go into the theme or a preset (and into this guide), never into a single chart.
3. A chart type or property not in Section 5 is built by the product team on top of the shared theme, and flagged to DBA.
4. Prefer official Highcharts options and modules over custom SVG renderer code.
5. Do not mix chart-level `colors` overrides with the theme palette unless the story requires it (for example a highlight color), and document the exception.

## 7. Open items from the sources

1. Divergent colors for Funnel: needs discussion.
2. "Other" gray vs Delta E 94 threshold.
3. Order of the 15-stop categorical set.
4. Divergent palettes are exploratory and unused.
5. Donut, Heatmap and Map are not in v1.
6. Source pages are from 2023 and the guide is labeled "in process and discovery".

## Sources

Highcharts documentation (reference for Section 6b):
- [How to set options](https://www.highcharts.com/docs/getting-started/how-to-set-options)
- [Themes](https://www.highcharts.com/docs/chart-design-and-style/themes)
- [Colors](https://www.highcharts.com/docs/chart-design-and-style/colors)
- [Accessibility module](https://www.highcharts.com/docs/accessibility/accessibility-module)

Confluence (6sense):

- [Guide to DBA charts & colors lvl.1](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2819490412/Guide+to+DBA+charts+colors+lvl.1)
- [DBA design FAQ](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2862743787/DBA+design+FAQ)
- [Color Palettes for data](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2772238357/Color+Palettes+for+data)
- [Data Visualization Palettes for DBA](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2800713932/Data+Visualization+Palettes+for+DBA)
- [Categorical/Qualitative Palette: Investigation](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2780627001/Categorical+Qualitative+Palette+Investigation)
- [Color ramp exploration using chroma trajectory](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2789081487/Color+ramp+exploration+using+chroma+trajectory) (linked from the chroma trajectory page)
- [Sequential using chroma trajectory](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2789310578/Sequential+using+chroma+trajectory)
- [Color Themes: Highcharts](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2793211909/Color+Themes+Highcharts)
- [DBA palette: light mode only](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2788493486/DBA+palette+light+mode+only)
- [Charts and Properties](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2819851625/Charts+and+Properties)
- [Area](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2820112776/Area)
- [Bar Graphs (single)](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2820112795/Bar+Graphs+single)
- [Bar Graphs (Stacked & Grouped)](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2820112813/Bar+Graphs+Stacked+Grouped)
- [Donut](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2820145349/Donut)
- [Funnel](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2821455873/Funnel)
- [Line Graph](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/2820440222/Line+Graph)
- [Figma Library - Optimization](https://6sense.atlassian.net/wiki/spaces/~623f635ea2f6400069ecee33/pages/3097952423/Figma+Library+-+Optimization)
