import { LocalStorageTypes } from '@/js/app/types'
import { CookieIconInterface } from '@/js/app/interfaces/StylingInterface'

class LocalStorageService {
  setValue(key: LocalStorageTypes, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }
  getValue(key: LocalStorageTypes) {
    return JSON.parse(localStorage.getItem(key) as string)
  }

  setCountry(country: string | null) {
    this.setValue('cc_location', country)
  }

  getCountry() {
    return this.getValue('cc_location')
  }

  setCookieIcon(data: CookieIconInterface) {
    this.setValue('cc_cookie_icon', data)
  }

  getCookieIcon(): CookieIconInterface {
    return this.getValue('cc_cookie_icon')
  }
}

export default new LocalStorageService()
