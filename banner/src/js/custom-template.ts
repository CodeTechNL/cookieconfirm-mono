import './globals'
import './plugins-custom'

// @todo implement country request
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { ccDispatchEvent } from '@/js/app/helpers'

const init = async () => {
  const consentId = cookieStorageService.getConsentId()
  const givenConsent = cookieStorageService.getAcceptedCookies()

  if (!givenConsent.length) {
    ccDispatchEvent('openBanner', {
      consentId: consentId,
      country: '',
    })
  } else {
    ccDispatchEvent('enableConsent', givenConsent)
  }
}

init()
