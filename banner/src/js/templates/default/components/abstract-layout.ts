import { TranslationTypes } from "@/js/app/types";
import { BannerDesignInterface } from "@/js/app/interfaces/StylingInterface";
import { CookieListType } from "@/js/app/interfaces/CookieDataInterfaces";

export abstract class AbstractLayout {
  translations: Record<TranslationTypes, string>;
  banner: BannerDesignInterface;
  cookies: CookieListType;
  consentId: string;
  constructor(translations: Record<TranslationTypes, string>, banner: BannerDesignInterface, cookies: CookieListType, consentId: string) {
    this.translations = translations;
    this.banner = banner;
    this.cookies = cookies;
    this.consentId = consentId;
  }

  abstract render(): string;
}
