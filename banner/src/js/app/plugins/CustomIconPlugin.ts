import { PluginInterface } from '@/js/app/interfaces/PluginInterface'
import AbstractCustomBannerElement from '@/js/app/plugins/AbstractCustomBannerElement'

class CustomIconPlugin extends AbstractCustomBannerElement implements PluginInterface {
  register() {
    const element = window.ccCustomCookieIcon;

    if (element) {
      window.ccListen('renderCookieIcon', () => {
        this.renderElement(element)
      })

      return
    }

    console.error('Custom cookie icon is not defined')
  }
}

export default new CustomIconPlugin()
