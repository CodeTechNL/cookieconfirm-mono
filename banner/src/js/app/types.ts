import { AbstractTemplate } from "@/js/app/AbstractTemplate";
import { BannerDesignInterface } from "@/js/app/interfaces/StylingInterface";
import { CookieListType } from "@/js/app/interfaces/CookieDataInterfaces";
import { HasBannerEvents } from "@/js/app/interfaces/HasBannerEvents";

export type ButtonTypes = "rejectAll" | "acceptAll" | "allowSelection" | "customizeSelection";

export type CookieKeysType = "CC_p_accepted_cookies" | "CC_p_consent_id" | "CC_p_settings" | "cc_version";

export type ConsentTypes = "marketing" | "analytics" | "functional";

export type ClassificationTypes = ConsentTypes | "unclassified";

export type TabTypes = "tab1" | "tab2" | "tab3";
export type LocalStorageTypes = "cc_location" | "cc_banner" | "cc_init";

export type TranslationTypes =
  | "title"
  | "explanation"
  | "privacy_policy_link_text"
  | "privacy_policy_url"
  | "btn_accept_all"
  | "btn_allow_selection"
  | "btn_customize_selection"
  | "btn_reject_all"
  | "tab_consent"
  | "tab_details"
  | "tab_about"
  | "card_functional_cookies_title"
  | "card_analytics_cookies_title"
  | "card_marketing_cookies_title"
  | "card_unclassified_cookies_title"
  | "card_functional_cookies_description"
  | "card_analytics_cookies_description"
  | "card_marketing_cookies_description"
  | "card_unclassified_cookies_description"
  | "more_information_button_controller"
  | "unknown_cookie_saving_period"
  | "about_cookies_information"
  | "cookie_declaration_last_updated"
  | "maximum_cookie_saving_period_label"
  | "no_cookie_description_available"
  | "no_cookies_of_this_type_used"
  | "days"
  | "months"
  | "years"
  | "hours"
  | "minutes"
  | "unknown"
  | "change_your_consent"
  | "open"
  | "privacy_policy"
  | "retention_period"
  | "description";

export type TemplateConcrete = new (
  translations: Record<TranslationTypes, string>,
  banner: BannerDesignInterface,
  cookies: CookieListType,
  events: HasBannerEvents,
  consentId: string,
) => AbstractTemplate;
