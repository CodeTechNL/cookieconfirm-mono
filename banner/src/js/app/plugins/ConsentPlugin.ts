import { EventDetailMap } from '@/js/app/helpers'
import CookieStorageService from '@/js/app/services/CookieStorageService'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class ConsentPlugin implements PluginInterface {
  cookieManager: typeof CookieStorageService
  constructor(cookieManager: typeof CookieStorageService) {
    this.cookieManager = cookieManager
  }
  isDefined(): boolean {
    return true
  }

  register() {
    window.ccListen('consentGiven', (e) => {
      console.log(e)
      this.storeConsent(e)
      window.ccDispatch('enableConsent', e.consent)
    })
  }

  storeConsent(event: EventDetailMap['consentGiven']) {
    this.cookieManager.setAcceptedCookies(event.consent)
    const payload = {
      id: event.consentId,
      consentMethod: event.method,
      analytics: event.consent.includes('analytics'),
      marketing: event.consent.includes('marketing'),
      functional: true,
      country: event.country,
      domain: window.ccDomain,
      path: window.location.pathname,
    }

    fetch(`${import.meta.env.VITE_APP_URL}/api/v1/store-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ payload: JSON.stringify(payload) }),
    })
  }
}

export default new ConsentPlugin(cookieStorageService)
