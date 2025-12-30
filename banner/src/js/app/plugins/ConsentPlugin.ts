import {CONSENT_STORAGE_URL, EventDetailMap} from '@/js/app/helpers'
import CookieStorageService from '@/js/app/services/CookieStorageService'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import {PluginInterface} from '@/js/app/interfaces/PluginInterface'

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
        console.log('event', event);
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

        fetch(`${this.consentStorageUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({payload: JSON.stringify(payload)}),
        })
    }
}

export default new ConsentPlugin(cookieStorageService, CONSENT_STORAGE_URL)
