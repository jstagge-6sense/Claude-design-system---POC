import { forwardRef, useCallback, useId, useRef, useState, type ChangeEvent, type DragEvent, type HTMLAttributes } from 'react'
import { cx } from '../../primitives/cx'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { Icon } from '../../icons'
import { Button } from '../Button'
import { ProgressBar } from '../ProgressBar'
import styles from './FileUpload.module.css'

export type FileUploadStatus = 'queued' | 'uploading' | 'success' | 'error'

/** One row in the file list. The component does not upload: you own status and progress. */
export interface FileUploadItem {
  id: string
  name: string
  /** Size in bytes. */
  size?: number
  status: FileUploadStatus
  /** 0 to 100, for status "uploading". */
  progress?: number
  /** What went wrong and what to do, for status "error". */
  errorMessage?: string
}

export type FileRejectionReason = 'type' | 'size' | 'count'
export interface FileRejection { file: File; reason: FileRejectionReason; message: string }

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop' | 'children'> {
  /** Accessible name of the whole control. */
  label?: string
  /** dropzone: large drag-and-drop area with a browse button. button: browse button only. */
  variant?: 'dropzone' | 'button'
  /** Allow more than one file. */
  multiple?: boolean
  /** Accepted formats: extensions (".csv"), MIME types ("image/png") or wildcards ("image/*"). Restricts the picker and validates drops. */
  accept?: string[]
  /** Human-readable formats for the hint, such as "CSV or XLSX". Derived from `accept` when omitted. */
  acceptLabel?: string
  /** Maximum size per file in bytes. */
  maxSize?: number
  /** Maximum number of files in the list (multiple only). */
  maxFiles?: number
  /** Files to show, with their upload status and progress. */
  files?: FileUploadItem[]
  /** Called with the files that passed validation. Start uploading here. */
  onFilesSelected?: (files: File[]) => void
  /** Called with files that failed validation, each with a specific reason. */
  onFilesRejected?: (rejections: FileRejection[]) => void
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  disabled?: boolean
  /** Text for the browse button. */
  browseLabel?: string
  /** Extra guidance under the formats and limits. */
  helperText?: string
  /** Force a visual state for docs and previews. Do not use in product code. */
  'data-state'?: 'dragOver'
}

