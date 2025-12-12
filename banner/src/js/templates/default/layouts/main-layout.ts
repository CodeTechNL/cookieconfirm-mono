import { AbstractLayout } from "@/js/templates/default/components/abstract-layout";
import Header from "@/js/templates/default/layouts/header";
import { Navigation } from "@/js/templates/default/layouts/navigation";
import Content from "@/js/templates/default/layouts/content";
import Footer from "@/js/templates/default/layouts/footer";

export class MainLayout extends AbstractLayout {
    render(): string {
        return `
    
    <div class="modal-backdrop ${this.hasCustomizeSelection()}" id="consent-banner" data-tab-opened="tab1"
    role="dialog" aria-modal="true" aria-labelledby="cc-banner-heading"
     tabindex="-1"
     >
    <div class="container">
        <!-- Banner Container -->
        <div class="b">
            <!-- Banner Header -->
            <div class="banner-header">
                ${new Header(this.translations, this.banner, this.cookies, this.consentId).render()}
            </div>

            <!-- Tabs Navigation -->
            <div class="tab-navigation">
                ${new Navigation(this.translations, this.banner, this.cookies, this.consentId).render()}
            </div>

            <!-- Tab Contents -->
            <div class="tab-contents">
                ${new Content(this.translations, this.banner, this.cookies, this.consentId).render()}
            </div>

            <!-- Banner Footer -->
            <div class="banner-footer">
                ${new Footer(this.translations, this.banner, this.cookies, this.consentId).render()}
            </div>
        </div>
    </div>
</div>

    `;
    }

    hasCustomizeSelection() {
        const hasButton = this.banner.functional.customizeSelectionButton;

        return hasButton ? `has-customize-selection` : ``;
    }
}
