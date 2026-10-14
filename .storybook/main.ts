import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',***],

  framework: {
    name: '@s***ybook/react-vite',
    options: ***
  },

  async viteFinal(viteCon***) {
    // Declaration files are***rt of the library build, not Sto***ook.
    // Remove vite-plugin-d***so Storybook does not type-check***e
    // entire component librar***uring the Storybook build.
    v***Config.plugins = viteConfig.plug***?.filter((plugin) => {
      if ***lugin) {
        return false
  *** }

      if (Array.isArray(plug***) {
        return true
      }
***    const pluginName =
        t***of plugin === 'object' &&
      ***name' in plugin
          ? Stri***plugin.name)
          : ''

   ***return (
        !pluginName.inc***es('dts') &&
        !pluginName***cludes('unplugin-dts')
      )
 ***})

    return viteConfig
  },
}***xport default config
