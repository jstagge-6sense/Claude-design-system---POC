import { createRoot } from 'react-dom/client'
import '../styles/index.css'
import './preview.css'
import { App } from './App'
import { applyAll } from './overrides'
import { Boundary } from './Foundations'

// Never leave a blank page: show what failed, whether it is at startup or while rendering.
const root = document.getElementById('root')!
const show = (msg: string) => { if (!root.childElementCount) root.innerHTML = `<div style="font:14px system-ui;padding:24px;max-width:48rem"><strong>The preview failed to start.</strong><pre style="white-space:pre-wrap">${msg.replace(/[<&]/g, '')}</pre><p>Clear the saved edits with <code>localStorage.clear()</code> in the browser console, then reload.</p></div>` }
window.addEventListener('error', (e) => show(String(e.message || e.error)))
window.addEventListener('unhandledrejection', (e) => show(String(e.reason)))
try { applyAll() } catch (e) { show(String(e)) }
createRoot(root).render(<Boundary name="The preview"><App /></Boundary>)
