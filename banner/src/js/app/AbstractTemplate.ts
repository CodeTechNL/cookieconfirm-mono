import { TranslationTypes } from "@/js/app/types";
import { BannerDesignInterface } from "@/js/app/interfaces/StylingInterface";
import { CookieListType } from "@/js/app/interfaces/CookieDataInterfaces";
import { HasBannerEvents } from "@/js/app/interfaces/HasBannerEvents";

export abstract class AbstractTemplate {
  translations: Record<TranslationTypes, string>;
  banner: BannerDesignInterface;
  cookies: CookieListType;
  events: HasBannerEvents;
  consentId: string;

  constructor(
    translations: Record<TranslationTypes, string>,
    banner: BannerDesignInterface,
    cookies: CookieListType,
    events: HasBannerEvents,
    consentId: string,
  ) {
    this.translations = translations;
    this.banner = banner;
    this.cookies = cookies;
    this.events = events;
    this.consentId = consentId;

    this.init();
  }

  abstract getBannerHtml(): string;

  abstract getBannerCss(): string;

  abstract getCookieIconHtml(): string;

  abstract registerBannerEvents(): void;

  abstract registerCookieIconEvents(): void;

  renderBanner(): void {
    const modal = document.getElementById("consent-banner");
    if (modal) {
      modal.classList.remove("hidden");
      return;
    }

    document.body.insertAdjacentHTML("beforeend", this.getBannerHtml());

    const el = document.createElement("style");
    el.textContent = this.getBannerCss();
    document.head.appendChild(el);

    this.registerBannerEvents();
  }

  renderCookieIcon(): void {
    if (document.getElementById("cc-icon")) {
      return;
    }
    document.body.insertAdjacentHTML("beforeend", this.getCookieIconHtml());

    this.registerCookieIconEvents();
  }

  init(): void {
    window.ccListen("openBanner", () => {
      this.renderBanner();
    });

    window.ccListen("renderCookieIcon", () => {
      this.renderCookieIcon();
    });
  }
}
