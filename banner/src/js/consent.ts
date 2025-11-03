import BannerDataService from '@/js/app/services/BannerDataService'
import CdnService from '@/js/app/services/CdnService'
import localStorageService from '@/js/app/services/LocalStorageService'
import cookieStorageService from '@/js/app/services/CookieStorageService'
import Template from '@/js/templates/default/template'
import { BannerEvents } from '@/js/templates/default/bannerEvents'
import './globals'
import { TemplateConcrete } from '@/js/app/types'
;
import PluginLoader from "@/js/app/services/PluginLoader";
import CookieStorageService from "@/js/app/services/CookieStorageService";
import {ccDispatchEvent} from "@/js/app/helpers";

(() => {
  'use strict'

  const initApp = (layout: TemplateConcrete, cookieService: typeof CookieStorageService) => {
    const initService = new BannerDataService(CdnService, localStorageService, cookieStorageService)

    initService.getInitData().then(async (result) => {

      const consentId = cookieService.getConsentId();
      window.ccDispatch('consentIdSet', {
        id: consentId
      });

      const data = await initService.getBanner(
        result.country,
        result.banner.availableLanguages,
        result.banner.fallbackLanguage,
        result.banner.geoRules,
      )

      const template = new layout(
        data.translations,
        data.banner,
        data.cookies,
        new BannerEvents('test', 'sample.com'),
        consentId,
      )

      const acceptedCookies = cookieService.getAcceptedCookies();

      if(acceptedCookies.length){
        template.renderCookieIcon();
        ccDispatchEvent('enableConsent', acceptedCookies)
      } else {
        template.renderBanner()
      }

      window.ccListen('consentGiven', e => {
        cookieService.setAcceptedCookies(e.consent)
      })
    })
  }

  document.addEventListener('DOMContentLoaded', () => {
    PluginLoader.register()

    initApp(Template, CookieStorageService)
  })


})()
