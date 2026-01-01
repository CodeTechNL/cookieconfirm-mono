import PluginLoader from '@/js/app/services/PluginLoader'
import MatomoPlugin from '@/js/app/plugins/MatomoPlugin'
import ClarityPlugin from '@/js/app/plugins/ClarityPlugin'
import ConsentPlugin from '@/js/app/plugins/ConsentPlugin'
import MetaPlugin from '@/js/app/plugins/MetaPlugin'
import ShopifyPlugin from '@/js/app/plugins/ShopifyPlugin'
import UetPlugin from '@/js/app/plugins/UetPlugin'
import WordpressPlugin from '@/js/app/plugins/WordpressPlugin'
import GtmPlugin from '@/js/app/plugins/GtmPlugin'
import CookieIconPlugin from '@/js/app/plugins/CookieIconPlugin'
import ImplicitConsentPlugin from '@/js/app/plugins/ImplicitConsentPlugin'

const plugins = new PluginLoader([
  ConsentPlugin,
  ImplicitConsentPlugin,
  GtmPlugin,
  MatomoPlugin,
  ClarityPlugin,
  MetaPlugin,
  ShopifyPlugin,
  UetPlugin,
  WordpressPlugin,
  CookieIconPlugin,
])

plugins.register()
