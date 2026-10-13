import { access, cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const output = resolve(root, 'pages-dist')
const preview = resolve(root, 'design-system-preview.html')
const storybook = resolve(root, 'storybook-static')

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function requirePath(path, description) {
  if (!(await exists(path))) {
    throw new Error(`${description} was not found:\n${path}`)
  }
}

async function build() {
  console.log('Preparing GitHub Pages...')

  await requirePath(preview, 'Design system preview')
  await requirePath(storybook, 'Storybook build')

  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })

  await cp(preview, resolve(output, 'index.html'))
  await cp(preview, resolve(output, 'design-system-preview.html'))
  await cp(storybook, resolve(output, 'storybook'), { recursive: true })
  await writeFile(resolve(output, '.nojekyll'), '')

  console.log('GitHub Pages build complete.')
  console.log('Output: pages-dist/')
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
