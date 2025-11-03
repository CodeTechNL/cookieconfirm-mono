import {AbstractPlugin} from "@/js/app/plugins/AbstractPlugin";
import MatomoPlugin from "@/js/app/plugins/MatomoPlugin";
import ClarityPlugin from "@/js/app/plugins/ClarityPlugin";
import ConsentPlugin from "@/js/app/plugins/ConsentPlugin";
import MetaPlugin from "@/js/app/plugins/MetaPlugin";
import ShopifyPlugin from "@/js/app/plugins/ShopifyPlugin";
import UetPlugin from "@/js/app/plugins/UetPlugin";
import WordpressPlugin from "@/js/app/plugins/WordpressPlugin";
import GtmPlugin from "@/js/app/plugins/GtmPlugin";

class PluginLoader {
    plugins: AbstractPlugin[];
    constructor(plugins: AbstractPlugin[]) {
        this.plugins = plugins;

    }

    register(){
        this.plugins.forEach(plugin => {
            plugin.register();
        })

        window.ccPlugins.forEach(plugin => {
            plugin.register();
        })
    }
}

const plugins = new PluginLoader([
    ConsentPlugin,
    GtmPlugin,
    MatomoPlugin,
    ClarityPlugin,
    MetaPlugin,
    ShopifyPlugin,
    UetPlugin,
    WordpressPlugin
])

export default plugins;