#!/usr/bin/env node

// Compile-check components with esbuild (no React install needed):
// TSX syntax, imports, CSS Modules, stories.
//
// Usage:
// node scripts/check-components.mjs Button Input
// or no args for all components.

import {
  readdirSync,
  existsSync,
  readFileSync,
} from 'node:fs'

import {
  join,
  resolve,
} from 'node:path'

import * as esbuild from 'esbuild'

const root = resolve('.')

const names = process.argv
  .slice(2)
  .filter((argument) => !argument.startsWith('--'))

const componentsDirectory = join(
  root,
  'src/components',
)

const all = readdirSync(componentsDirectory)
  .filter((directoryName) =>
    existsSync(
      join(
        componentsDirectory,
        directoryName,
        'index.ts',
      ),
    ),
  )
  .sort()

const targets = names.length
  ? names
  : all

let failed = 0

for (const componentName of targets) {
  const componentDirectory = join(
    componentsDirectory,
    componentName,
  )

  if (!existsSync(componentDirectory)) {
    console.error(
      `✘ ${componentName}: folder missing`,
    )

    failed++
    continue
  }

  const componentFiles = readdirSync(
    componentDirectory,
  )

  const entries = [
    join(
      componentDirectory,
      'index.ts',
    ),
  ]

  for (const fileName of componentFiles) {
    if (/\.stories\.tsx$/.test(fileName)) {
      entries.push(
        join(
          componentDirectory,
          fileName,
        ),
      )
    }
  }

  try {
    await esbuild.build({
      entryPoints: entries,

      bundle: true,
      write: false,

      outdir: '/tmp/ds-check',

      format: 'esm',
      jsx: 'automatic',
      logLevel: 'silent',

      loader: {
        '.module.css': 'local-css',
        '.css': 'css',
      },

      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@storybook/react',
        '@figma/code-connect',
      ],
    })

    // Syntax-only check of test and Figma files.

    for (const fileName of componentFiles) {
      if (
        /\.(test|figma)\.tsx$/.test(fileName)
      ) {
        const filePath = join(
          componentDirectory,
          fileName,
        )

        const source = readFileSync(
          filePath,
          'utf8',
        )

        await esbuild.transform(
          source,
          {
            loader: 'tsx',
            jsx: 'automatic',
          },
        )
      }
    }

    console.log(
      `✔ ${componentName}`,
    )
  } catch (error) {
    failed++

    const errors =
      error &&
      typeof error === 'object' &&
      'errors' in error &&
      Array.isArray(error.errors)
        ? error.errors
        : [error]

    const output = errors
      .map((buildError) => {
        if (
          buildError &&
          typeof buildError === 'object' &&
          'text' in buildError
        ) {
          const location =
            'location' in buildError
              ? buildError.location
              : undefined

          const file =
            location?.file ||
            'unknown file'

          const line =
            location?.line ||
            0

          return (
            `${file}:${line} ` +
            `${buildError.text}`
          )
        }

        return String(buildError)
      })
      .join('\n')

    console.error(
      `✘ ${componentName}\n${output}`,
    )
  }
}

if (failed) {
  console.error(
    `\n${failed} component check(s) failed.`,
  )

  process.exit(1)
}

console.log(
  `\nAll ${targets.length} component check(s) passed.`,
)
