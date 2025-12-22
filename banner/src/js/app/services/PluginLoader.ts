import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class PluginLoader {
  plugins: PluginInterface[]
  constructor(plugins: PluginInterface[] = []) {
    this.plugins = plugins
  }

  register() {
    this.plugins.forEach((plugin) => {
      plugin.register()
    })

    window.ccPlugins.forEach((plugin) => {
      plugin.register()
    })
  }
}

export default PluginLoader
