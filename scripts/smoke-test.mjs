#!/usr/bin/env node

// Render smoke test:
// Runs every story's render function through a minimal fake React.
// See scripts/lib/fake-react.cjs.
//
// Catches:
// - ReferenceErrors
// - Missing exports
// - Bad prop access
// - Invalid children
//
// This does not replace a browser test.
//
// Usage:
// node scripts/smoke-test.mjs [Name ...]

import {
  readdirSync,
  writeFileSync,
  statSync,
  mkdirSync,
} from 'node:fs'

import {
  join,
  resolve,
} from 'node:path'

import {
  createRequire,
} from 'node:module'

import * as esbuild from 'esbuild'

const root = resolve('.')

const only = process.argv
  .slice(2)
  .filter((argument) => {
    return !argument.startsWith('--')
  })

const componentsDirectory = join(
  root,
  'src/components',
)

const names = readdirSync(
  componentsDirectory,
)
  .filter((directoryName) => {
    const componentDirectory = join(
      componentsDirectory,
      directoryName,
    )

    return (
      !directoryName.startsWith('.') &&
      statSync(componentDirectory).isDirectory() &&
      (
        only.length === 0 ||
        only.includes(directoryName)
      )
    )
  })
  .sort()

const stories = names.flatMap(
  (directoryName) => {
    const componentDirectory = join(
      componentsDirectory,
      directoryName,
    )

    return readdirSync(componentDirectory)
      .filter((fileName) => {
        return fileName.endsWith(
          '.stories.tsx',
        )
      })
      .map((fileName) => ({
        directoryName,
        fileName,
      }))
  },
)

const temporaryDirectory =
  '/tmp/ds-smoke'

mkdirSync(
  temporaryDirectory,
  {
    recursive: true,
  },
)

const entryFile = join(
  temporaryDirectory,
  'entry.ts',
)

const storyImports = stories
  .map((story, index) => {
    const storyPath = join(
      componentsDirectory,
      story.directoryName,
      story.fileName.replace(
        /\.tsx$/,
        '',
      ),
    )

    return (
      `import * as s${index} ` +
      `from ${JSON.stringify(storyPath)}`
    )
  })
  .join('\n')

const fakeReactFile = join(
  root,
  'scripts/lib/fake-react.cjs',
)

const storyCollection = stories
  .map((story, index) => {
    return (
      `[${JSON.stringify(story.directoryName)}, ` +
      `s${index}]`
    )
  })
  .join(',')

const entryContents = [
  storyImports,

  `export { expand, stats } from ${JSON.stringify(
    fakeReactFile,
  )}`,

  `export const ALL = [${storyCollection}]`,
  '',
].join('\n')

writeFileSync(
  entryFile,
  entryContents,
)

const fakeReactPlugin = {
  name: 'fake-react',

  setup(build) {
    build.onResolve(
      {
        filter: /^react(-dom)?(\/.*)?$/,
      },
      (args) => ({
        path: args.path,
        namespace: 'fake-react',
      }),
    )

    build.onLoad(
      {
        filter: /.*/,
        namespace: 'fake-react',
      },
      (args) => {
        if (args.path === 'react') {
          return {
            loader: 'js',
            resolveDir: root,

            contents:
              `module.exports = ` +
              `require(${JSON.stringify(
                fakeReactFile,
              )}).React`,
          }
        }

        if (
          args.path === 'react/jsx-runtime' ||
          args.path ===
            'react/jsx-dev-runtime'
        ) {
          return {
            loader: 'js',
            resolveDir: root,

            contents: `
              const fakeReact = require(
                ${JSON.stringify(fakeReactFile)}
              )

              export const jsx =
                fakeReact.jsx

              export const jsxs =
                fakeReact.jsx

              export const jsxDEV =
                fakeReact.jsx

              export const Fragment =
                fakeReact.React.Fragment
            `,
          }
        }

        return {
          loader: 'js',
          resolveDir: root,

          contents: `
            const fakeReact = require(
              ${JSON.stringify(fakeReactFile)}
            )

            module.exports = {
              createPortal:
                fakeReact.createPortal,

              createRoot: () => ({
                render() {},
              }),

              flushSync: (callback) =>
                callback(),
            }
          `,
        }
      },
    )

    build.onResolve(
      {
        filter: /^@(storybook|figma)\//,
      },
      (args) => ({
        path: args.path,
        namespace: 'empty-module',
      }),
    )

    build.onLoad(
      {
        filter: /.*/,
        namespace: 'empty-module',
      },
      () => ({
        contents:
          'module.exports = {}',
        loader: 'js',
      }),
    )
  },
}

