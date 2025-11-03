// import CookieStorageService from '@/js/services/CookieStorageService'
// import { ccDispatchEvent, ccOnEvent } from '@/js/helpers'
// import ConsentPlugin from '@/js/plugins/ConsentPlugin'
// ;
// import BannerDataService from "@/js/services/BannerDataService";
// import cdnService from "@/js/services/CdnService";
// import localStorageService from "@/js/services/LocalStorageService";
// import cookieStorageService from "@/js/services/CookieStorageService";
//
// (() => {
//   'use strict'
//
//   window.ccListen = ccOnEvent
//   window.ccDispatch = ccDispatchEvent
//   window.ccPlugins = [ConsentPlugin]
//   window.ccConsentId = CookieStorageService.getConsentId();
//
//   const acceptedCookies = CookieStorageService.getAcceptedCookies();
//
//   if(!acceptedCookies.length){
//     ccDispatchEvent('openBanner', {})
//   }
//
//   const init = async  () => {
//     const banner = new BannerDataService(cdnService,localStorageService,cookieStorageService);
//
//     const initData = await banner.getBannerData()
//     console.log(initData);
//
//   }
//
//   init();
//
// })()
