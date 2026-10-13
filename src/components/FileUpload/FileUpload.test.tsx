import { render, screen, fireEvent } from '@testing-library/react'
import { FileUpload, formatBytes } from './FileUpload'

const file = (name: string, size = 100, type = '') => new File([new Uint8Array(size)], name, { type })
const pick = (c: HTMLElement, files: File[]) => {
  const input = c.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files } })
}

describe('FileUpload', () => {
  it('shows accepted formats and limits upfront', () => {
    render(<FileUpload accept={['.csv', '.xlsx']} maxSize={10_000_000} />)
    expect(screen.getByText(/Accepted formats: CSV or XLSX/)).toBeTruthy()
    expect(screen.getByText(/Up to 10 MB per file/)).toBeTruthy()
  })
  it('has a keyboard reachable browse button and a hidden native input', () => {
    const { container } = render(<FileUpload />)
    expect(screen.getByRole('button', { name: 'Browse file' })).toBeTruthy()
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.tabIndex).toBe(-1)
    expect(input.getAttribute('aria-hidden')).toBe('true')
  })
  it('passes valid files to onFilesSelected', () => {
    const onFilesSelected = vi.fn()
    const { container } = render(<FileUpload accept={['.csv']} multiple onFilesSelected={onFilesSelected} />)
    const f = file('a.csv')
    pick(container, [f])
    expect(onFilesSelected).toHaveBeenCalledWith([f])
  })
  it('rejects the wrong format with a specific message', () => {
    const onFilesSelected = vi.fn()
    const onFilesRejected = vi.fn()
    const { container } = render(<FileUpload accept={['.csv', '.xlsx']} onFilesSelected={onFilesSelected} onFilesRejected={onFilesRejected} />)
    pick(container, [file('notes.pdf')])
    expect(onFilesSelected).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain("notes.pdf isn't a supported format. Use CSV or XLSX.")
    expect(onFilesRejected.mock.calls[0][0][0].reason).toBe('type')
  })
  it('rejects files over the size limit', () => {
    const { container } = render(<FileUpload accept={['.csv']} maxSize={50} />)
    pick(container, [file('big.csv', 200)])
    expect(screen.getByRole('alert').textContent).toContain('big.csv is 200 B. The limit is 50 B per file.')
  })
  it('limits the number of files', () => {
    const onFilesSelected = vi.fn()
    const { container } = render(<FileUpload multiple maxFiles={1} onFilesSelected={onFilesSelected} />)
    pick(container, [file('a.csv'), file('b.csv')])
    expect(onFilesSelected.mock.calls[0][0].length).toBe(1)
    expect(screen.getByRole('alert').textContent).toContain("b.csv wasn't added")
  })
  it('accepts dropped files and shows the drag-over message', () => {
    const onFilesSelected = vi.fn()
    const { container } = render(<FileUpload onFilesSelected={onFilesSelected} />)
    const zone = container.querySelector('[data-drag-over], div[class*="zone"]') as HTMLElement
    fireEvent.dragEnter(zone)
    expect(screen.getByText('Drop to add your files')).toBeTruthy()
    const f = file('a.csv')
    fireEvent.drop(zone, { dataTransfer: { files: [f] } })
    expect(onFilesSelected).toHaveBeenCalledWith([f])
  })
  it('renders per-file status: progress, success and error with retry and remove', () => {
    const onRetry = vi.fn()
    const onRemove = vi.fn()
    render(
      <FileUpload
        multiple
        onRetry={onRetry}
        onRemove={onRemove}
        files={[
          { id: '1', name: 'a.csv', status: 'uploading', progress: 40 },
          { id: '2', name: 'b.csv', status: 'success' },
          { id: '3', name: 'c.csv', status: 'error', errorMessage: 'Upload failed. Retry.' },
        ]}
      />,
    )
    expect(screen.getByRole('progressbar', { name: 'Uploading a.csv' }).getAttribute('aria-valuenow')).toBe('40')
    expect(screen.getByText('Uploaded')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry upload of c.csv' }))
    expect(onRetry).toHaveBeenCalledWith('3')
    fireEvent.click(screen.getByRole('button', { name: 'Cancel upload of a.csv' }))
    expect(onRemove).toHaveBeenCalledWith('1')
  })
  it('does nothing when disabled', () => {
    const onFilesSelected = vi.fn()
    const { container } = render(<FileUpload disabled onFilesSelected={onFilesSelected} />)
    pick(container, [file('a.csv')])
    expect(onFilesSelected).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Browse file' }).getAttribute('aria-disabled')).toBe('true')
  })
  it('formats byte sizes', () => {
    expect(formatBytes(2_450_000, 'en-US')).toBe('2.5 MB')
  })
})
