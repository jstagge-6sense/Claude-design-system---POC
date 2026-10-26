import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import styles from './CodeSnippet.module.css'

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The exact plain text shown and copied. No syntax colors are applied. */
  code: string
  /** block: multi-line block with a header. inline: single-line snippet that sits in or beside text. */
  variant?: 'block' | 'inline'
  /** Language name shown in the header, for example "JavaScript" or "Shell". Block only. */
  language?: string
  /** Show line numbers. Defaults to true for blocks with more than one line. Block only. */
  lineNumbers?: boolean
  /** Accessible name of the copy button. */
  copyLabel?: string
  /** Text announced politely after copying. */
  copiedLabel?: string
  /** Text announced if the browser blocks copying. */
  copyFailedLabel?: string
  /** Accessible name of the scrollable code region. Defaults to the language plus "code". */
  regionLabel?: string
  /** How long the copied state lasts, in milliseconds. */
  copiedDuration?: number
  /** Called after the text was copied. */
  onCopy?: (code: string) => void
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'hover' | 'pressed' | 'focus' | 'copied'
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.insetBlockStart = '0'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

export const CodeSnippet = forwardRef<HTMLDivElement, CodeSnippetProps>(function CodeSnippet(
  {
    code, variant = 'block', language, lineNumbers, copyLabel = 'Copy code', copiedLabel = 'Copied', copyFailedLabel = "Couldn't copy. Select the code and copy it manually.",
    regionLabel, copiedDuration = 2000, onCopy, className, 'data-state': forced, ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const copy = useCallback(async () => {
    const ok = await writeClipboard(code)
    if (timer.current) clearTimeout(timer.current)
    setCopied(ok)
    setFailed(!ok)
    if (ok) onCopy?.(code)
    timer.current = setTimeout(() => { setCopied(false); setFailed(false) }, copiedDuration)
  }, [code, copiedDuration, onCopy])

  const showCopied = copied || forced === 'copied'
  const copyButton = (
    <button type="button" className={styles.copy} aria-label={copyLabel} data-copied={showCopied || undefined} onClick={copy}>
      <span className={styles.copyIcon} aria-hidden="true"><Icon name={showCopied ? 'check' : 'copy'} /></span>
    </button>
  )
  const live = <VisuallyHidden role="status" aria-live="polite">{copied ? copiedLabel : failed ? copyFailedLabel : ''}</VisuallyHidden>
  const rootState = forced === 'copied' ? undefined : forced

  if (variant === 'inline') {
    return (
      <div ref={ref} className={cx(styles.root, className)} data-variant="inline" data-state={rootState} {...rest}>
        <code className={styles.inlineCode}>{code}</code>
        {copyButton}
        {live}
      </div>
    )
  }

  const lines = code.split('\n')
  const numbered = lineNumbers ?? lines.length > 1
  const digits = String(lines.length).length
  return (
    <div ref={ref} className={cx(styles.root, className)} data-variant="block" data-state={rootState} {...rest}>
      <div className={styles.header}>
        <span className={styles.language}>{language}</span>
        {copyButton}
        {live}
      </div>
      <div className={styles.scroll} role="region" aria-label={regionLabel ?? `${language ? `${language} ` : ''}code`} tabIndex={0}>
        <pre className={styles.pre} dir="ltr" data-numbered={numbered || undefined} style={{ ['--_digits' as string]: digits }}>
          <code>
            {lines.map((line, i) => (
              <span key={i} className={styles.line} data-line={numbered ? i + 1 : undefined}>{line + (i < lines.length - 1 ? '\n' : '')}</span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
})
