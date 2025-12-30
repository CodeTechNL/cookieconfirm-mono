export abstract class AbstractEvents {
    consentId: string
    domain: string
    country: string

    constructor(consentId: string, domain: string, country: string) {
        this.consentId = consentId
        this.domain = domain
        this.country = country;

        console.log(`Domain: ${this.domain}`);
        console.log(`Country: ${this.country}`);
    }

    abstract register(): void
}
