import { PluginInterface } from "@/js/app/interfaces/PluginInterface";
import { ccDispatchEvent, ccOnEvent } from "@/js/app/helpers";
import { ConsentObjectInterface } from "@/js/app/plugins/GtmPlugin";
type UetCommand = ["consent", "default" | "update", Record<string, string>];

declare global {
    interface Window {
        ccPlugins: PluginInterface[];
        ccListen: typeof ccOnEvent;
        ccDispatch: typeof ccDispatchEvent;
        ccConsentId: string | null;
        ccDomain: string;
        Shopify?: {
            loadFeatures: (features: { name: string; version: string }[], cb: (error?: unknown) => void) => void;
            customerPrivacy?: {
                setTrackingConsent: (consent: { analytics: boolean; marketing: boolean; preferences: boolean; sale_of_data?: boolean }) => void;
            };
        };
        clarity?: (command: "consent") => void;
        _paq?: Array<[string, ...unknown[]]>;
        fbq?: (command: "consent", action: "revoke" | "grant") => void;
        uetq: UetCommand[] & {
            push: (...args: UetCommand) => number;
        };
        wp_consent_type?: "optin" | "optout";
        wp_set_consent?: (category: string, status: "allow" | "deny") => void;
        dataLayer: Array<["consent", "update" | "default", ConsentObjectInterface]>;
        gtag?: (command: "consent", action: "update" | "default", params: ConsentObjectInterface) => void;
        cookieConfirmGtmInit?: boolean;
    }
}

window.ccListen = ccOnEvent;
window.ccDispatch = ccDispatchEvent;
window.ccPlugins = [];
window.ccDomain = window.ccDomain || window.location.hostname.replace(/^https?:\/\/(www\.)?/, "https://").replace(/^www\./, "");
