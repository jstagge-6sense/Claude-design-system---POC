# 6DS team kit

Everything needed to rebuild and extend the 6sense design-system component library and its `@6si/components` package, for use by a team or in Cowork.

| Path | What it is |
|---|---|
| `RUNBOOK.md` | The steps, in order: 1 components, 2 tokens (with dark mode and sizes), 4 trim, 8 6DS package, 3 preview |
| `COWORK-PROMPT.md` | Paste-in prompt for a Cowork session |
| `config/targets.json` | GitHub repo and Figma file the team points at |
| `scripts/first-run.mjs` | First run: shows targets, asks whether to update them |
| `scripts/build-all.sh` | Runs the whole runbook on a normal machine |
| `package/` | The library and 6DS package source (tokens, 51 components, MUI bridge, hook-form, examples, docs, design source MD files) |
| `package/src/charts/` | Seven Highcharts DBA charts (Area spline, Line, Bar, Stacked/Grouped bar, Donut, Funnel, Pareto) |
| `reference/` | Usage and cost notes, scope decisions |

Scope: 6DS package only. The basic React build, the GitHub publish script and CI, and the Figma sample-page rebuild are not included.

Quick start: `node scripts/first-run.mjs`, then follow `RUNBOOK.md`.
