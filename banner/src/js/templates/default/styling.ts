import { ButtonTypes } from '@/js/app/types'
import { AbstractLayout } from '@/js/templates/default/components/abstract-layout'
import defaultCss from './app.css?raw'

class Styling extends AbstractLayout {
  renderBorder(borderColor: string | null): string {
    if (borderColor) {
      return `border: ${this.banner.design.consent.border} solid ${borderColor};`
    }

    return ``
  }

  getButtonStyling(): string {
    let css = `${defaultCss}`
    const styles = this.banner.design.consent.buttons

    Object.keys(styles).forEach((buttonValue) => {
      const style = styles[buttonValue as ButtonTypes]
      css += `
        #${buttonValue} {
        background-color: ${style.bg};
          color: ${style.color};
          ${this.renderBorder(style.border)}
        }      
      `
    })

    return css
  }

  render(): string {
    return `
    ${this.getButtonStyling()}        

.tab-button.active {
  border-bottom: 2px solid ${this.banner.design.general.tabs}   !important;
}

#consent-banner .tab-contents .tab-content * {
  color: ${this.banner.design.general.fontColor}   !important;
  font-size: ${this.banner.design.general.fontSize}   !important;
  line-height: 1.5 !important;
}

#consent-banner .banner-footer .footer-content .button {
  border-radius: ${this.banner.design.consent.borderRadius};
}

.toggle-switch .track {
  background-color: ${this.banner.design.switches.activeBg};
}

.toggle input:checked + .track {
  background-color: ${this.banner.design.switches.activeBg};
}

.toggle .track {
  background-color: ${this.banner.design.switches.inactiveBg};
}

.toggle .thumb {
  background-color: ${this.banner.design.switches.inactiveBg};
}

#consent-banner .container .font {
  font-size: ${this.banner.design.general.fontSize};
  color: ${this.banner.design.general.fontColor};
}
`
  }
}

export default Styling
