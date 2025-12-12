import { EventDetailMap } from "@/js/app/helpers";
import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";

class ConsentPlugin extends AbstractPlugin {
  isDefined(): boolean {
    return true;
  }

  register() {
    window.ccListen("consentGiven", (e) => {
      console.log(e);
      this.storeConsent(e);
      window.ccDispatch("enableConsent", e.consent);
    });
  }

  storeConsent(event: EventDetailMap["consentGiven"]) {
    console.log("Store the consent");
    console.log(event);
    const payload = {
      id: event.consentId,
      consentMethod: event.method,
      analytics: event.consent.includes("analytics"),
      marketing: event.consent.includes("marketing"),
      functional: true,
      country: event.country,
      domain: window.ccDomain,
      path: window.location.pathname,
    };

    console.log(payload);
    fetch(`${import.meta.env.VITE_APP_URL}/api/v1/store-consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ payload: JSON.stringify(payload) }),
    });
  }
}

export default new ConsentPlugin();
