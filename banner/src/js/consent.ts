import './globals'
import './plugins'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import { ccDispatchEvent } from '@/js/app/helpers'
import { EventsConcrete, TemplateConcrete } from '@/js/app/types'
import { BannerEvents } from '@/js/templates/default/bannerEvents'
import template from '@/js/templates/default/template'
import BannerResolver from '@/js/app/resolvers/BannerResolver'
import localStorageService from '@/js/app/services/LocalStorageService'
import BannerService from '@/js/app/services/BannerService'

const init = async (layout: TemplateConcrete, events: EventsConcrete) => {
  const consentId = cookieStorageService.getConsentId()
  const givenConsent = cookieStorageService.getAcceptedCookies()
  const bannerData = await BannerResolver.resolve()

  const banner = new BannerService(layout, events, window.ccDomain, bannerData, consentId)
  banner.register()

  ccDispatchEvent('initConsentPlugin', {
    path: window.location.pathname,
    country: bannerData.country,
    consentId: consentId,
  })

  ccDispatchEvent('enableImplicitConsent', {
    enabled: !givenConsent.length && bannerData.banner.functional.implicitConsent
  })

  if (!givenConsent.length) {
    localStorageService.setCookieIcon(bannerData.banner.cookieIcon)

    if (!bannerData.excludePaths.includes(window.location.pathname)) {
      ccDispatchEvent('openBanner', {
        consentId: consentId,
        country: bannerData.country,
      })
    }
  } else {
    ccDispatchEvent('renderCookieIcon', localStorageService.getCookieIcon())
    ccDispatchEvent('enableConsent', givenConsent)
  }
}

init(template, BannerEvents)
