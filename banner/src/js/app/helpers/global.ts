import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

export const registerPlugins = (plugins: PluginInterface[]) => {
  plugins.forEach((plugin: PluginInterface) => {
    plugin.register()
  })
}
