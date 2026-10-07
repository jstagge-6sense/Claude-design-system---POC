import { createRoot } from 'react-dom/client'
import '../styles/index.css'
import './preview.css'
import { App } from './App'
import { applyAll } from './overrides'

applyAll()
createRoot(document.getElementById('root')!).render(<App />)
