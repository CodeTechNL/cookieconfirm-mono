import './globals'
import './plugins-custom'

/**
 * De pagina laad en haalt de banner op. Hiervoor zijn 3 dingen belangrijk:
 *
 * 1: de country van de user
 * 2: de instellingen van de banner
 * 3: de initialisatie van de banner
 *
 * De banner instellingen zijn afhankelijk van GEO regels. De country en de taal kunnen hier in een rol spelen
 */
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { ccDispatchEvent } from '@/js/app/helpers'

const init = async () => {
  const consentId = cookieStorageService.getConsentId()
  const givenConsent = cookieStorageService.getAcceptedCookies()

  if (!givenConsent.length) {
    ccDispatchEvent('openBanner', {
      consentId: consentId
    })
  } else {
    ccDispatchEvent('enableConsent', givenConsent)
  }
}

init()
