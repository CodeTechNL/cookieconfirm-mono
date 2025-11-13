import { StylingInterface } from '@/js/app/interfaces/StylingInterface'
import LocalStorageService from '@/js/app/services/LocalStorageService'

class CdnService {
  localStorageService: typeof LocalStorageService
  apiUrl: string
  domain: string

  constructor(localStorageService: typeof LocalStorageService, apiUrl: string, domain: string) {
    this.apiUrl = apiUrl
    this.domain = domain
    this.localStorageService = localStorageService
  }

  getRequestUrl(endpoint: string) {
    return `${this.apiUrl}/${this.domain}/${endpoint}`
  }

  makeRequest(endpoint: string): Promise<Response> {
    const url = this.getRequestUrl(endpoint)
    return fetch(url)
  }

  async getInitFile(
    withLocation: boolean,
  ): Promise<{ banner: InitResponseInterface; country: string | null }> {
    const endpoint = withLocation ? 'init-with-location' : 'init'
    const response = await this.makeRequest(`${endpoint}.json`)
    const data = (await response.json()) as InitResponseInterface

    return {
      banner: data,
      country: response.headers.get('X-Country') ?? null,
    }
  }

  async getBanner(country: string | null, location: string | null): Promise<StylingInterface> {
    const source = ['banner', country, location].filter(Boolean).join('-') + '.json'

    return this.makeRequest(source).then((response) => response.json() as Promise<StylingInterface>)
  }
}

export default new CdnService(
  LocalStorageService,
  import.meta.env.VITE_CDN_URL,
  window.ccDomain,
)
