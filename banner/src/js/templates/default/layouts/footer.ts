import button from "@/js/templates/default/components/button";
import { AbstractLayout } from "@/js/templates/default/components/abstract-layout";

export default class Footer extends AbstractLayout {
  render(): string {
    return `
    <div class="flex-responsive">
        <div class="footer-content">
            ${button(this.translations.btn_reject_all, "rejectAll")}
            ${button(this.translations.btn_customize_selection, "customizeSelection")}
            ${button(this.translations.btn_allow_selection, "allowSelection")}
            ${button(this.translations.btn_accept_all, "acceptAll")}
        </div>
    </div>
    `;
  }
}
