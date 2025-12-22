import CookieIconTemplate from '@/js/templates/default/cookie-icon-template'
import LocalStorageService from '@/js/app/services/LocalStorageService'
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class CookieIconPlugin implements PluginInterface {
  private localStorage: typeof LocalStorageService
  private cookieIcon?: CookieIconTemplate
  constructor(localStorage: typeof LocalStorageService) {
    this.localStorage = localStorage
  }

  isDefined(): boolean {
    return true;
  }

  register() {
    window.ccListen('renderCookieIcon', (e) => {
      if(!this.cookieIcon){
        const icon = this.localStorage.getCookieIcon()
        this.cookieIcon = new CookieIconTemplate(icon)
        this.cookieIcon.render()
      }
    })
  }
}

export default new CookieIconPlugin(LocalStorageService);