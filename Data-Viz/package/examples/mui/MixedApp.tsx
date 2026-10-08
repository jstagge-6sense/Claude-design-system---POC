// Material UI and 6DS on one screen, one theme. SixDsProvider sets data-theme / data-density on <html> and provides the MUI theme.
import { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Button as SixDsButton, Input } from '@6si/components'
import '@6si/components/styles.css'
import { SixDsProvider, type SixDsDensity, type SixDsMode } from '@6si/components/mui'

export function MixedApp() {
  const [mode, setMode] = useState<SixDsMode>('light')
  const [density, setDensity] = useState<SixDsDensity>('default')
  return (
    <SixDsProvider mode={mode} density={density}>
      <div style={{ display: 'grid', gap: 16, padding: 24, maxInlineSize: 480 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <SixDsButton priority="secondary" size="small" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>Mode: {mode}</SixDsButton>
          <SixDsButton priority="secondary" size="small" onClick={() => setDensity(density === 'default' ? 'compact' : density === 'compact' ? 'spacious' : 'default')}>Size: {density}</SixDsButton>
        </div>
        <TextField label="MUI field" size="small" />
        <Input label="6DS field" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="contained">MUI button</Button>
          <SixDsButton>6DS button</SixDsButton>
        </div>
      </div>
    </SixDsProvider>
  )
}
