import { AbstractLayout } from '@/js/templates/default/components/abstract-layout'
import { TabTypes } from '@/js/app/types'

export class Navigation extends AbstractLayout {
  render(): string {
    return `
        <nav>
            ${this.getNavigationButton(this.translations.tab_consent, 'tab1', true)}
            ${this.getNavigationButton(this.translations.tab_details, 'tab2')}
            ${this.getNavigationButton(this.translations.tab_about, 'tab3')}
        </nav>
    `
  }

  getNavigationButton(label: string, tab: TabTypes, isActive: boolean = false): string {
    return `<div class="tab-button font ${isActive ? 'active' : ''}" data-tab="${tab}" tabindex="0" role="tab">${label}</div>`
  }
}
