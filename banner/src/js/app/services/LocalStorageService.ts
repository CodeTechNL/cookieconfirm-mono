import { LocalStorageTypes } from '@/js/app/types'
import {StylingInterface} from "@/js/app/interfaces/StylingInterface";

class LocalStorageService {
  setValue(key: LocalStorageTypes, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }
  getValue(key: LocalStorageTypes) {
    return JSON.parse(localStorage.getItem(key) as string)
  }

  setBanner(data: StylingInterface): void {
    this.setValue('cc_banner', JSON.stringify(data))
  }

  setInit(data: Promise<InitResponseInterface>): void {
    this.setValue('cc_init', JSON.stringify(data))
  }

  getInitData(): InitResponseInterface {
    return JSON.parse(this.getValue('cc_init'))
  }

  setCountry(country: string | null) {
    this.setValue('cc_location', country)
  }

  getCountry() {
    return this.getValue('cc_location')
  }

  getBanner() : StylingInterface{
    return JSON.parse(this.getValue('cc_banner'))
  }
}

export default new LocalStorageService()
