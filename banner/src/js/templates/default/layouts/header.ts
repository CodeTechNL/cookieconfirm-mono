import { AbstractLayout } from "@/js/templates/default/components/abstract-layout";

export default class Header extends AbstractLayout {
    render(): string {
        return `
        <div class="flex-between-center">
            <div>
                ${this.getWebsiteLogo()}
            </div>
            <div class="company-logo-container">
                ${this.getPoweredBy(this.banner.branding.url, this.banner.branding.logo_right)}
                    <div id="close-button" tabindex="0">
                        ${this.banner.functional.dismissButton ? this.getCloseIcon() : ``}
                    </div>
            </div>
        </div>
    `;
    }

    getWebsiteLogo() {
        return `<img id="logo" src="${this.banner.branding.logo_left}" alt="${this.banner.branding.name}" />`;
    }

    getPoweredBy(websiteUrl: string, websiteLogoUrl: string) {
        return `
    <a
        class="full-width"
        href="${websiteUrl}"
        rel="noopener nofollow"
        target="_blank"
        aria-label="${websiteUrl} - opens in a new window">
            <img id="company-logo" src="${websiteLogoUrl}">
    </a>
`;
    }

    getCloseIcon() {
        return `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <line x1="4" y1="4" x2="16" y2="16" stroke="black" stroke-width="2"/>
              <line x1="16" y1="4" x2="4" y2="16" stroke="black" stroke-width="2"/>
          </svg>`;
    }
}
