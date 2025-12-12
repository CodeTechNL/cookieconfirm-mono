import "./globals";
import BannerDataService from "@/js/app/services/BannerDataService";
import CdnService from "@/js/app/services/CdnService";
import localStorageService from "@/js/app/services/LocalStorageService";
import cookieStorageService from "@/js/app/services/CookieStorageService";
import Template from "@/js/templates/default/template";
import { BannerEvents } from "@/js/templates/default/bannerEvents";
import { TemplateConcrete } from "@/js/app/types";
import PluginLoader from "@/js/app/services/PluginLoader";
import CookieStorageService from "@/js/app/services/CookieStorageService";
import { ccDispatchEvent } from "@/js/app/helpers";
import MatomoPlugin from "@/js/app/plugins/MatomoPlugin";
import ClarityPlugin from "@/js/app/plugins/ClarityPlugin";
import ConsentPlugin from "@/js/app/plugins/ConsentPlugin";
import MetaPlugin from "@/js/app/plugins/MetaPlugin";
import ShopifyPlugin from "@/js/app/plugins/ShopifyPlugin";
import UetPlugin from "@/js/app/plugins/UetPlugin";
import WordpressPlugin from "@/js/app/plugins/WordpressPlugin";
import GtmPlugin from "@/js/app/plugins/GtmPlugin";

(() => {
    "use strict";

    const plugins = new PluginLoader([ConsentPlugin, GtmPlugin, MatomoPlugin, ClarityPlugin, MetaPlugin, ShopifyPlugin, UetPlugin, WordpressPlugin]);

    const initApp = (layout: TemplateConcrete, cookieService: typeof CookieStorageService) => {
        const initService = new BannerDataService(CdnService, localStorageService, cookieStorageService);

        initService.getInitData().then(async (result) => {
            const consentId = cookieService.getConsentId();
            window.ccDispatch("consentIdSet", {
                id: consentId,
            });

            const data = await initService.getBanner(result.country, result.banner.availableLanguages, result.banner.fallbackLanguage, result.banner.geoRules);

            const template = new layout(data.translations, data.banner, data.cookies, new BannerEvents(consentId, "sample.com"), consentId);

            const acceptedCookies = cookieService.getAcceptedCookies();

            if (acceptedCookies.length) {
                template.renderCookieIcon();
                ccDispatchEvent("enableConsent", acceptedCookies);
            } else {
                template.renderBanner();
            }

            window.ccListen("consentGiven", (e) => {
                cookieService.setAcceptedCookies(e.consent);
            });
        });
    };

    document.addEventListener("DOMContentLoaded", () => {
        plugins.register();

        initApp(Template, CookieStorageService);
    });
})();
