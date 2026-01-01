import ApiService from '@/js/app/services/ApiService'
import LocalStorageService from '@/js/app/services/LocalStorageService'

class CountryResolver {
  apiService: typeof ApiService
  localStorageService: typeof LocalStorageService

  constructor(apiService: typeof ApiService, localStorageService: typeof LocalStorageService) {
    this.apiService = apiService
    this.localStorageService = localStorageService
  }

  async resolve() {
    const country = this.localStorageService.getCountry()

    if(country){
      return country;
    }

    const request = await this.apiService.getCountry();
    this.localStorageService.setCountry(request.country.toLowerCase());

    return country;
  }
}

export default new CountryResolver(ApiService, LocalStorageService)
