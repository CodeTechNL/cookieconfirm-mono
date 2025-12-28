import { AbstractPlugin } from "@/js/app/plugins/AbstractPlugin";
import { ConsentTypes } from "@/js/app/types";
import { PluginInterface } from '@/js/app/interfaces/PluginInterface'

class UetPlugin extends AbstractPlugin implements PluginInterface{
    register(): void {
        this.initDefault();

        this.onConsent((e: ConsentTypes[]) => {
            if (e.includes("marketing")) {
                window.uetq.push("consent", "update", {
                    ad_storage: "granted",
                });
            }
        });
    }

    isDefined() {
        return true;
    }

    initDefault() {
        window.uetq = window.uetq || [];
        window.uetq.push!("consent", "default", {
            ad_storage: "denied",
        });
    }
}

export default new UetPlugin();