const UNITS = ['B', 'KB', 'MB', 'GB']
export function formatBytes(bytes: number, locale?: string): string {
  let n = bytes
  let u = 0
  while (n >= 1000 && u < UNITS.length - 1) { n /= 1000; u++ }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: n < 10 && u > 0 ? 1 : 0 }).format(n)} ${UNITS[u]}`
}

function listFormats(accept: string[]): string {
  const names = accept.map((a) => {
    if (a.startsWith('.')) return a.slice(1).toUpperCase()
    if (a.endsWith('/*')) { const t = a.slice(0, -2); return t === 'image' ? 'images' : t === 'video' ? 'videos' : t === 'audio' ? 'audio files' : t }
    return (a.split('/')[1] ?? a).toUpperCase()
  })
  if (names.length <= 1) return names[0] ?? ''
  const head = names.slice(0, -1).join(', ')
  return `${head} or ${names[names.length - 1]}`
}

function matchesAccept(file: File, accept: string[]): boolean {
  if (!accept.length) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return accept.some((a) => {
    const rule = a.toLowerCase()
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    label = 'Upload files', variant = 'dropzone', multiple = false, accept = [], acceptLabel, maxSize, maxFiles, files = [],
    onFilesSelected, onFilesRejected, onRemove, onRetry, disabled = false, browseLabel, helperText, className, 'data-state': forced, ...rest
  },
  ref,
) {
  const uid = useId()
  const hintId = `${uid}-hint`
  const errorId = `${uid}-errors`
  const inputRef = useRef<HTMLInputElement>(null)
  const depth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [problems, setProblems] = useState<string[]>([])
  const [announce, setAnnounce] = useState('')

  const formats = acceptLabel ?? listFormats(accept)
  const hint = [
    formats ? `Accepted formats: ${formats}.` : null,
    maxSize != null ? `Up to ${formatBytes(maxSize)} per file${multiple && maxFiles != null ? `, ${maxFiles} files at most` : ''}.` : multiple && maxFiles != null ? `${maxFiles} files at most.` : null,
  ].filter(Boolean).join(' ')

  const handleFiles = useCallback((incoming: File[]) => {
    if (disabled || !incoming.length) return
    const rejections: FileRejection[] = []
    const accepted: File[] = []
    const room = multiple ? (maxFiles != null ? Math.max(0, maxFiles - files.length) : Infinity) : 1
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        rejections.push({ file, reason: 'type', message: `${file.name} isn't a supported format. Use ${formats || 'an accepted format'}.` })
      } else if (maxSize != null && file.size > maxSize) {
        rejections.push({ file, reason: 'size', message: `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(maxSize)} per file.` })
      } else if (accepted.length >= room) {
        rejections.push({
          file, reason: 'count',
          message: multiple ? `${file.name} wasn't added. You can upload ${maxFiles} files at most. Remove a file to add another.` : `${file.name} wasn't added. Upload one file at a time.`,
        })
      } else accepted.push(file)
    }
    setProblems(rejections.map((r) => r.message))
    setAnnounce(accepted.length ? `${accepted.length} ${accepted.length === 1 ? 'file' : 'files'} added.` : '')
    if (rejections.length) onFilesRejected?.(rejections)
    if (accepted.length) onFilesSelected?.(accepted)
  }, [accept, disabled, files.length, formats, maxFiles, maxSize, multiple, onFilesRejected, onFilesSelected])

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }
  const browse = () => { if (!disabled) inputRef.current?.click() }

  const dragProps = variant === 'dropzone' && !disabled ? {
    onDragEnter: (e: DragEvent) => { e.preventDefault(); depth.current += 1; setDragging(true) },
    onDragOver: (e: DragEvent) => { e.preventDefault() },
    onDragLeave: () => { depth.current = Math.max(0, depth.current - 1); if (depth.current === 0) setDragging(false) },
    onDrop: (e: DragEvent) => { e.preventDefault(); depth.current = 0; setDragging(false); handleFiles(Array.from(e.dataTransfer.files)) },
  } : {}
  const over = (dragging || forced === 'dragOver') && !disabled

  const describedBy = [hintId, problems.length ? errorId : null].filter(Boolean).join(' ')
  const browseButton = (
    <Button priority={variant === 'dropzone' ? 'secondary' : 'primary'} icon={<Icon name="upload" />} disabled={disabled} onClick={browse} aria-describedby={describedBy}>
      {browseLabel ?? (multiple ? 'Browse files' : 'Browse file')}
    </Button>
  )

  return (
    <div ref={ref} role="group" aria-label={label} className={cx(styles.root, className)} data-variant={variant} data-disabled={disabled || undefined} {...rest}>
      <input ref={inputRef} type="file" className={styles.input} tabIndex={-1} aria-hidden="true" multiple={multiple} accept={accept.join(',') || undefined} disabled={disabled} onChange={onInput} />
      {variant === 'dropzone' ? (
        <div className={styles.zone} data-drag-over={over || undefined} data-disabled={disabled || undefined} {...dragProps}>
          <span className={styles.zoneIcon} aria-hidden="true"><Icon name="upload" /></span>
          <p className={styles.title}>{over ? 'Drop to add your files' : multiple ? 'Drag and drop files here' : 'Drag and drop a file here'}</p>
          {over ? null : <span className={styles.or}>or</span>}
          {browseButton}
          <p id={hintId} className={styles.hint}>{hint}{helperText ? ` ${helperText}` : ''}</p>
        </div>
      ) : (
        <div className={styles.buttonRow}>
          {browseButton}
          <p id={hintId} className={styles.hint}>{hint}{helperText ? ` ${helperText}` : ''}</p>
        </div>
      )}

      {problems.length ? (
        <div id={errorId} role="alert" className={styles.errors}>
          <ul className={styles.errorList}>
            {problems.map((p, i) => (
              <li key={i} className={styles.error}>
                <span className={styles.errorIcon} aria-hidden="true"><Icon name="error" /></span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <VisuallyHidden role="status" aria-live="polite">{announce}</VisuallyHidden>

      {files.length ? (
        <ul className={styles.list} aria-label="Selected files">
          {files.map((f) => {
            const pct = Math.round(Math.min(100, Math.max(0, f.progress ?? 0)))
            const bucket = Math.floor(pct / 25) * 25
            return (
              <li key={f.id} className={styles.item} data-status={f.status}>
                <span className={styles.fileIcon} aria-hidden="true"><Icon name="file" /></span>
                <div className={styles.info}>
                  <span className={styles.name} title={f.name}>{f.name}</span>
                  {f.size != null ? <span className={styles.meta}>{formatBytes(f.size)}</span> : null}
                  {f.status === 'uploading' ? (
                    <ProgressBar label={`Uploading ${f.name}`} value={pct} showValue statusText={`Uploading, ${bucket}%`} />
                  ) : null}
                  {f.status === 'queued' ? <span className={styles.meta}>Waiting to upload</span> : null}
                  {f.status === 'success' ? (
                    <span className={cx(styles.status, styles.success)} role="status"><span className={styles.statusIcon} aria-hidden="true"><Icon name="success" /></span>Uploaded</span>
                  ) : null}
                  {f.status === 'error' ? (
                    <span className={cx(styles.status, styles.failed)} role="status"><span className={styles.statusIcon} aria-hidden="true"><Icon name="error" /></span>{f.errorMessage ?? "Upload failed. Try again."}</span>
                  ) : null}
                </div>
                <div className={styles.itemActions}>
                  {f.status === 'error' && onRetry ? (
                    <Button priority="tertiary" size="small" icon={<Icon name="refresh" />} aria-label={`Retry upload of ${f.name}`} onClick={() => onRetry(f.id)}>Retry</Button>
                  ) : null}
                  {onRemove ? (
                    <Button
                      priority="tertiary" size="small" iconOnly icon={<Icon name="close" />}
                      aria-label={f.status === 'uploading' ? `Cancel upload of ${f.name}` : `Remove ${f.name}`}
                      onClick={() => onRemove(f.id)}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
})
