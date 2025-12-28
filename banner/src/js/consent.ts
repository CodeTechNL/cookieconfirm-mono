import './globals'
import './plugins'

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
import { EventsConcrete, TemplateConcrete } from '@/js/app/types'
import { BannerEvents } from '@/js/templates/default/bannerEvents'
import template from '@/js/templates/default/template'
import BannerResolver from '@/js/app/resolvers/BannerResolver'
import localStorageService from '@/js/app/services/LocalStorageService'
import BannerService from '@/js/app/services/BannerService'
console.log('Cookie Confirm Consent Loaded');
const init = async (layout: TemplateConcrete, events: EventsConcrete) => {
  const consentId = cookieStorageService.getConsentId()
  const givenConsent = cookieStorageService.getAcceptedCookies()
  const bannerData = await BannerResolver.resolve()

  const banner = new BannerService(layout, events, window.ccDomain, bannerData, consentId)
  banner.register()

  if (!givenConsent.length) {
    localStorageService.setCookieIcon(
      bannerData.banner.branding.icon,
      bannerData.banner.branding.position,
      '10px',
      '10px',
    )

    ccDispatchEvent('openBanner', {
      consentId: consentId
    })
  } else {
    const cookieIcon = localStorageService.getCookieIcon()
    ccDispatchEvent('renderCookieIcon', cookieIcon)
    ccDispatchEvent('enableConsent', givenConsent)
  }
}

init(template, BannerEvents)
