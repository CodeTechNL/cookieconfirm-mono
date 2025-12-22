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
    let country = this.localStorageService.getCountry()

    if(country){
      return country;
    }

    country = await this.apiService.getCountry();
    country = country.toLowerCase();
    this.localStorageService.setCountry(country);

    return country;
  }
}

export default new CountryResolver(ApiService, LocalStorageService)
