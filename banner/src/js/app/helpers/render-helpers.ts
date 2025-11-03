export const renderIcon = (html: string): void => {
  document.body.insertAdjacentHTML('beforeend', html)
}

export const renderBanner = (html: string, css: string) => {
  document.body.insertAdjacentHTML('beforeend', html)

  const el = document.createElement('style')
  el.textContent = css
  document.head.appendChild(el)
}
