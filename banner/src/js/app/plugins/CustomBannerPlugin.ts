import { PluginInterface } from '@/js/app/interfaces/PluginInterface'
import AbstractCustomBannerElement from '@/js/app/plugins/AbstractCustomBannerElement'

class CustomBannerPlugin extends AbstractCustomBannerElement implements PluginInterface {
  isDefined(): boolean {
    return true
  }

  register() {
    const template = window.ccCustomHtml

    if (template) {
      window.ccListen('openBanner', (e) => {
        this.renderElement(template)

        window.ccDispatch('bannerRendered')
      })

      return
    }

    console.error('Custom banner not found!')
  }

  isIdSelector(v: string): boolean {
    return v[0] === '#'
  }
}

export default new CustomBannerPlugin()
