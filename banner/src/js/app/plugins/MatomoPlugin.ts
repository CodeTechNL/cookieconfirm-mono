import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";

class MatomoPlugin extends AbstractPlugin {
    register(): void {
        this.onConsent((e) => {
            if (e.consent.includes("analytics")) {
                window._paq!.push(["rememberCookieConsentGiven"]);
                window._paq!.push(["setConsentGiven"]);
            } else {
                window._paq!.push(["forgetCookieConsentGiven"]);
                window._paq!.push(["deleteCookies"]);
            }
        });
    }
    isDefined() {
        return typeof window._paq !== "undefined";
    }
}

export default new MatomoPlugin();
