import {AbstractPlugin} from "@/js/app/plugins/AbstractPlugin";


class PluginLoader {
    plugins: AbstractPlugin[];
    constructor(plugins: AbstractPlugin[] = []) {
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

export default PluginLoader;