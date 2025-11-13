import { EventDetailMap } from '@/js/app/helpers'

export class ApiService {
  domain: string

  constructor(domain: string) {
    this.domain = domain
  }

  store(event: EventDetailMap['consentGiven']): void {
    fetch('https://4gugyupodxlfhzzsdtk3aygnya0ymspw.lambda-url.us-east-1.on.aws', {
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
        country: 'country',
        domain: this.domain,
      }),
    })
  }
}
