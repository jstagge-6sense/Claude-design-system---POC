import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/primitives/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: [],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  async viteFinal(viteConfig) {
    // Storybook does not need the library declaration-file generator.
    // Leaving vite-plugin-dts enabled causes it to type-check the entire
    // library, including files that Storybook is not rendering.
    viteConfig.plugins = (viteConfig.plugins ?? []).filter((plugin) => {
      if (!plugin || typeof plugin !== 'object' || !('name' in plugin)) {
        return true
      }

      return !String(plugin.name).includes('dts')
    })

    return viteConfig
  },
}

export default config
