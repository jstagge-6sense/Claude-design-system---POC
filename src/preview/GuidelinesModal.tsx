import { useState, type ReactNode } from 'react'
import { Dialog } from '../components/Dialog'
import { Button } from '../components/Button'
import { GUIDELINES } from './guidelines'
import { GuidelinesContent } from './GuidelinesContent'

/** "View guidelines" button and modal, built from the library's own Button, Dialog and Accordion.
 *  Renders nothing for components without guidelines yet. Nothing is expanded on load. */
import { storybookUrl } from './storybookLinks'
export function GuidelinesButton({ folder, label, renderPreview }: { folder: string; label: string; renderPreview?: (story?: string) => ReactNode }) {
  const [open, setOpen] = useState(false)
  if (!GUIDELINES[folder]) return null
  return (
    <>
      <span className="pv-guide-btn">
        <Button priority="tertiary" size="small" onClick={() => window.open(storybookUrl(folder), '_blank', 'noopener,noreferrer')}>Storybook<span className="pv-sr"> (opens in a new tab)</span></Button>
        <Button priority="primary" size="small" onClick={() => setOpen(true)}>View guidelines</Button>
      </span>
      <Dialog open={open} onOpenChange={setOpen} title={`${label} guidelines`} complexity="information" size="large" cancelLabel="Close" className="pv-guide-dialog">
        <GuidelinesContent folder={folder} renderPreview={renderPreview} />
      </Dialog>
    </>
  )
}
