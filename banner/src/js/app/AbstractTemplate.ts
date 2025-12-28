import { TranslationTypes } from '@/js/app/types'
import { BannerDesignInterface } from '@/js/app/interfaces/StylingInterface'
import { CookieListType } from '@/js/app/interfaces/DataFeeds/CookieInterface'
import { TranslationsInterface } from '@/js/app/interfaces/TranslationsInterface'
import { AbstractEvents } from '@/js/app/AbstractEvents'

export abstract class AbstractTemplate {
  translations: TranslationsInterface
  banner: BannerDesignInterface
  cookies: CookieListType
  events: AbstractEvents
  consentId: string

  constructor(
    translations: Record<TranslationTypes, string>,
    banner: BannerDesignInterface,
    cookies: CookieListType,
    events: AbstractEvents,
    consentId: string,
  ) {
    this.translations = translations
    this.banner = banner
    this.cookies = cookies
    this.events = events
    this.consentId = consentId

    this.init()
  }

  abstract getBannerHtml(): string

  abstract getBannerCss(): string

  abstract registerBannerEvents(): void

  renderBanner(): void {
    const modal = document.getElementById('consent-banner')
    if (modal) {
      modal.classList.remove('hidden')
      return
    }

    document.body.insertAdjacentHTML('beforeend', this.getBannerHtml())

    const el = document.createElement('style')
    el.textContent = this.getBannerCss()
    document.head.appendChild(el)

    this.registerBannerEvents()
  }

  init(): void {
    window.ccListen('openBanner', () => {
      this.renderBanner()
    })
  }

  abstract register() : void;
}
