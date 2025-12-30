import {BannerDesignInterface} from '@/js/app/interfaces/StylingInterface'
import {TranslationsInterface} from '@/js/app/interfaces/TranslationsInterface'
import {CookieListType} from '@/js/app/interfaces/DataFeeds/CookieInterface'
import ApiService from '@/js/app/services/ApiService'
import {getBrowserLanguage, getGeoCountryUrl, getLocale} from '@/js/app/helpers'
import CountryResolver from '@/js/app/resolvers/CountryResolver'

class BannerResolver {
    apiService: typeof ApiService

    constructor(apiService: typeof ApiService) {
        this.apiService = apiService
    }

    async resolve(): Promise<{
        banner: BannerDesignInterface
        translations: TranslationsInterface
        cookies: CookieListType
        country: string
    }> {
        return new Promise((resolve) => {
            Promise.all([this.apiService.getInit(), CountryResolver.resolve()]).then(
                ([initData, country]) => {
                    const geoRuleCountry = getGeoCountryUrl(country, initData.geoRules)
                    const locale = getLocale(
                        getBrowserLanguage(),
                        initData.availableLanguages,
                        initData.fallbackLanguage,
                    )

                    Promise.all([
                        this.apiService.getBanner(geoRuleCountry, initData.version),
                        this.apiService.getTranslations(locale, initData.version),
                        this.apiService.getCookies(locale, initData.version),
                    ]).then(([banner, translations, cookies]) => {
                        console.log(country);
                        resolve({banner, translations, cookies, country})
                    })
                },
            )
        })
    }
}

export default new BannerResolver(ApiService)
