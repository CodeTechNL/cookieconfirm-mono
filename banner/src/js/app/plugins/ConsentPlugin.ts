import { EventDetailMap } from '@/js/app/helpers'
import {AbstractPlugin} from "@/js/app/plugins/AbstractPlugin";

class ConsentPlugin extends AbstractPlugin{
  isDefined(): boolean {
      return true;
  }

  register() {
    window.ccListen('consentGiven', (e) => {
      this.storeConsent(e);
      window.ccDispatch('enableConsent', e.consent)
    })
  }

  storeConsent(event: EventDetailMap['consentGiven']) {

    fetch('https://b3sxcv3tyfq76r3kyab5gue2am0sgkxd.lambda-url.us-east-1.on.aws', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: event.consentId,
        consentMethod: event.method,
        analytics: event.consent.includes('analytics'),
        marketing: event.consent.includes('marketing'),
        functional: true,
        country: event.country,
        domain: event.domain,
      }),
    })
  }
}

export default new ConsentPlugin()
