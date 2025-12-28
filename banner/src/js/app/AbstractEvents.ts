export abstract class AbstractEvents {
  consentId: string
  domain: string

  constructor(consentId: string, domain: string) {
    this.consentId = consentId
    this.domain = domain
  }

  abstract register(): void
}
