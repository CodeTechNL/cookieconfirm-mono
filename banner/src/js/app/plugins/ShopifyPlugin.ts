import { ConsentTypes } from '@/js/app/types'
import {AbstractPlugin} from "@/js/app/plugins/AbstractPlugin";

class ShopifyPlugin extends AbstractPlugin {
  register(): void {
    this.onConsent((consent: ConsentTypes[]) => {
      this.setAllConsentTypes(consent)
    })
  }

  isDefined(): boolean {
    return typeof window.Shopify?.customerPrivacy?.setTrackingConsent === 'function'
  }

  setAllConsentTypes(cookies: ConsentTypes[]): void {
    try {
      const has = (t: ConsentTypes) => cookies.includes(t)

      const consent = {
        analytics: has('analytics'),
        marketing: has('marketing'),
        preferences: has('functional'),
        sale_of_data: has('marketing'),
      }

      window.Shopify?.loadFeatures?.(
          [{ name: 'consent-tracking-api', version: '0.1' }],
          function (error?: unknown) {
            if (error) {
              console.error('Shopify loadFeatures error:', error)
              return
            }
            window.Shopify?.customerPrivacy?.setTrackingConsent?.(consent)
          },
      )
    } catch (err) {
      console.log('A error occured while setting shopify consent: ', err)
    }
  }
}

export default new ShopifyPlugin
