import { AbstractPlugin } from '@/js/app/plugins/AbstractPlugin'
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

export interface ConsentObjectInterface {
  ad_storage: 'granted' | 'denied'
  ad_user_data: 'granted' | 'denied'
  ad_personalization: 'granted' | 'denied'
  analytics_storage: 'granted' | 'denied'
  functionality_storage: 'granted' | 'denied'
  personalization_storage: 'granted' | 'denied'
  security_storage: 'granted' | 'denied'
  wait_for_update?: number
}
class GtmPlugin extends AbstractPlugin implements PluginInterface {
  GRANTED = 'granted'
  DENIED = 'denied'

  register(): void {
    if (!window.cookieConfirmGtmInit) {
      window.dataLayer = window.dataLayer || []

      this.gtag('consent', 'default', this.getData(false, false))

      this.onConsent((e) => {
        const consent = this.getData(e.includes('analytics'), e.includes('marketing'))

        this.gtag('consent', 'update', consent)
      })
    }
  }

  isDefined(): boolean {
    return typeof window.dataLayer === 'function'
  }

  gtag(command: 'consent', action: 'update' | 'default', params: ConsentObjectInterface): this {
    window.dataLayer.push([command, action, params])
    return this
  }

  getData(
    acceptedAnalytics: boolean,
    acceptedMarketing: boolean,
    waitForUpdate: number | null = null,
  ): ConsentObjectInterface {
    const data = {
      ad_storage: acceptedMarketing ? this.GRANTED : this.DENIED, // Marketing
      ad_user_data: acceptedMarketing ? this.GRANTED : this.DENIED, // Marketing
      ad_personalization: acceptedMarketing ? this.GRANTED : this.DENIED, // Marketing
      analytics_storage: acceptedAnalytics ? this.GRANTED : this.DENIED, // Analytics
      functionality_storage: this.GRANTED, // Functional
      personalization_storage: acceptedMarketing ? this.GRANTED : this.DENIED, // Marketing
      security_storage: this.GRANTED, // Functional
    } as ConsentObjectInterface

    if (waitForUpdate) {
      data.wait_for_update = waitForUpdate
    }

    return data
  }
}

export default new GtmPlugin()
