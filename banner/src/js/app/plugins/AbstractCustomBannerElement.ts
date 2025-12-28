abstract class AbstractCustomBannerElement {
  protected hasRendered: boolean = false

  isDefined(): boolean {
    return true
  }

  isIdSelector(v: string): boolean {
    return v[0] === '#'
  }

  render(html: string) {
    if (!this.hasRendered) {
      document.body.insertAdjacentHTML('beforeend', html)
    }
  }

  renderElement(elementOrString: string) {
    if (this.isIdSelector(elementOrString)) {
      elementOrString = document.querySelector(elementOrString)!.innerHTML
    }

    this.render(elementOrString)
    this.hasRendered = true
  }
}

export default AbstractCustomBannerElement
