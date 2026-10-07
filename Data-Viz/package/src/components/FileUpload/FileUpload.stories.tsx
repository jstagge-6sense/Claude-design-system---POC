import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload, type FileUploadItem } from './FileUpload'

const meta = {
  title: 'Data entry/File upload',
  component: FileUpload,
  parameters: { tier: 2, group: 'Data entry', description: 'Chooses files with a browse button or drag and drop. Shows limits upfront and reports status per file.' },
  args: { accept: ['.csv', '.xlsx'], maxSize: 10_000_000 },
  decorators: [(Story) => <div style={{ maxInlineSize: '36rem' }}><Story /></div>],
} satisfies Meta<typeof FileUpload>
export default meta
type Story = StoryObj<typeof meta>

const FILES: FileUploadItem[] = [
  { id: '1', name: 'accounts-q3.csv', size: 2_450_000, status: 'uploading', progress: 62 },
  { id: '2', name: 'contacts-emea.xlsx', size: 810_000, status: 'success' },
  { id: '3', name: 'pipeline-2026.csv', size: 9_800_000, status: 'error', errorMessage: 'The upload was interrupted. Retry or remove the file.' },
  { id: '4', name: 'renewals.csv', size: 120_000, status: 'queued' },
]

export const Dropzone: Story = {}
export const ButtonOnly: Story = { name: 'Browse button', args: { variant: 'button' } }
export const DragOver: Story = { name: 'Drag over', args: { 'data-state': 'dragOver' } }
export const Disabled: Story = { args: { disabled: true } }
export const SingleFile: Story = {
  name: 'Single file',
  args: { files: [{ id: 'a', name: 'accounts-q3.csv', size: 2_450_000, status: 'uploading', progress: 35 }] },
}
export const MultiFile: Story = {
  name: 'Multiple files with status',
  args: { multiple: true, maxFiles: 5, files: FILES, onRemove: () => undefined, onRetry: () => undefined },
}
export const StateMatrix: Story = {
  name: 'States (forced)',
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <FileUpload {...args} label="Default" />
      <FileUpload {...args} label="Drag over" data-state="dragOver" />
      <FileUpload {...args} label="Disabled" disabled />
      <FileUpload {...args} variant="button" label="Button only" multiple files={FILES} onRemove={() => undefined} onRetry={() => undefined} />
    </div>
  ),
}

function Interactive() {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  return (
    <FileUpload
      accept={['.csv', '.xlsx']}
      maxSize={10_000_000}
      maxFiles={3}
      multiple
      files={files}
      onFilesSelected={(picked) => setFiles((cur) => [...cur, ...picked.map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, size: f.size, status: 'success' as const }))])}
      onRemove={(id) => setFiles((cur) => cur.filter((f) => f.id !== id))}
    />
  )
}
export const TryIt: Story = { name: 'Validation (try it)', render: () => <Interactive /> }
