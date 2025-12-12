import { ccDispatchEvent } from "@/js/app/helpers";
import { ButtonTypes, ConsentTypes, TabTypes } from "@/js/app/types";
import { HasBannerEvents } from "@/js/app/interfaces/HasBannerEvents";

export class BannerEvents implements HasBannerEvents {
    consentId: string;
    domain: string;
    constructor(consentId: string, domain: string) {
        this.consentId = consentId;
        this.domain = domain;
    }

    registerBannerEvents() {
        this.registerConsentButtons();
        this.registerModalFocus();
        this.registerTabButtonClicks();
        this.registerTabButtonEnter();
        this.registerModalTabFocus();
        this.firstAccordionKeyboardEvents();
        this.registerSwitches();
        this.registerCookieIconTabOpen();

        this.events();
    }

    registerConsentButtons() {
        this.onConsentClick("rejectAll", () => {
            ccDispatchEvent("consentGiven", {
                country: "",
                method: "rejectAll",
                consent: ["functional"],
                consentId: this.consentId,
                domain: this.domain,
            });
        });

        this.onConsentClick("allowSelection", () => {
            const selected = ["functional"] as ConsentTypes[];
            document.querySelectorAll<HTMLInputElement>(".consent-type-value:checked").forEach((element) => {
                selected.push(element.value as ConsentTypes);
            });

            ccDispatchEvent("consentGiven", {
                method: "rejectAll",
                consent: selected,
                consentId: this.consentId,
                domain: this.domain,
                country: "",
            });
        });

        this.onConsentClick("customizeSelection", () => {
            this.openTab("tab2");
        });

        this.onConsentClick("acceptAll", () => {
            ccDispatchEvent("consentGiven", {
                method: "acceptAll",
                consent: ["functional", "marketing", "analytics"],
                consentId: this.consentId,
                domain: this.domain,
                country: "",
            });
        });

        this.onConsentClick("close-button", () => {
            ccDispatchEvent("consentGiven", {
                method: "closeButton",
                consent: ["functional"],
                consentId: this.consentId,
                domain: this.domain,
                country: "",
            });
        });
    }

    registerModalFocus() {
        document.getElementById("consent-banner")?.focus();
    }

    openTab(tabId: TabTypes) {
        document.getElementById("consent-banner")!.setAttribute("data-tab-opened", tabId);

        document.querySelectorAll(".tab-button").forEach((tab) => {
            tab.classList.remove("active");
        });

        document.querySelectorAll(".tab-content").forEach((tab) => {
            tab.classList.remove("active");
            tab.removeAttribute("hidden");
        });

        document.querySelector('[data-tab="' + tabId + '"]')!.classList.add("active");
        document.querySelector("#" + tabId)!.classList.add("active");
    }

    onConsentClick(element: ButtonTypes | string, cb?: () => void) {
        document.getElementById(element)!.addEventListener("click", () => {
            console.log("clicked on " + element);
            if (cb) cb();
        });
    }

    registerTabButtonClicks() {
        document.querySelectorAll(".tab-button").forEach((tab) => {
            tab.addEventListener("click", () => {
                const targetTab = tab.attributes.getNamedItem("data-tab")!.value as TabTypes;
                this.openTab(targetTab);
            });
        });
    }

    registerTabButtonEnter(): void {
        const tabButtons = document.querySelectorAll<HTMLDivElement>('.tab-navigation > nav > div[role="tab"]');

        tabButtons.forEach((btn) => {
            btn.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    btn.click();
                }
            });
        });
    }

    registerModalTabFocus(): void {
        const popup = document.querySelector<HTMLElement>("#consent-banner")!;

        popup.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            const focusables = popup.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    firstAccordionKeyboardEvents(): void {
        const arrowElements = document.querySelectorAll<HTMLElement>(".accordion-icon-toggle");

        arrowElements.forEach((btn) => {
            btn.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.toggleFirstAccordion(btn);
                }
            });
        });

        const cookieControllers = document.querySelectorAll<HTMLElement>(".accordion-header");

        cookieControllers.forEach((btn) => {
            btn.addEventListener("click", (e: MouseEvent) => {
                const target = e!.target as Element;
                if (target.closest(".thumb") || target.closest(".track")) {
                    return;
                }
                this.toggleFirstAccordion(btn);
            });
        });
    }

    toggleFirstAccordion(btn: HTMLElement) {
        const el = btn.closest(".accordion-item")!;
        el.querySelector(".accordion-content")!.toggleAttribute("hidden");
        el.classList.toggle("open");
    }

    events() {
        window.ccListen("consentGiven", () => {
            document.getElementById("consent-banner")!.classList.add("hidden");
            window.ccDispatch("renderCookieIcon", {});
        });

        window.ccListen("consentIdSet", (e) => {
            document.getElementById("consent-id")!.innerText = e.id;
        });
    }

    registerSwitches(): void {
        document.querySelectorAll<HTMLElement>(".toggle").forEach((toggle) => {
            toggle.addEventListener("click", () => {
                this.handleSwitch(toggle);
            });

            toggle.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.handleSwitch(toggle);
                }
            });
        });
    }

    handleSwitch(toggle: HTMLElement) {
        const checkbox = toggle.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if (!checkbox) return;

        checkbox.checked = !checkbox.checked;
    }

    registerCookieIconEvents(): void {
        document.getElementById("cc-icon")!.addEventListener("click", () => {
            window.ccDispatch("openBanner", {
                tab: "tab2",
            });
        });
    }

    private registerCookieIconTabOpen() {
        window.ccListen("openBanner", (e) => {
            if (e.tab) {
                this.openTab(e.tab);
            }
        });
    }
}
