import { PluginInterface } from '@/js/app/interfaces/PluginInterface'
import { ccDispatchEvent, ConsentMethods } from '@/js/app/helpers'

class ImplicitConsentPlugin implements PluginInterface {
  isDefined(): boolean {
    return true
  }

  register() {
    window.ccListen('enableImplicitConsent', (e) => {
      if (!e.enabled) return
      this.registerScroll = this.registerScroll.bind(this)
      window.addEventListener('scroll', this.registerScroll)

      this.registerSideClick = this.registerSideClick.bind(this)
      window.addEventListener('click', this.registerSideClick)
    })

    return this
  }

  registerSideClick(event: MouseEvent): void {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.classList.contains('container')) {
      this.acceptAll('implicitAsideClick')
    }
  }

  registerScroll() {
    this.acceptAll('implicitScroll')
  }

  stopListeners(): void {
    window.removeEventListener('scroll', this.registerScroll)
    window.removeEventListener('click', this.registerSideClick)
  }

  acceptAll(method: ConsentMethods) {
    this.stopListeners()
    ccDispatchEvent('consentGiven', {
      method,
      consent: ['analytics', 'functional', 'marketing'],
    })
  }
}

export default new ImplicitConsentPlugin()
