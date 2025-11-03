import {AbstractPlugin} from "@/js/app/plugins/AbstractPlugin";

class ClarityPlugin extends AbstractPlugin {
    register(): void {
        this.onConsent(e => {
            if(e.includes('analytics')){
                window.clarity!('consent');
            }
        })
    }

    isDefined(): boolean {
        return typeof window.clarity === 'function';
    }
}

export default new ClarityPlugin()