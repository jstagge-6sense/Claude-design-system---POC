# Using this kit in Cowork

1. Select the `6ds-team-kit` folder as your working folder.
2. Paste this:

> Follow RUNBOOK.md in this folder, in the order it gives (1, 2, 4, 8, 3). First run `scripts/first-run.mjs` logic: show me the GitHub and Figma targets in config/targets.json and ask if I want to update them. Do not push to GitHub or write to Figma. Ask before deleting anything. Report each step's "Done when" result.

3. Cowork's sandbox may block `npm install`. The token scripts and preview build use plain Node and still run. Run `scripts/build-all.sh` on your own machine for the full package build.

Guardrails: do not paste customer-tenant exports or contract text into the session. Design rules in `package/docs/source` are 6sense-owned and fine to use.
