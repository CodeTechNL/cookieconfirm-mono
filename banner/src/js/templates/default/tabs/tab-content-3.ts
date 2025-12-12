import { AbstractLayout } from "@/js/templates/default/components/abstract-layout";

export class TabContent3 extends AbstractLayout {
  render(): string {
    return `
    <div class="responsive-padding">
      <div class="vertical-spacing">
          <p>
          ${this.translations.about_cookies_information}
          </p>
      </div>
      <div class="consent-id-container">
          <span class="consent-id-label">Consent ID:</span> <span id="consent-id">${this.consentId}</span>
      </div>
  </div>
    `;
  }
}
