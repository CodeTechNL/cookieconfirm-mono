import { arrowIcon } from '@/js/templates/default/components/arrow-icon'
import { toggle } from '@/js/templates/default/components/toggle'
import { AbstractLayout } from '@/js/templates/default/components/abstract-layout'
import { ClassificationTypes, ConsentTypes, TranslationTypes } from '@/js/app/types'
import {
  CookieInterface,
  CookiePlatformInterface,
  RetentionPeriodInterface,
} from '@/js/app/interfaces/DataFeeds/CookieInterface'

export class TabContent2 extends AbstractLayout {
  showToggle(type: ClassificationTypes) {
    return type !== 'unclassified'
  }

  getCard(category: ClassificationTypes, cookieInformation: CookiePlatformInterface[]) {
    let totalCookieCount = 0

    Object.keys(cookieInformation).forEach((key) => {
      totalCookieCount += Object.keys(cookieInformation[Number(key)].cookies).length
    })

    return `
<div>
<div class="clickable-block">
 <div class="accordion-item">
      <div class="accordion-header">
          <div class="full-width">
              <div class="flex-between">
                    <span class="text-bold-flex pointer open-cookie-controllers">
                      <span class="accordion-icon-toggle" tabindex="0">
                              ${arrowIcon('accordion-icon')}
                    </span>
                        <span>${this.translations[`card_${category}_cookies_title`]}</span>
                      <span class="badge">(${totalCookieCount})</span>
                    </span>
  
                  ${this.showToggle(category) ? toggle(category, category !== 'functional') : ``}
  
              </div>
              <p class="mt-4">
                  ${this.translations[`card_${category}_cookies_description`]}
              </p>
          </div>
      </div>
    
      <div class="accordion-content" hidden>
          <div class="content-box">
              <!-- Sub-accordion for specific cookies -->
  
              <div class="box-section">
                  ${this.getAccordionContent(category, cookieInformation)}
  
              </div>
  
              <!-- Sub-accordion for specific cookies ends-->
          </div>
      </div>
    </div>
</div>
</div>
   
    `
  }

  getAccordionContent(
    category: ClassificationTypes,
    controllers: CookiePlatformInterface[],
  ): string {
    const keys = Object.keys(controllers)
    let html = ``

    if (keys.length) {
      keys.forEach((key) => {
        html += this.getCookieList(controllers[Number(key)])
      })
    } else {
      html += this.getNoCookiesFound()
    }

    return html
  }

  getCookieList(controller: CookiePlatformInterface): string {
    const cookies = Object.keys(controller.cookies).map((key) => {
      return this.getCookieInformation(key, controller.cookies[key])
    })

    return `
          <details class="box-card">
            <summary class="clickable-block">
                <div class="flex-between-center">
                <span class="text-bold-flex">
                  ${controller.platform}
                  <span class="badge">(${Object.keys(controller.cookies).length})</span>
                </span>
                    ${arrowIcon('icon')}
                </div>
                ${controller.privacy_policy ? this.getPrivacyPolicy(controller.privacy_policy) : ``}
            </summary>

${cookies.join('')}
        
    </details>
    `
  }

  getCookieInformation(key: string, cookie: CookieInterface): string {
    return `
     <div class="box-container">
          <strong class="p-3">${key}</strong>
          <p class="p-3">
          ${this.getCookieDescription(cookie)}
          </p>
          <div class="box-between">
              <p>
                  <strong>${this.translations.maximum_cookie_saving_period_label}</strong> ${this.formatRetentionPeriod(cookie)} 
              </p>
              <p><strong>Type:</strong> ${this.getCookieType(cookie)}</p>
          </div>
      </div>
    `
  }

  formatRetentionPeriod(cookie: CookieInterface): string {
    if (cookie.type === 'http_cookie') {
      const parts: string[] = []

      ;(Object.keys(cookie.retention) as (keyof RetentionPeriodInterface)[]).forEach((key) => {
        const value = cookie.retention[key]
        if (value) {
          const period = this.translations[key as TranslationTypes]
          parts.push(`${cookie.retention[key]} ${period}`)
        }
      })

      return parts.join(', ')
    }

    return cookie.type
  }

  getCookieDescription(cookie: CookieInterface): string {
    return cookie.description
      ? cookie.description
      : this.translations.no_cookie_description_available
  }

  getPrivacyPolicy(url: string) {
    return `
        <a class="privacy-policy-link"
       href="${url}"
       target="_blank"
       rel="noopener noreferrer"
    >${this.translations.privacy_policy_link_text}</a>
    `
  }
  getNoCookiesFound() {
    return `<div class="box-card">
        <div class="clickable-block">
            <div class="flex-between-center">
                <span class="text-bold-flex">
                    ${this.translations.no_cookies_of_this_type_used}
                </span>
            </div>
        </div>
    </div>`
  }
  render(): string {
    let html = `<div class="responsive-padding">`
    ;(Object.keys(this.cookies) as ConsentTypes[]).forEach((cookieKey: ClassificationTypes) => {
      html += this.getCard(cookieKey, this.cookies[cookieKey])
    })

    return (html += `</div>`)
  }

  getCookieType(cookie: CookieInterface): string {
    return this.translations[cookie.type as TranslationTypes]
  }
}
