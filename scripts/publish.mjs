#!/usr/bin/env node
// Approval-gated publish to GitHub. Nothing is pushed unless you pass --approve.
//   node scripts/publish.mjs "Short summary of the change"            dry run: runs every check, shows what would be pushed
//   node scripts/publish.mjs "Short summary of the change" --approve   branch + commit + push + open a PR
// Flags: --remote <name> (default origin)   --base <branch> (default main)   --no-pr (push the branch only)
// Gates, in order (any failure stops before git is touched): token build, mode build with WCAG contrast, token lint,
// component check, smoke test. It never pushes to main directly, never force-pushes, and never stores credentials:
// git and gh use whatever you are already signed in with.
import { execFileSync, spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const argv = process.argv.slice(2)
const flag = (n) => argv.includes(n)
const val = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d)
const summary = argv.find((a, i) => !a.startsWith('--') && !['--remote', '--base'].includes(argv[i - 1]))
if (!summary) { console.error('Give a one-line summary: node scripts/publish.mjs "What changed" [--approve]'); process.exit(1) }
const approve = flag('--approve'), remote = val('--remote', 'origin'), base = val('--base', 'main')
const root = resolve('.')
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: opts.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'], ...opts })
const tryRun = (cmd, args) => { const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : null }

console.log('1/3 Gates')
for (const [label, args] of [
  ['tokens', ['scripts/build-tokens.mjs', '.']],
  ['modes + contrast', ['scripts/build-modes.mjs', '.']],
  ['lean set + lint', ['scripts/lean-tokens.mjs', '.']],
  ['component check', ['scripts/check-components.mjs']],
  ['smoke test', ['scripts/smoke-test.mjs']],
]) {
  try { run('node', args); console.log(`  pass  ${label}`) } catch (e) { console.error(`  FAIL  ${label}\n${e.stdout || ''}${e.stderr || ''}`); process.exit(1) }
}

if (!tryRun('git', ['rev-parse', '--is-inside-work-tree'])) { console.error('Not a git repository. Run: git init && git remote add origin <your-repo-url>'); process.exit(1) }
if (!tryRun('git', ['remote', 'get-url', remote])) { console.error(`No git remote named "${remote}". Run: git remote add ${remote} <your-repo-url>`); process.exit(1) }
const status = run('git', ['status', '--porcelain']).trim()
console.log('\n2/3 Changes' + (status ? '' : ' (none)'))
console.log(status || '  Nothing to commit.')
if (!status) process.exit(0)

const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
const branch = `tokens/update-${stamp}`
if (!approve) {
  console.log(`\nDRY RUN. With --approve this would create branch ${branch}, commit "${summary}", push to ${remote}, and open a PR into ${base}.`)
  process.exit(0)
}

console.log(`\n3/3 Publishing to ${remote} as ${branch}`)
run('git', ['checkout', '-b', branch], { inherit: true })
run('git', ['add', '-A'], { inherit: true })
run('git', ['commit', '-m', summary, '-m', 'Approved by the design system owner. Gates passed: token build, WCAG contrast, token lint, component check, smoke test.'], { inherit: true })
run('git', ['push', '-u', remote, branch], { inherit: true })
if (flag('--no-pr')) { console.log('Pushed. Open a PR from the branch when ready.'); process.exit(0) }
if (tryRun('gh', ['--version'])) {
  run('gh', ['pr', 'create', '--base', base, '--head', branch, '--title', summary, '--body', 'Approved token or component update. All gates passed (token build, WCAG contrast for dark mode, token lint, component check, smoke test). Review the diff in tokens/ and src/components/.'], { inherit: true })
} else {
  console.log(`GitHub CLI (gh) not found. Pushed ${branch}. Open a PR into ${base} from the GitHub UI.`)
}
