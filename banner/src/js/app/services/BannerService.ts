import { EventsConcrete, TemplateConcrete } from '@/js/app/types'
import { TranslationsInterface } from '@/js/app/interfaces/TranslationsInterface'
import { BannerDesignInterface } from '@/js/app/interfaces/StylingInterface'
import { CookieListType } from '@/js/app/interfaces/DataFeeds/CookieInterface'

type BannerDataService = {
  translations: TranslationsInterface
  banner: BannerDesignInterface
  cookies: CookieListType
}

class BannerService {
  template: TemplateConcrete
  events: EventsConcrete
  domain: string
  data: BannerDataService
  consentId: string

  constructor(
    template: TemplateConcrete,
    events: EventsConcrete,
    domain: string,
    data: BannerDataService,
    consentId: string,
  ) {
    this.template = template
    this.events = events
    this.domain = domain
    this.data = data
    this.consentId = consentId
  }

  register(): void {
    const template = this.template as TemplateConcrete
    const events = this.events as EventsConcrete

    const design = new template(
      this.data.translations,
      this.data.banner,
      this.data.cookies,
      new events(this.consentId, this.domain),
      this.consentId,
    )

    design.register()
  }
}

export default BannerService
