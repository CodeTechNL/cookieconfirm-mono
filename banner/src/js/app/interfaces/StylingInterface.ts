import { ButtonTypes, ConsentTypes, TranslationTypes } from "@/js/app/types";
import { CookieListType } from '@/js/app/interfaces/DataFeeds/CookieInterface'

export interface StylingInterface {
    banner: BannerDesignInterface;
    translations: Record<TranslationTypes, string>;
    cookies: CookieListType;
}

export interface ConsentButtonInterface {
  buttons: Record<ButtonTypes, ButtonStyle>;
  borderRadius: string;
  border: string;
}

export interface ConsentSwitchesInterface {
  activeBg: string;
  inactiveBg: string;
  circle: string;
}

export interface GeneralConsentBannerDesignInterface {
  fontColor: string;
  fontSize: string;
  tabs: string;
  company_logo: string;
}

export interface CookieIconInterface {
  icon: string;
  logo: string;
  url: string;
  name: string;
}

export interface CookieIconStorageInterface {
  icon: string
  position: CookieIconPosition
  directions: {
    x: string
    y: string
  }
}

export type CookieIconPosition = 'left' | 'right'


export interface CookieBannerBrandingInterface {
  icon: string;
  logo: string;
  url: string;
  name: string;
  position: 'left'|'right';
}

export interface CookieBannerFunctionsInterface {
  defaultConsent: ConsentTypes[];
  buttons: ButtonTypes[];
  implicitConsent: boolean;
  dismissButton: boolean;
  customizeSelectionButton: boolean;
}

export interface CookieDomainInterface {
  cookie_domain: string;
  website: string;
  parent: string | null;
  subdomain: boolean;
}

export interface ButtonStyle {
  bg: string;
  color: string;
  border: string | null;
}

export interface BannerDesignInterface {
    design: {
        consent: ConsentButtonInterface;
        switches: ConsentSwitchesInterface;
        general: GeneralConsentBannerDesignInterface;
    };
    branding: CookieBannerBrandingInterface;
    icon: CookieIconInterface
    functional: CookieBannerFunctionsInterface
    domain: CookieDomainInterface;
}
