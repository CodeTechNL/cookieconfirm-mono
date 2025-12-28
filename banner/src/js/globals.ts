import { ccDispatchEvent, ccOnEvent } from '@/js/app/helpers'

window.ccListen = ccOnEvent
window.ccDispatch = ccDispatchEvent
window.ccPlugins = window.ccPlugins || [];
window.ccDomain =
  window.ccDomain ||
  window.location.hostname.replace(/^https?:\/\/(www\.)?/, 'https://').replace(/^www\./, '')