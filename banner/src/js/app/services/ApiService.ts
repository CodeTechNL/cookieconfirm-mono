import { CookieListType } from '@/js/app/interfaces/DataFeeds/CookieInterface'
import { BannerDesignInterface } from '@/js/app/interfaces/StylingInterface'

interface InitResponseInterface {
  version: number;
  geoRules: string[];
  cookieDomain: string;
  availableLanguages: string[];
  fallbackLanguage: string | null;
  excludePaths: string[];
}

class ApiService {
  cdnUrl: string
  website: string
  consentStoreUrl: string

  constructor(apiUrl: string, website: string, consentStoreUrl: string) {
    this.cdnUrl = apiUrl
    this.consentStoreUrl = consentStoreUrl
    this.website = website

      console.log(`Received domain: ${website}`);
  }

  async getInit(): Promise<InitResponseInterface> {
    return await fetch(this.getInitUrl()).then((res) => res.json())
  }

  async getCountry(): Promise<{ country: string }> {
    return await fetch(this.getCountryUrl()).then((res) => {
      return res.json()!
    })
  }

  getInitUrl() {
    return `${this.cdnUrl}/banner/${this.website}/init.json`
  }

  getCountryUrl() {
    return `${this.cdnUrl}/country.json`
  }

  async getBanner(byCountry: string | null, version: number): Promise<BannerDesignInterface> {
    const url = `banner-${byCountry ? `${byCountry}` : 'default'}.json?v=${version}`
    return await fetch(this.getComponentUrl(url)).then((res) => res.json())
  }

  async getTranslations(locale: string, version: number) {
    return await fetch(this.getComponentUrl(`locale-${locale}.json?v=${version}`)).then((res) =>
      res.json(),
    )
  }

  getComponentUrl(suffix: string) {
    return `${this.cdnUrl}/banner/${this.website}/${suffix}`
  }

  async getCookies(locale: string, version: number): Promise<CookieListType> {
    return await fetch(this.getComponentUrl(`cookies-${locale}.json?v=${version}`)).then((res) =>
      res.json(),
    )
  }
}

export default new ApiService(import.meta.env.VITE_CDN_URL, window.ccDomain, import.meta.env.VITE_CONSENT_STORE_URL)