import { useEffect, useRef, useState } from 'react'
import { Tabs, TabList, Tab } from '../components/Tabs'

type Target = { el: HTMLElement; label: string; count?: number }
const SELECTOR = '.pv-stage .pv-section > h2, .pv-stage .pv-story > header > strong, .pv-stage [data-nav]'

/** Pinned, full-width section tabs for the page in view. Built from the page's own headings, so every page gets one.
 *  The Tabs scroll buttons show only when the tabs overflow, and the Tabs component re-measures when the window is resized. */
export function SectionTabs({ resetKey }: { resetKey: string }) {
  const [targets, setTargets] = useState<Target[]>([])
  const [active, setActive] = useState('0')
  const targetsRef = useRef<Target[]>([])

  useEffect(() => {
    const main = document.getElementById('main')
    if (!main) return
    let raf = 0
    const scan = () => {
      raf = 0
      const found: Target[] = []
      main.querySelectorAll<HTMLElement>(SELECTOR).forEach((n) => {
        if (n.closest('[data-nav-skip]') && !n.hasAttribute('data-nav')) return
        const host = n.closest<HTMLElement>('[data-nav]') ?? n
        const label = host.getAttribute('data-nav') ?? (n.textContent || '').replace(/\s*\(\d+\)\s*$/, '').trim()
        if (!label || found.some((f) => f.el === host)) return
        const c = host.getAttribute('data-count')
        found.push({ el: host, label, count: c != null ? Number(c) : undefined })
      })
      const same = found.length === targetsRef.current.length && found.every((f, i) => f.el === targetsRef.current[i].el && f.label === targetsRef.current[i].label)
      if (!same) { targetsRef.current = found; setTargets(found) }
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(scan) }
    scan()
    const mo = new MutationObserver(queue)
    mo.observe(main, { childList: true, subtree: true })
    return () => { mo.disconnect(); if (raf) cancelAnimationFrame(raf) }
  }, [resetKey])

  useEffect(() => { setActive('0') }, [resetKey])

  useEffect(() => {
    const main = document.getElementById('main')
    if (!main) return
    const onScroll = () => {
      const top = main.getBoundingClientRect().top + 90
      let idx = 0
      targetsRef.current.forEach((t, i) => { if (t.el.getBoundingClientRect().top <= top) idx = i })
      setActive(String(idx))
    }
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  if (targets.length < 2) return null
  const go = (v: string) => {
    setActive(v)
    const t = targets[Number(v)]
    if (t) { t.el.style.scrollMarginBlockStart = '64px'; t.el.scrollIntoView({ block: 'start', behavior: 'smooth' }) }
  }
  return (
    <div className="pv-pinbar">
      <Tabs value={active} onValueChange={go} scrollable>
        <TabList aria-label="Sections on this page">
          {targets.map((t, i) => <Tab key={`${i}-${t.label}`} value={String(i)} badge={t.count}>{t.label}</Tab>)}
        </TabList>
      </Tabs>
    </div>
  )
}
