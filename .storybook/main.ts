import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.tsx'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  async viteFinal(viteConfig) {
    viteConfig.plugins = viteConfig.plugins?.filter((plugin) => {
      if (!plugin) {
        return false
      }

      if (Array.isArray(plugin)) {
        return true
      }

      const pluginName =
        typeof plugin === 'object' && 'name' in plugin
          ? String(plugin.name)
          : ''

      return (
        !pluginName.includes('dts') &&
        !pluginName.includes('unplugin-dts')
      )
    })

    return viteConfig
  },
}

export default config
