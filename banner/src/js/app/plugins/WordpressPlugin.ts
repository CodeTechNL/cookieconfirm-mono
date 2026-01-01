import { AbstractPlugin } from '@/js/app/plugins/AbstractPlugin'
import { ConsentTypes } from '@/js/app/types'
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class WordpressPlugin extends AbstractPlugin implements PluginInterface {
  private readonly ALLOW = 'allow' as const
  private readonly DENY = 'deny' as const

  register(): void {
    this.initDefault()

    this.onConsent((e: ConsentTypes[]) => {
      const consent = e

      const allow = (type: ConsentTypes) => (consent.includes(type) ? this.ALLOW : this.DENY)

      // Functionele cookies
      this.setConsent('functional', allow('functional'))
      this.setConsent('preferences', allow('functional'))

      // Analytics en marketing
      this.setConsent('analytics-anonymous', allow('marketing'))
      this.setConsent('analytics', allow('marketing'))
      this.setConsent('marketing', allow('marketing'))
    })
  }

  isDefined(): boolean {
    return typeof window.wp_set_consent === 'function'
  }

  /** Wrapper voor WordPress consent-functie */
  private setConsent(category: string, status: 'allow' | 'deny'): void {
    window.wp_set_consent?.(category, status)
  }

  /** Stel de standaard WordPress-consentmodus in */
  initDefault(): void {
    window.wp_consent_type = 'optin'
  }
}

export default new WordpressPlugin()
