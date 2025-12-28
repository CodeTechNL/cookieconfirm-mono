import { PluginInterface } from '@/js/app/interfaces/PluginInterface'
import { ccDispatchEvent, ccOnEvent } from '@/js/app/helpers'
import { ConsentObjectInterface } from '@/js/app/plugins/GtmPlugin'
import { TemplateConcrete } from '@/js/app/types'
import DebugPlugin from '@/js/app/plugins/DebugPlugin'
type UetCommand = ['consent', 'default' | 'update', Record<string, string>]

declare global {
  interface Window {
    ccDebugger?: typeof DebugPlugin
    ccPlugins: PluginInterface[]
    ccListen: typeof ccOnEvent
    ccDispatch: typeof ccDispatchEvent
    ccConsentId: string | null
    ccDomain: string
    ccLayout: TemplateConcrete
    ccCustomHtml?: string | undefined
    ccCustomCookieIcon?: string
    Shopify?: {
      loadFeatures: (
        features: { name: string; version: string }[],
        cb: (error?: unknown) => void,
      ) => void
      customerPrivacy?: {
        setTrackingConsent: (consent: {
          analytics: boolean
          marketing: boolean
          preferences: boolean
          sale_of_data?: boolean
        }) => void
      }
    }
    clarity?: (command: 'consent') => void
    _paq?: Array<[string, ...unknown[]]>
    fbq?: (command: 'consent', action: 'revoke' | 'grant') => void
    uetq: UetCommand[] & {
      push: (...args: UetCommand) => number
    }
    wp_consent_type?: 'optin' | 'optout'
    wp_set_consent?: (category: string, status: 'allow' | 'deny') => void
    dataLayer: Array<['consent', 'update' | 'default', ConsentObjectInterface]>
    gtag?: (
      command: 'consent',
      action: 'update' | 'default',
      params: ConsentObjectInterface,
    ) => void
    cookieConfirmGtmInit?: boolean
  }
}
