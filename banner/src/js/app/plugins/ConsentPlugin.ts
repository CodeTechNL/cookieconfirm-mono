import { CONSENT_STORAGE_URL, EventDetailMap } from '@/js/app/helpers'
import CookieStorageService from '@/js/app/services/CookieStorageService'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class ConsentPlugin implements PluginInterface {
  cookieManager: typeof CookieStorageService
  consentStorageUrl: string
  consentId: string|undefined;
  country: string|undefined;
  path: string|undefined;

  constructor(cookieManager: typeof CookieStorageService, consentStorageUrl: string) {
    this.cookieManager = cookieManager
    this.consentStorageUrl = consentStorageUrl
  }

  register() {
    window.ccListen('initConsentPlugin', (e) => {
      this.country = e.country;
      this.consentId = e.consentId;
      this.path = e.path;
    })

    window.ccListen('consentGiven', (e) => {
      this.storeConsent(e)
      window.ccDispatch('enableConsent', e.consent)
    })
  }

  storeConsent(event: EventDetailMap['consentGiven']) {
    console.log('event', event)
    this.cookieManager.setAcceptedCookies(event.consent)
    const payload = {
      id: this.consentId,
      consentMethod: event.method,
      analytics: event.consent.includes('analytics'),
      marketing: event.consent.includes('marketing'),
      functional: true,
      country: this.country,
      domain: window.ccDomain,
      path: window.location.pathname,
    }

    console.log('Payload');
    console.log(payload);

    fetch(`${this.consentStorageUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ payload: JSON.stringify(payload) }),
    })
  }
}

export default new ConsentPlugin(cookieStorageService, CONSENT_STORAGE_URL)
