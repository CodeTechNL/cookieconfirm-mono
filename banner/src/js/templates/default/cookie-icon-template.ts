import { CookieIconStorageInterface } from '@/js/app/interfaces/StylingInterface'

class CookieIconTemplate {
  private readonly data: CookieIconStorageInterface
  constructor(data: CookieIconStorageInterface) {
    this.data = data
  }

  render() {
    if (document.getElementById("cc-icon")) {
      return;
    }
    document.body.insertAdjacentHTML("beforeend", this.getTemplate());
    this.registerEvents();
  }

  getTemplate() {
    const { icon, position, directions } = this.data

    return (
      `<div id="cc-icon" style="position: fixed; bottom: ${directions.y}; ${position}: ${directions.x}; cursor: pointer; z-index: 214748364"><img src="` +
      icon +
      `" style="width:25px; height:25px" width="25" height="25" alt="Cookie Icon"></div>`
    )
  }

  registerEvents() {
    document.getElementById('cc-icon')!.addEventListener('click', () => {
      window.ccDispatch('openBanner', {
        tab: 'tab2',
      })
    })
  }
}

export default CookieIconTemplate
