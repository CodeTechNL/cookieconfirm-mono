import { AbstractLayout } from "@/js/templates/default/components/abstract-layout";

export class TabContent1 extends AbstractLayout {
  render(): string {
    return `
      <div class="responsive-padding">
    <div class="vertical-spacing">
        <strong class="text-left">${this.translations.title}</strong>
        <p class="main-content">
            ${this.translations.explanation}
        </p>
    </div>
</div>
      `;
  }
}
