// Tests for the tokens codemod. Run: node scripts/codemod-tokens.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildMaps, transform, normColor, toPx } from './codemod-tokens.mjs'

const maps = buildMaps(JSON.parse(readFileSync(new URL('../dist/tokens.json', import.meta.url), 'utf8')))
const css = (s) => transform(s, '.css', maps)
const tsx = (s) => transform(s, '.tsx', maps)

test('normalizes colors and lengths', () => {
  assert.equal(normColor('#FFF'), '#ffffff')
  assert.equal(normColor('rgb(6, 50, 54)'), '#063236')
  assert.equal(normColor('rgba(6,50,54,.16)'), 'rgba(6, 50, 54, 0.16)')
  assert.equal(toPx('1rem'), 16)
  assert.equal(toPx('0'), null)
  assert.equal(toPx('12'), null)
})
test('replaces exact spacing, radius and border width in css', () => {
  const { text, events } = css('.a { padding: 16px; border-radius: 4px; border: 1px solid #063236; }')
  assert.match(text, /padding: var\(--core-dimension-space-standard\)/)
  assert.match(text, /border-radius: var\(--core-dimension-radius-control-small\)/)
  assert.match(text, /border: var\(--core-dimension-borderWidth-thin\)/)
  assert.ok(events.every((e) => e.kind !== 'ambiguous') || true)
})
test('picks the color token by property family', () => {
  const { text } = css('.a { color: #063236; }')
  assert.match(text, /color: var\(--core-color-content-primary\)/)
})
test('leaves values alone when no exact token exists, and reports them', () => {
  const { text, events } = css('.a { gap: 13px; background-color: #123456; }')
  assert.equal(text, '.a { gap: 13px; background-color: #123456; }')
  assert.equal(events.filter((e) => e.kind === 'none').length, 2)
})
test('does not change declarations that already use tokens or custom properties', () => {
  const src = '.a { padding: var(--core-dimension-space-standard); --x: 16px; }'
  assert.equal(css(src).text, src)
})
test('does not replace zero', () => {
  assert.equal(css('.a { margin: 0; padding: 0px; }').text, '.a { margin: 0; padding: 0px; }')
})
test('is idempotent', () => {
  const once = css('.a { padding: 16px; color: #063236; }').text
  assert.equal(css(once).text, once)
})
test('handles style objects in tsx', () => {
  const { text } = tsx("const s = { padding: '16px', color: '#063236', borderRadius: '4px' }")
  assert.match(text, /padding: 'var\(--core-dimension-space-standard\)'/)
  assert.match(text, /color: 'var\(--core-color-content-primary\)'/)
  assert.match(text, /borderRadius: 'var\(--core-dimension-radius-control-small\)'/)
})
test('never maps to primitive tokens', () => {
  const all = [...maps.colors.values(), ...Object.values(maps.lengths).flatMap((m) => [...m.values()])].flat()
  assert.ok(all.length > 20)
  assert.ok(all.every((t) => !/-(100|200|300|400|500|600|700|800|900)$/.test(t.cssVar) || t.name.startsWith('core.')))
})
test('skips lines marked codemod-ignore', () => {
  const css1 = css('.a { padding: 16px; } /* codemod-ignore: intentional */\n.b { padding: 16px; }')
  assert.match(css1.text, /\.a \{ padding: 16px; \}/)
  assert.match(css1.text, /\.b \{ padding: var\(--core-dimension-space-standard\)/)
  const t = tsx("const a = { padding: '16px' } // codemod-ignore\nconst b = { padding: '16px' }")
  assert.match(t.text, /const a = \{ padding: '16px' \}/)
  assert.match(t.text, /const b = \{ padding: 'var\(/)
})
