#!/usr/bin/env bash
# Runs the runbook in order: 1 components, 2 tokens, 4 trim, 8 package, 3 preview.
# Needs Node 20+ and a normal npm environment.
set -euo pipefail
cd "$(dirname "$0")/../package"
npm install
node scripts/check-components.mjs        # Step 1: 51 components present and complete
npm run build:tokens                     # Step 2 (+5): primitive, semantic, component tokens plus dark mode and sizes
npm run lint:tokens
npm run build:lean                       # Step 4: drop pass-through tokens (1,567 -> 884)
npm run build:mui-theme                  # Step 8: Material UI theme from tokens
npm run build && npm run typecheck && npm test   # Step 8: ESM + CJS package, types, tests
npm run preview                          # Step 3: single-file preview -> preview/design-system-preview.html
