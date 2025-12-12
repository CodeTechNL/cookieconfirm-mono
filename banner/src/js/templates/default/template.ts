import Styling from "@/js/templates/default/styling";
import { MainLayout } from "@/js/templates/default/layouts/main-layout";
import { AbstractTemplate } from "@/js/app/AbstractTemplate";

class Template extends AbstractTemplate {
  getBannerHtml(): string {
    return new MainLayout(this.translations, this.banner, this.cookies, this.consentId).render();
  }
  registerCookieIconEvents(): void {
    this.events.registerCookieIconEvents();
  }

  registerBannerEvents(): void {
    this.events.registerBannerEvents();
  }

  getBannerCss(): string {
    return new Styling(this.translations, this.banner, this.cookies, this.consentId).render();
  }

  getCookieIconHtml(): string {
    const left = 10;
    const bottom = 10;
    const iconPosition = "left";
    const iconUrl = "https://assets.cookieconfirm.com/images/icons/icon-orange.png";

    return (
      `<div id="cc-icon" style="position: fixed; bottom: ${bottom}px; ${iconPosition}: ${left}px; cursor: pointer; z-index: 214748364"><img src="` +
      iconUrl +
      `" style="width:25px; height:25px" width="25" height="25" alt="Cookie Icon"></div>`
    );
  }
}

export default Template;
