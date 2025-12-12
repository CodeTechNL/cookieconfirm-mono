import { TabContent1 } from "@/js/templates/default/tabs/tab-content-1";
import { TabContent2 } from "@/js/templates/default/tabs/tab-content-2";
import { TabContent3 } from "@/js/templates/default/tabs/tab-content-3";
import { AbstractLayout } from "@/js/templates/default/components/abstract-layout";
import { TabTypes } from "@/js/app/types";

export default class Content extends AbstractLayout {
  render(): string {
    return `
        ${this.renderTab("tab1", new TabContent1(this.translations, this.banner, this.cookies, this.consentId), true)}
        ${this.renderTab("tab2", new TabContent2(this.translations, this.banner, this.cookies, this.consentId))}
        ${this.renderTab("tab3", new TabContent3(this.translations, this.banner, this.cookies, this.consentId))}
        `;
  }

  renderTab(tab: TabTypes, content: RenderableInterface, isActive: boolean = false) {
    return `<div class="tab-content ${isActive ? "active" : ""}" id="${tab}">
            ${content.render()}
        </div>`;
  }
}
