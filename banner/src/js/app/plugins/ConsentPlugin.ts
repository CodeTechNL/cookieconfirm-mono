import { EventDetailMap } from '@/js/app/helpers'
import CookieStorageService from '@/js/app/services/CookieStorageService'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class ConsentPlugin implements PluginInterface {
  cookieManager: typeof CookieStorageService
  consentStorageUrl: string

  constructor(cookieManager: typeof CookieStorageService, consentStorageUrl: string) {
    this.cookieManager = cookieManager
    this.consentStorageUrl = consentStorageUrl
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
      domain: event.domain,
      path: window.location.pathname,
    }

    console.log(payload);
    console.log('Consent storage url:');
    console.log(this.consentStorageUrl);

    fetch(`${this.consentStorageUrl}/api/v1/store-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ payload: JSON.stringify(payload) }),
    })
  }
}

export default new ConsentPlugin(cookieStorageService, import.meta.env.VITE_CONSENT_STORE_URL)
