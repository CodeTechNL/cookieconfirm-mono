import Styling from "@/js/templates/default/styling";
import { MainLayout } from "@/js/templates/default/layouts/main-layout";
import { AbstractTemplate } from "@/js/app/AbstractTemplate";

class Template extends AbstractTemplate {
    getBannerHtml(): string {
        return new MainLayout(this.translations, this.banner, this.cookies, this.consentId).render();
    }

    registerBannerEvents(): void {
        this.events.registerBannerEvents();
    }

    getBannerCss(): string {
        return new Styling(this.translations, this.banner, this.cookies, this.consentId).render();
    }

    register(){
      window.ccListen('openBanner', () => {
        this.renderBanner();
      })
    }
}

export default Template;
