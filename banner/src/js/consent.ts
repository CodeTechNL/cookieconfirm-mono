/**
 * De pagina laad en haalt de banner op. Hiervoor zijn 3 dingen belangrijk:
 *
 * 1: de country van de user
 * 2: de instellingen van de banner
 * 3: de initialisatie van de banner
 *
 * De banner instellingen zijn afhankelijk van GEO regels. De country en de taal kunnen hier in een rol spelen
 */

import './globals'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { ccDispatchEvent } from '@/js/app/helpers'
import { TemplateConcrete } from '@/js/app/types'
import { BannerEvents } from '@/js/templates/default/bannerEvents'
import template from '@/js/templates/default/template'
import BannerResolver from '@/js/app/resolvers/BannerResolver'
import localStorageService from '@/js/app/services/LocalStorageService'

import './plugins'

const init = async (layout: TemplateConcrete) => {
  const consentId = cookieStorageService.getConsentId()
  const givenConsent = cookieStorageService.getAcceptedCookies()
  const banner = await BannerResolver.resolve()

  const design = new layout(
    banner.translations,
    banner.banner,
    banner.cookies,
    new BannerEvents(consentId, window.ccDomain),
    window.ccDomain,
  )

  design.register()

  if (!givenConsent.length) {
    localStorageService.setCookieIcon(
      banner.banner.branding.icon,
      banner.banner.branding.position,
      '10px',
      '10px',
    )
  } else {
    const cookieIcon = localStorageService.getCookieIcon()
    ccDispatchEvent('renderCookieIcon', cookieIcon)
    ccDispatchEvent('enableConsent', givenConsent)
  }
}

init(template)
