import { ConsentTypes, TabTypes } from "@/js/app/types";

export type EventDetailMap = {
    consentGiven: {
        country: string | null;
        method: string;
        consent: ConsentTypes[];
        consentId: string;
        domain: string;
    };
    enableConsent: ConsentTypes[];
    consentIdSet: {
        id: string;
    };
    openBanner: {
        tab?: TabTypes;
    };
    renderCookieIcon: object;
    countrySet: {
        country: string;
    };
    // voeg hier je andere events toe...
};

// 2) EventTypes is de set keys uit de map
export type EventTypes = keyof EventDetailMap;

// Dispatch: detail type volgt automatisch uit het event
export const ccDispatchEvent = <E extends EventTypes>(event: E, detail: EventDetailMap[E]): void => {
    window.dispatchEvent(new CustomEvent<EventDetailMap[E]>(event, { detail }));
};

// Listen: callback krijgt het juiste detail type voor het event
export const ccOnEvent = <E extends EventTypes>(event: E, cb: (detail: EventDetailMap[E]) => void): (() => void) => {
    const handler = (e: Event) => {
        cb((e as CustomEvent<EventDetailMap[E]>).detail);
    };
    window.addEventListener(event, handler as EventListener);
    return () => window.removeEventListener(event, handler as EventListener);
};

export const generateUuid = (): string => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
    );
};
