// /**
//  * De pagina laad en haalt de banner op. Hiervoor zijn 3 dingen belangrijk:
//  *
//  * 1: de country van de user
//  * 2: de instellingen van de banner
//  * 3: de initialisatie van de banner
//  *
//  * De banner instellingen zijn afhankelijk van GEO regels. De country en de taal kunnen hier in een rol spelen
//  */
//
//
// import "./globals";
// import BannerDataService from "@/js/app/services/BannerDataService";
// import CdnService from "@/js/app/services/CdnService";
// import localStorageService from "@/js/app/services/LocalStorageService";
// import cookieStorageService from "@/js/app/services/CookieStorageService";
// import Template from "@/js/templates/default/template";
// import { BannerEvents } from "@/js/templates/default/bannerEvents";
// import { TemplateConcrete } from "@/js/app/types";
// import PluginLoader from "@/js/app/services/PluginLoader";
// import CookieStorageService from "@/js/app/services/CookieStorageService";
// import { ccDispatchEvent } from "@/js/app/helpers";
// import MatomoPlugin from "@/js/app/plugins/MatomoPlugin";
// import ClarityPlugin from "@/js/app/plugins/ClarityPlugin";
// import ConsentPlugin from "@/js/app/plugins/ConsentPlugin";
// import MetaPlugin from "@/js/app/plugins/MetaPlugin";
// import ShopifyPlugin from "@/js/app/plugins/ShopifyPlugin";
// import UetPlugin from "@/js/app/plugins/UetPlugin";
// import WordpressPlugin from "@/js/app/plugins/WordpressPlugin";
// import GtmPlugin from "@/js/app/plugins/GtmPlugin";
// import ApiService from '@/js/app/services/ApiService'
//
//
// const init = async () => {
//   if(!cookieStorageService.hasConsent()){
//
//     const initRequests = [
//       ApiService.getInit(),
//       ApiService.getCountry()
//     ]
//
//     Promise.all(initRequests)
//       .then(([initData, country]) => {
//         console.log(initData, country)
//       })
//
//
//
//   }
//
// }
// init();