const outputFile = join(
  temporaryDirectory,
  'bundle.cjs',
)

await esbuild.build({
  entryPoints: [
    entryFile,
  ],

  bundle: true,

  outfile: outputFile,

  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',

  loader: {
    '.module.css': 'local-css',
    '.css': 'css',
  },

  plugins: [
    fakeReactPlugin,
  ],

  logLevel: 'error',

  define: {
    'process.env.NODE_ENV':
      '"development"',
  },
})

// Minimal browser globals prevent module-level or
// render-time checks from crashing.

const noop = () => {}

const noBrowser =
  process.env.NO_BROWSER === '1' ||
  process.argv.includes('--no-browser')

if (!noBrowser) {
  globalThis.window =
    globalThis

  globalThis.document = {
    body: {
      style: {},
      appendChild: noop,
    },

    documentElement: {
      style: {},
      dir: 'ltr',
    },

    addEventListener: noop,
    removeEventListener: noop,

    activeElement: null,

    createElement: () => ({
      style: {},
      setAttribute: noop,
    }),

    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  }

  globalThis.matchMedia = () => ({
    matches: false,
    addEventListener: noop,
    removeEventListener: noop,
  })

  globalThis.localStorage = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
  }

  globalThis.IntersectionObserver =
    class {
      observe() {}

      disconnect() {}

      unobserve() {}
    }

  globalThis.ResizeObserver =
    class {
      observe() {}

      disconnect() {}

      unobserve() {}
    }

  globalThis.requestAnimationFrame =
    () => 0
}

const require =
  createRequire(import.meta.url)

const {
  ALL,
  expand,
  stats,
} = require(outputFile)

let failed = 0
let passed = 0

for (
  const [
    folder,
    storyModule,
  ] of ALL
) {
  const meta =
    storyModule.default || {}

  for (
    const [
      exportName,
      storyExport,
    ] of Object.entries(storyModule)
  ) {
    if (
      exportName === 'default' ||
      exportName.startsWith('__') ||
      !storyExport
    ) {
      continue
    }

    const story =
      typeof storyExport === 'function'
        ? {
            render: storyExport,
          }
        : storyExport

    try {
      const args = {
        ...(meta.args || {}),
        ...(story.args || {}),
      }

      const render =
        story.render ||
        meta.render

      const elementCountBefore =
        stats.elements

      const renderedOutput = render
        ? render(args, {})
        : {
            $$: 1,
            type: meta.component,
            props: args,
          }

      expand(renderedOutput)

      if (
        stats.elements ===
        elementCountBefore
      ) {
        throw new Error(
          'story rendered nothing',
        )
      }

      passed++
    } catch (error) {
      failed++

      const message =
        error instanceof Error
          ? error.message
          : String(error)

      const stack =
        error instanceof Error
          ? String(error.stack)
              .split('\n')
              .slice(1, 3)
              .join('\n    ')
          : ''

      console.error(
        `✘ ${folder}/${exportName}: ` +
          `${message}` +
          (
            stack
              ? `\n    ${stack}`
              : ''
          ),
      )
    }
  }
}

console.log(
  `Smoke test: ${passed} stories rendered, ` +
    `${failed} failed ` +
    `(${stats.elements} elements)`,
)

process.exit(
  failed > 0
    ? 1
    : 0,
)
