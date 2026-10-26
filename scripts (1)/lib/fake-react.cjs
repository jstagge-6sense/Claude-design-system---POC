// Minimal stand-in for React used ONLY by scripts/smoke-test.mjs (no npm install is possible offline).
// It runs every component's render function once with initial state so ReferenceErrors, bad imports and
// bad prop access surface. It does not run effects, events, layout or CSS. Real React still needs a browser test.
const ctxStack = []
let idCounter = 0
const Fragment = Symbol('Fragment'), Suspense = Symbol('Suspense'), StrictMode = Symbol('StrictMode')
function createElement(type, props, ...children) {
  props = { ...(props || {}) }
  if (children.length) props.children = children.length === 1 ? children[0] : children
  return { $$: 1, type, props, key: props.key }
}
const isValidElement = (x) => !!(x && x.$$ === 1)
class Component { constructor(props) { this.props = props; this.state = {} } setState() {} forceUpdate() {} }
Component.prototype.isReactComponent = {}
const toArray = (c) => (c == null || c === false ? [] : Array.isArray(c) ? c.flatMap(toArray) : [c])
const Children = {
  map: (c, fn) => toArray(c).map((x, i) => fn(x, i)), forEach: (c, fn) => toArray(c).forEach((x, i) => fn(x, i)),
  toArray, count: (c) => toArray(c).length, only: (c) => c,
}
const cloneElement = (el, props, ...children) => createElement(el.type, { ...el.props, ...props }, ...(children.length ? children : []))
const createContext = (def) => { const ctx = { $$ctx: 1, _default: def }; ctx.Provider = { $$provider: 1, ctx }; ctx.Consumer = { $$consumer: 1, ctx }; return ctx }
const hooks = {
  useState: (i) => [typeof i === 'function' ? i() : i, () => {}],
  useReducer: (r, i, init) => [init ? init(i) : i, () => {}],
  useRef: (v) => ({ current: v === undefined ? null : v }),
  useMemo: (fn) => fn(), useCallback: (fn) => fn,
  useEffect: () => {}, useLayoutEffect: () => {}, useInsertionEffect: () => {}, useImperativeHandle: () => {}, useDebugValue: () => {},
  useId: () => ':r' + (idCounter++).toString(36) + ':',
  useContext: (ctx) => { for (let i = ctxStack.length - 1; i >= 0; i--) if (ctxStack[i][0] === ctx) return ctxStack[i][1]; return ctx._default },
  useSyncExternalStore: (sub, get) => get(), useDeferredValue: (v) => v, useTransition: () => [false, (fn) => fn()],
}
const forwardRef = (render) => ({ $$fwd: 1, render })
const memo = (type) => ({ $$memo: 1, type })
const lazy = (f) => ({ $$lazy: 1, f })
const stats = { elements: 0 }
function expand(node, depth = 0) {
  if (depth > 200) throw new Error('render depth exceeded (possible infinite recursion)')
  if (node == null || typeof node === 'boolean' || typeof node === 'string' || typeof node === 'number') return
  if (Array.isArray(node)) { node.forEach((n) => expand(n, depth + 1)); return }
  if (!isValidElement(node)) { if (typeof node === 'object' && node.$$typeof) return; throw new Error('Objects are not valid as a React child: ' + Object.prototype.toString.call(node) + ' ' + JSON.stringify(Object.keys(node))) }
  stats.elements++
  const { type, props } = node
  if (typeof type === 'string') { if (props.dangerouslySetInnerHTML && props.children != null) throw new Error('both children and dangerouslySetInnerHTML on <' + type + '>'); expand(props.children, depth + 1); return }
  if (type === Fragment || type === Suspense || type === StrictMode) { expand(props.children, depth + 1); return }
  if (type && type.$$provider) { ctxStack.push([type.ctx, props.value]); try { expand(props.children, depth + 1) } finally { ctxStack.pop() } return }
  if (type && type.$$consumer) { expand(props.children(hooks.useContext(type.ctx)), depth + 1); return }
  if (type && type.$$fwd) { expand(type.render(props, null), depth + 1); return }
  if (type && type.$$memo) { expand({ $$: 1, type: type.type, props }, depth + 1); return }
  if (type && type.$$lazy) return
  if (typeof type === 'function') {
    if (type.prototype && type.prototype.isReactComponent) {
      const inst = new type(props); expand(inst.render(), depth + 1); return
    }
    const out = type(props); expand(out, depth + 1); return
  }
  throw new Error('Element type is invalid: ' + String(type))
}
const React = { createElement, Fragment, Suspense, StrictMode, Component, PureComponent: Component, Children, cloneElement, isValidElement, createContext, forwardRef, memo, lazy, ...hooks, version: '18.3.1-fake' }
const jsx = (type, props, key) => { const p = { ...(props || {}) }; if (key !== undefined) p.key = key; return { $$: 1, type, props: p, key } }
module.exports = { React, jsx, expand, stats, hooks, createPortal: (children) => children }
