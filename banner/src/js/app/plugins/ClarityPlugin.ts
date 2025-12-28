import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class ClarityPlugin extends AbstractPlugin implements PluginInterface{
    register(): void {
        this.onConsent((e) => {
            if (e.includes("analytics")) {
                window.clarity!("consent");
            }
        });
    }

    isDefined(): boolean {
        return typeof window.clarity === "function";
    }
}

export default new ClarityPlugin();
