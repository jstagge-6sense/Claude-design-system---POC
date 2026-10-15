/* mini-react: a small React 18 compatible runtime (elements, hooks, context, portals, refs, error boundaries).
 * Used ONLY so the single-file preview renders without loading React from a CDN (the in-app file preview blocks network).
 * The shipped library imports the real `react`. Exposes window.React and window.ReactDOM. */
(function () {
  'use strict'
  var TEXT = Symbol('text'), Fragment = Symbol('Fragment'), PORTAL = Symbol('Portal'), Suspense = Symbol('Suspense'), StrictMode = Symbol('StrictMode')
  var idc = 0

  // ---------- elements ----------
  function createElement(type, config) {
    var props = {}, key = null, ref = null, i, k
    if (config) { for (k in config) { if (k === 'key') key = config[k] == null ? null : '' + config[k]; else if (k === 'ref') ref = config[k]; else props[k] = config[k] } }
    var n = arguments.length - 2
    if (n === 1) props.children = arguments[2]
    else if (n > 1) { var arr = new Array(n); for (i = 0; i < n; i++) arr[i] = arguments[i + 2]; props.children = arr }
    if (type && type.defaultProps) for (k in type.defaultProps) if (props[k] === undefined) props[k] = type.defaultProps[k]
    return { $$: 1, type: type, props: props, key: key, ref: ref }
  }
  function isValidElement(x) { return !!(x && x.$$ === 1) }
  function cloneElement(el, config) {
    var props = Object.assign({}, el.props), key = el.key, ref = el.ref, k
    if (config) for (k in config) { if (k === 'key') key = '' + config[k]; else if (k === 'ref') ref = config[k]; else props[k] = config[k] }
    var n = arguments.length - 2
    if (n === 1) props.children = arguments[2]; else if (n > 1) props.children = Array.prototype.slice.call(arguments, 2)
    return { $$: 1, type: el.type, props: props, key: key, ref: ref }
  }
  function flat(c, out) {
    if (Array.isArray(c)) { for (var i = 0; i < c.length; i++) flat(c[i], out) } else if (c != null && typeof c !== 'boolean') out.push(c)
    return out
  }
  function toArray(c) {
    var out = flat(c, []), res = []
    for (var i = 0; i < out.length; i++) { var x = out[i]; res.push(isValidElement(x) ? Object.assign({}, x, { key: (x.key != null ? '.$' + x.key : '.' + i) }) : x) }
    return res
  }
  var Children = {
    map: function (c, fn) { return toArray(c).map(function (x, i) { return fn(x, i) }) },
    forEach: function (c, fn) { toArray(c).forEach(function (x, i) { fn(x, i) }) },
    count: function (c) { return toArray(c).length },
    toArray: toArray,
    only: function (c) { if (!isValidElement(c)) throw new Error('React.Children.only expected a single element'); return c },
  }
  function createContext(def) { var ctx = { _default: def }; ctx.Provider = { $$provider: 1, ctx: ctx }; ctx.Consumer = { $$consumer: 1, ctx: ctx }; return ctx }
  function forwardRef(render) { return { $$fwd: 1, render: render } }
  function memo(type, cmp) { return { $$memo: 1, type: type, cmp: cmp } }
  function lazy() { throw new Error('React.lazy is not supported in the preview runtime') }
  function createRef() { return { current: null } }
  function Component(props) { this.props = props; this.state = undefined }
  Component.prototype.isReactComponent = {}
  Component.prototype.setState = function (p, cb) {
    var next = typeof p === 'function' ? p(this.state, this.props) : p
    this.state = Object.assign({}, this.state, next)
    if (this.__inst) schedule(this.__inst)
    if (cb) cb()
  }
  Component.prototype.forceUpdate = function () { if (this.__inst) schedule(this.__inst) }

  // ---------- instances ----------
  var dirty = new Set(), queued = false, layoutQ = [], passiveQ = [], passiveTimer = 0, current = null, hookIdx = 0

  function typeKind(t) {
    if (typeof t === 'string') return 'host'
    if (t === TEXT) return 'text'
    if (t === Fragment || t === Suspense || t === StrictMode) return 'frag'
    if (t === PORTAL) return 'portal'
    if (typeof t === 'function') return t.prototype && t.prototype.isReactComponent ? 'class' : 'comp'
    if (t && t.$$fwd) return 'comp'
    if (t && t.$$memo) return 'memo'
    if (t && t.$$provider) return 'provider'
    if (t && t.$$consumer) return 'consumer'
    throw new Error('Element type is invalid: ' + String(t))
  }
  function normalize(c) {
    var out = []
    ;(function walk(x) {
      if (Array.isArray(x)) { for (var i = 0; i < x.length; i++) walk(x[i]); return }
      if (x == null || typeof x === 'boolean') return
      if (typeof x === 'string' || typeof x === 'number') { out.push({ $$: 1, type: TEXT, props: { text: '' + x }, key: null, ref: null }); return }
      if (x.$$ === 1) { out.push(x); return }
      throw new Error('Objects are not valid as a React child (found: ' + Object.prototype.toString.call(x) + ')')
    })(c)
    return out
  }
  function sameType(inst, v) { return inst.type === v.type }
  function mkInst(vnode, parent) {
    return { kind: typeKind(vnode.type), type: vnode.type, key: vnode.key, vnode: vnode, parent: parent, depth: parent ? parent.depth + 1 : 0, children: [], dom: null, hooks: [], pending: [], subs: null, dirty: false, unmounted: false, isNew: true, isSvg: false }
  }
  function reconcile(parent, vnodes) {
    var old = parent.children, oldKeyed = new Map(), oldUn = [], used = new Set(), next = [], ui = 0, i, v, cand, inst
    for (i = 0; i < old.length; i++) { if (old[i].key != null) oldKeyed.set(old[i].key, old[i]); else oldUn.push(old[i]) }
    for (i = 0; i < vnodes.length; i++) {
      v = vnodes[i]
      if (v.key != null) { cand = oldKeyed.get(v.key); if (cand && (cand.type !== v.type || used.has(cand))) cand = null } else { cand = oldUn[ui++]; if (cand && cand.type !== v.type) cand = null }
      if (cand) { used.add(cand); inst = cand; inst.isNew = false; inst.vnode = v; inst.key = v.key } else inst = mkInst(v, parent)
      parent.children = next // keep parent chain valid during render of child
      next.push(inst)
      renderInst(inst)
    }
    for (i = 0; i < old.length; i++) if (!used.has(old[i])) unmount(old[i], true)
    parent.children = next
  }

  function domNodes(inst) {
    if (inst.kind === 'host' || inst.kind === 'text') return [inst.dom]
    if (inst.kind === 'portal') return []
    var out = []
    for (var i = 0; i < inst.children.length; i++) { var n = domNodes(inst.children[i]); for (var j = 0; j < n.length; j++) out.push(n[j]) }
    return out
  }
  function syncDom(owner) {
    var list = []
    for (var i = 0; i < owner.children.length; i++) { var n = domNodes(owner.children[i]); for (var j = 0; j < n.length; j++) list.push(n[j]) }
    var parentDom = owner.kind === 'host' ? owner.dom : owner.container
    if (owner.kind === 'portal') { for (i = 0; i < list.length; i++) if (list[i].parentNode !== parentDom) parentDom.appendChild(list[i]); return }
    var cur = parentDom.firstChild
    for (i = 0; i < list.length; i++) { var nd = list[i]; if (cur === nd) cur = cur.nextSibling; else parentDom.insertBefore(nd, cur) }
  }
  function domOwner(inst) {
    var p = inst.parent
    while (p && p.kind !== 'host' && p.kind !== 'portal' && p.kind !== 'root') p = p.parent
    return p
  }
  function unmount(inst, removeDom) {
    if (inst.unmounted) return
    inst.unmounted = true
    dirty.delete(inst)
    if (removeDom) { var ns = domNodes(inst); for (var i = 0; i < ns.length; i++) if (ns[i] && ns[i].parentNode) ns[i].parentNode.removeChild(ns[i]) }
    for (var c = 0; c < inst.children.length; c++) unmount(inst.children[c], false)
    for (var h = 0; h < inst.hooks.length; h++) { var r = inst.hooks[h]; if (r && r.$$eff && r.cleanup) { try { r.cleanup() } catch (e) { console.error(e) } r.cleanup = null } }
    if (inst.kind === 'host') setRef(inst.vnode.ref, null)
    if (inst.kind === 'class' && inst.obj && inst.obj.componentWillUnmount) inst.obj.componentWillUnmount()
    if (inst.ctxProv) inst.ctxProv.subs.delete(inst)
  }
  function setRef(ref, value) { if (!ref) return; if (typeof ref === 'function') ref(value); else ref.current = value }

  // ---------- rendering ----------
  function renderInst(inst) {
    var v = inst.vnode, k = inst.kind, props = v.props, prev = inst.prevProps
    var prevRender = current, prevIdx = hookIdx
    try {
      if (k === 'text') {
        if (inst.isNew) inst.dom = document.createTextNode(props.text); else if (inst.dom.nodeValue !== props.text) inst.dom.nodeValue = props.text
      } else if (k === 'host') {
        var isNew = !inst.dom
        if (isNew) {
          inst.isSvg = v.type === 'svg' || (inst.parent && inst.parent.isSvg && inst.parent.type !== 'foreignObject') || (inst.parent && inst.parent.kind !== 'host' && inheritSvg(inst))
          inst.dom = inst.isSvg ? document.createElementNS('http://www.w3.org/2000/svg', v.type) : document.createElement(v.type)
        }
        applyProps(inst, isNew ? {} : prev, props)
        if (props.dangerouslySetInnerHTML == null) reconcile(inst, normalize(props.children))
        syncDom(inst)
        afterHost(inst, props)
        if (inst.lastRef !== v.ref) { setRef(inst.lastRef, null); setRef(v.ref, inst.dom); inst.lastRef = v.ref }
      } else if (k === 'frag') {
        reconcile(inst, normalize(props.children))
      } else if (k === 'portal') {
        inst.container = props.container
        reconcile(inst, normalize(props.children))
        syncDom(inst)
      } else if (k === 'provider') {
        if (!inst.subs) inst.subs = new Set()
        var changed = !inst.isNew && prev && !Object.is(prev.value, props.value)
        reconcile(inst, normalize(props.children))
        if (changed) inst.subs.forEach(function (s) { schedule(s) })
      } else if (k === 'consumer') {
        reconcile(inst, normalize(props.children(readCtx(inst, v.type.ctx))))
      } else if (k === 'memo') {
        if (!inst.isNew && !inst.dirty && prev && (v.type.cmp ? v.type.cmp(prev, props) : shallowEq(prev, props)) && inst.vnode.ref === inst.lastRef2) { /* bail out */ }
        else { inst.lastRef2 = v.ref; reconcile(inst, normalize(createElement(v.type.type, Object.assign({}, props, v.ref ? { ref: v.ref } : null)))) }
      } else if (k === 'comp') {
        current = inst; hookIdx = 0
        var t = v.type, out = t.$$fwd ? t.render(props, v.ref) : t(props)
        current = prevRender
        reconcile(inst, normalize(out))
        if (inst.pending.length) { flushPending(inst) }
      } else if (k === 'class') {
        if (!inst.obj) { inst.obj = new v.type(props); inst.obj.__inst = inst; if (inst.obj.state === undefined) inst.obj.state = null }
        inst.obj.props = props
        if (v.type.getDerivedStateFromProps) { var s = v.type.getDerivedStateFromProps(props, inst.obj.state); if (s) inst.obj.state = Object.assign({}, inst.obj.state, s) }
        var childV
        try {
          childV = normalize(inst.obj.render())
          reconcile(inst, childV)
        } catch (err) {
          if (v.type.getDerivedStateFromError) {
            inst.obj.state = Object.assign({}, inst.obj.state, v.type.getDerivedStateFromError(err))
            reconcile(inst, normalize(inst.obj.render()))
          } else throw err
        }
      }
    } finally { current = prevRender; hookIdx = prevIdx }
    inst.prevProps = props
    inst.dirty = false
    if (k === 'comp' && inst.isNew) inst.isNew = false
  }
  function inheritSvg(inst) { var p = inst.parent; while (p && p.kind !== 'host') p = p.parent; return !!(p && p.isSvg && p.type !== 'foreignObject') }
  function shallowEq(a, b) { var ka = Object.keys(a), kb = Object.keys(b); if (ka.length !== kb.length) return false; for (var i = 0; i < ka.length; i++) if (!Object.is(a[ka[i]], b[ka[i]])) return false; return true }
  function flushPending(inst) { for (var i = 0; i < inst.pending.length; i++) { var r = inst.pending[i]; (r.layout ? layoutQ : passiveQ).push(r) } inst.pending = [] }

  // ---------- host props ----------
  var UNITLESS = /^(opacity|zIndex|flex|flexGrow|flexShrink|flexOrder|order|fontWeight|lineHeight|zoom|gridRow|gridColumn|gridRowStart|gridRowEnd|gridColumnStart|gridColumnEnd|scale|tabSize|widows|orphans|fillOpacity|strokeOpacity|strokeWidth|columnCount|aspectRatio|WebkitLineClamp)$/
  var SVG_KEBAB = /^(strokeWidth|strokeLinecap|strokeLinejoin|strokeDasharray|strokeDashoffset|strokeOpacity|strokeMiterlimit|fillOpacity|fillRule|clipRule|clipPath|textAnchor|stopColor|stopOpacity|fontSize|fontFamily|fontWeight|dominantBaseline|alignmentBaseline|markerEnd|markerStart|markerMid|vectorEffect|shapeRendering|pointerEvents|colorInterpolation|floodColor|floodOpacity|lightingColor|textDecoration|letterSpacing|wordSpacing|paintOrder)$/
  var BOOL_ATTR = /^(hidden|disabled|required|open|multiple|readOnly|selected|controls|autoPlay|loop|muted|inert|download|noValidate|reversed|default|async|defer|checked)$/
  function kebab(s) { return s.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase() }) }
  function evType(dom, name) {
    var n = name.toLowerCase()
    if (n === 'doubleclick') return 'dblclick'
    if (n === 'focus') return 'focusin'
    if (n === 'blur') return 'focusout'
    if (n === 'change') { var tag = dom.tagName, t = dom.type; return tag === 'SELECT' || t === 'checkbox' || t === 'radio' || t === 'file' ? 'change' : 'input' }
    return n
  }
  function setEvent(dom, k, v) {
    var cap = /Capture$/.test(k), name = k.slice(2).replace(/Capture$/, ''), type = evType(dom, name), key = type + (cap ? '_c' : '')
    var h = dom.__h || (dom.__h = {})
    if (v == null) { if (h[key]) { dom.removeEventListener(type, h[key].l, cap); delete h[key] } return }
    if (h[key]) { h[key].f = v; return }
    var rec = { f: v }
    rec.l = function (e) {
      if (e.nativeEvent === undefined) { try { e.nativeEvent = e } catch (x) { /* readonly */ } }
      rec.f(e)
      if (type === 'input' || type === 'change') queueMicrotask(function () { restoreControlled(dom) })
    }
    dom.addEventListener(type, rec.l, cap)
    h[key] = rec
  }
  function restoreControlled(dom) {
    var p = dom.__p; if (!p) return
    if (p.value !== undefined && p.value !== null && dom.value !== '' + p.value) dom.value = p.value
    if (p.checked !== undefined && dom.checked !== !!p.checked) dom.checked = !!p.checked
  }
  function setStyle(dom, old, nw) {
    var st = dom.style, k
    if (typeof nw === 'string') { st.cssText = nw; return }
    if (typeof old === 'string') { st.cssText = ''; old = {} }
    old = old || {}; nw = nw || {}
    for (k in old) if (!(k in nw)) { if (k.charAt(0) === '-') st.removeProperty(k); else st[k] = '' }
    for (k in nw) {
      var val = nw[k]
      if (val === old[k]) continue
      if (val == null || val === false) { if (k.charAt(0) === '-') st.removeProperty(k); else st[k] = ''; continue }
      if (typeof val === 'number' && val !== 0 && !UNITLESS.test(k) && k.charAt(0) !== '-') val = val + 'px'
      if (k.charAt(0) === '-') st.setProperty(k, '' + val); else if (k === 'float') st.cssFloat = val; else st[k] = val
    }
  }
  function applyProps(inst, old, nw) {
    var dom = inst.dom, k, v, svg = inst.isSvg
    dom.__p = nw
    for (k in old) if (!(k in nw) && k !== 'children' && k !== 'key') setProp(dom, k, undefined, old[k], svg)
    if (nw.type !== undefined && nw.type !== old.type && !svg) dom.setAttribute('type', nw.type)
    for (k in nw) {
      if (k === 'children' || k === 'type' && !svg) continue
      v = nw[k]
      if (v !== old[k]) setProp(dom, k, v, old[k], svg)
    }
    if (svg && nw.type !== undefined && nw.type !== old.type) dom.setAttribute('type', nw.type)
  }
  function setProp(dom, k, v, old, svg) {
    if (k === 'key' || k === 'ref' || k === 'children' || k === 'suppressHydrationWarning' || k === 'suppressContentEditableWarning') return
    if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k.charCodeAt(2) >= 65 && k.charCodeAt(2) <= 90) { setEvent(dom, k, v); return }
    if (k === 'style') { setStyle(dom, old, v); return }
    if (k === 'className' || k === 'class') { if (svg) { if (v == null) dom.removeAttribute('class'); else dom.setAttribute('class', v) } else dom.className = v == null ? '' : v; return }
    if (k === 'dangerouslySetInnerHTML') { var html = v ? v.__html : ''; if (dom.innerHTML !== html) dom.innerHTML = html; return }
    if (k === 'value') { if (dom.tagName === 'SELECT') return; var sv = v == null ? '' : '' + v; if (dom.value !== sv) dom.value = sv; return }
    if (k === 'defaultValue') { if (dom.__dv === undefined) { dom.__dv = 1; dom.value = v == null ? '' : v } return }
    if (k === 'checked') { dom.checked = !!v; return }
    if (k === 'defaultChecked') { if (dom.__dc === undefined) { dom.__dc = 1; dom.checked = !!v } return }
    if (k === 'autoFocus') return
    if (k === 'htmlFor') { dom.setAttribute('for', v); return }
    if (k === 'tabIndex') { if (v == null) dom.removeAttribute('tabindex'); else dom.setAttribute('tabindex', v); return }
    if (k === 'indeterminate') { dom.indeterminate = !!v; return }
    var name = k
    if (svg) { if (SVG_KEBAB.test(k)) name = kebab(k); else if (k === 'xlinkHref') name = 'xlink:href' }
    else if (/^(aria-|data-|role$)/.test(k)) name = k
    else if (BOOL_ATTR.test(k)) { dom[k] = !!v; if (!v) dom.removeAttribute(k.toLowerCase()); return }
    else if (k in dom && !svg && typeof dom[k] !== 'object' && typeof dom[k] !== 'function') { try { if (v == null) { dom.removeAttribute(k.toLowerCase()); if (typeof dom[k] === 'string') dom[k] = '' } else dom[k] = v } catch (e) { dom.setAttribute(k.toLowerCase(), v) } return }
    else name = k.toLowerCase() === k ? k : (/^(viewBox|preserveAspectRatio)$/.test(k) ? k : k.toLowerCase())
    if (v == null || (v === false && !/^(aria-|data-)/.test(k))) dom.removeAttribute(name)
    else if (v === true && !/^(aria-|data-)/.test(k)) dom.setAttribute(name, '')
    else dom.setAttribute(name, '' + v)
  }
  function afterHost(inst, props) {
    var dom = inst.dom
    if (dom.tagName === 'SELECT' && props.value !== undefined) {
      var vals = Array.isArray(props.value) ? props.value.map(String) : ['' + props.value]
      for (var i = 0; i < dom.options.length; i++) dom.options[i].selected = vals.indexOf(dom.options[i].value) > -1
    }
    if (props.autoFocus && inst.isNew) layoutQ.push({ layout: true, run: function () { dom.focus() } })
  }

  // ---------- hooks ----------
  function slot(init) {
    if (!current) throw new Error('Hooks can only be called inside a component')
    var i = hookIdx++, h = current.hooks[i]
    if (!h) h = current.hooks[i] = init()
    return h
  }
  function useState(init) {
    var inst = current
    var h = slot(function () { var s = { v: typeof init === 'function' ? init() : init }; s.set = function (nv) { nv = typeof nv === 'function' ? nv(s.v) : nv; if (!Object.is(s.v, nv)) { s.v = nv; schedule(inst) } }; return s })
    return [h.v, h.set]
  }
  function useReducer(reducer, arg, init) {
    var inst = current
    var h = slot(function () { var s = { v: init ? init(arg) : arg, r: reducer }; s.dispatch = function (a) { var nv = s.r(s.v, a); if (!Object.is(s.v, nv)) { s.v = nv; schedule(inst) } }; return s })
    h.r = reducer
    return [h.v, h.dispatch]
  }
  function useRef(v) { return slot(function () { return { current: v === undefined ? null : v } }) }
  function depsChanged(a, b) { if (!a || !b) return true; if (a.length !== b.length) return true; for (var i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return true; return false }
  function useMemo(fn, deps) { var h = slot(function () { return { deps: null, v: undefined, init: false } }); if (!h.init || depsChanged(h.deps, deps)) { h.v = fn(); h.deps = deps; h.init = true } return h.v }
  function useCallback(fn, deps) { return useMemo(function () { return fn }, deps) }
  function effect(layout, fn, deps) {
    var h = slot(function () { return { $$eff: 1, deps: null, cleanup: null, fn: null, layout: layout, init: false, run: null } })
    if (!h.init || depsChanged(h.deps, deps)) {
      h.init = true; h.deps = deps; h.fn = fn
      h.run = function () { if (h.cleanup) { try { h.cleanup() } catch (e) { console.error(e) } h.cleanup = null } var r = h.fn(); h.cleanup = typeof r === 'function' ? r : null }
      current.pending.push(h)
    }
  }
  function useEffect(fn, deps) { effect(false, fn, deps) }
  function useLayoutEffect(fn, deps) { effect(true, fn, deps) }
  function useImperativeHandle(ref, create, deps) { effect(true, function () { var v = create(); setRef(ref, v); return function () { setRef(ref, null) } }, deps ? deps.concat([ref]) : undefined) }
  function readCtx(inst, ctx) {
    var p = inst.parent
    while (p) { if (p.kind === 'provider' && p.type.ctx === ctx) { p.subs.add(inst); inst.ctxProv = p; return p.vnode.props.value } p = p.parent }
    return ctx._default
  }
  function useContext(ctx) { return readCtx(current, ctx) }
  function useId() { return slot(function () { return { id: ':r' + (idc++).toString(36) + ':' } }).id }
  function useSyncExternalStore(subscribe, getSnapshot) {
    var inst = current, snap = getSnapshot()
    var h = slot(function () { return { snap: snap, get: getSnapshot } })
    h.snap = snap; h.get = getSnapshot
    useEffect(function () {
      var check = function () { if (!Object.is(h.get(), h.snap)) schedule(inst) }
      check()
      return subscribe(check)
    }, [subscribe])
    return snap
  }
  function useDeferredValue(v) { return v }
  function useTransition() { return [false, function (fn) { fn() }] }
  function startTransition(fn) { fn() }
  function useDebugValue() {}

  // ---------- scheduling ----------
  function schedule(inst) {
    if (inst.unmounted) return
    inst.dirty = true; dirty.add(inst)
    if (!queued) { queued = true; queueMicrotask(flush) }
  }
  function flush() {
    queued = false
    flushPassive()
    var guard = 0
    while (dirty.size && guard++ < 100) {
      var list = Array.from(dirty).sort(function (a, b) { return a.depth - b.depth })
      dirty.clear()
      for (var i = 0; i < list.length; i++) {
        var inst = list[i]
        if (inst.unmounted || !inst.dirty) continue
        try { renderInst(inst); var owner = domOwner(inst); if (owner) syncDom(owner) } catch (err) { handleError(inst, err) }
      }
      runLayout()
    }
    schedulePassive()
  }
  function handleError(inst, err) {
    var p = inst
    while (p) {
      if (p.kind === 'class' && p.type.getDerivedStateFromError) { p.obj.state = Object.assign({}, p.obj.state, p.type.getDerivedStateFromError(err)); schedule(p); return }
      p = p.parent
    }
    console.error(err)
    var el = document.getElementById('boot-error'); if (el) { el.hidden = false; el.textContent += '\n' + (err && err.stack || err) }
  }
  function runLayout() { var q = layoutQ; layoutQ = []; for (var i = 0; i < q.length; i++) { var r = q[i]; if (r.run) { try { r.run() } catch (e) { console.error(e) } } } }
  function schedulePassive() { if (passiveQ.length && !passiveTimer) passiveTimer = setTimeout(function () { passiveTimer = 0; flushPassive() }, 0) }
  function flushPassive() {
    if (passiveTimer) { clearTimeout(passiveTimer); passiveTimer = 0 }
    var q = passiveQ; passiveQ = []
    for (var i = 0; i < q.length; i++) { try { q[i].run() } catch (e) { console.error(e) } }
  }

  // ---------- ReactDOM ----------
  function createRoot(container) {
    var root = { kind: 'root', type: 'root', container: container, children: [], depth: 0, parent: null, hooks: [], pending: [], isSvg: false, vnode: { props: {} } }
    return {
      render: function (vnode) {
        flushPassive()
        reconcile(root, normalize(vnode))
        syncDom(root)
        runLayout()
        schedulePassive()
        // collect effects queued by components during initial render
      },
      unmount: function () { for (var i = 0; i < root.children.length; i++) unmount(root.children[i], true); root.children = [] },
    }
  }
  function createPortal(children, container, key) { return { $$: 1, type: PORTAL, props: { children: children, container: container }, key: key == null ? null : '' + key, ref: null } }
  function flushSync(fn) { var r = fn && fn(); flush(); return r }

  var React = {
    createElement: createElement, cloneElement: cloneElement, isValidElement: isValidElement, Fragment: Fragment, Suspense: Suspense, StrictMode: StrictMode,
    Children: Children, createContext: createContext, forwardRef: forwardRef, memo: memo, lazy: lazy, createRef: createRef, Component: Component, PureComponent: Component,
    useState: useState, useReducer: useReducer, useRef: useRef, useMemo: useMemo, useCallback: useCallback, useEffect: useEffect, useLayoutEffect: useLayoutEffect,
    useInsertionEffect: useLayoutEffect, useImperativeHandle: useImperativeHandle, useContext: useContext, useId: useId, useSyncExternalStore: useSyncExternalStore,
    useDeferredValue: useDeferredValue, useTransition: useTransition, startTransition: startTransition, useDebugValue: useDebugValue, version: '18.3.1-mini',
  }
  window.React = React
  window.ReactDOM = { createRoot: createRoot, createPortal: createPortal, flushSync: flushSync, render: function (v, c) { createRoot(c).render(v) }, version: '18.3.1-mini' }
})()
