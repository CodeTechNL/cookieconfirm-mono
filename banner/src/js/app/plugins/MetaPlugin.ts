import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class MetaPlugin extends AbstractPlugin implements PluginInterface{
    private readonly GRANT = "grant" as const;
    private readonly REVOKE = "revoke" as const;

    isDefined(): boolean {
        return typeof window.fbq === "function";
    }

    register(): void {
        if (this.isDefined()) {
            window.fbq!("consent", this.REVOKE);
        }

        this.onConsent((e) => {
            const action = e.includes("marketing") ? this.GRANT : this.REVOKE;
            window.fbq!("consent", action);
        });
    }
}

export default new MetaPlugin();
