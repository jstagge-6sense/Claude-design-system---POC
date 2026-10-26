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

  // The preview HTML is a checked-in/static artifact. We do not rebuild the
  // deleted src/preview app as part of Pages. Storybook builds independently.
  await requirePath(preview, 'Design system preview')
  await requirePath(storybook, 'Storybook build')

  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })

  // Preserve the existing preview at the site root.
  await cp(preview, resolve(output, 'index.html'))
  await cp(preview, resolve(output, 'design-system-preview.html'))

  // Publish Storybook as a separate view at /storybook/.
  await cp(storybook, resolve(output, 'storybook'), { recursive: true })

  await writeFile(resolve(output, '.nojekyll'), '')

  console.log('GitHub Pages build complete.')
  console.log('Preview: pages-dist/index.html')
  console.log('Storybook: pages-dist/storybook/index.html')
}

build().catch((error) => {
  console.error(error)
  process.exit(1)
})
