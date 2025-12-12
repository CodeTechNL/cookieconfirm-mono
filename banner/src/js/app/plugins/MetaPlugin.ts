import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";
import { ConsentTypes } from "@/js/app/types";

class MetaPlugin extends AbstractPlugin {
    private readonly GRANT = "grant" as const;
    private readonly REVOKE = "revoke" as const;

    isDefined(): boolean {
        return typeof window.fbq === "function";
    }

    register(): void {
        if (this.isDefined()) {
            window.fbq!("consent", this.REVOKE);
        }

        this.onConsent((e: { consent: ConsentTypes[] }) => {
            const action = e.consent.includes("marketing") ? this.GRANT : this.REVOKE;
            window.fbq!("consent", action);
        });
    }
}

export default new MetaPlugin();
