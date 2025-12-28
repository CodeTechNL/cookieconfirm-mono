import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class MatomoPlugin extends AbstractPlugin implements PluginInterface{
    register(): void {
        this.onConsent((e) => {
            if (e.includes("analytics")) {
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
