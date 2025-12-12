import { CookieListType } from "@/js/app/interfaces/CookieDataInterfaces";
import { ButtonTypes, ConsentTypes, TranslationTypes } from "@/js/app/types";

export interface StylingInterface {
  version: number;
  banner: BannerDesignInterface;
  translations: Record<TranslationTypes, string>;
  cookies: CookieListType;
}

export interface BannerDesignInterface {
  design: {
    consent: {
      buttons: Record<ButtonTypes, ButtonStyle>;
      borderRadius: string;
      border: string;
    };
    switches: {
      activeBg: string;
      inactiveBg: string;
      circle: string;
    };
    general: {
      fontColor: string;
      fontSize: string;
      tabs: string;
      company_logo: string;
    };
  };
  branding: {
    icon: string;
    logo: string;
    url: string;
    name: string;
    position: string;
  };
  icon: {
    icon: string;
    logo: string;
    url: string;
    name: string;
  };
  functional: {
    defaultConsent: ConsentTypes[];
    buttons: ButtonTypes[];
    implicitConsent: boolean;
    dismissButton: boolean;
    customizeSelectionButton: boolean;
  };
  domain: {
    cookie_domain: string;
    website: string;
    parent: string | null;
    subdomain: boolean;
  };
}

export interface ButtonStyle {
  bg: string;
  color: string;
  border: string | null;
}
