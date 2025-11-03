var w=Object.defineProperty;var x=(i,e,n)=>e in i?w(i,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):i[e]=n;var s=(i,e,n)=>x(i,typeof e!="symbol"?e+"":e,n);class v{constructor(e,n,t){s(this,"cdn");s(this,"localStorage");s(this,"cookieStorage");this.cdn=e,this.localStorage=n,this.cookieStorage=t}async getInitData(){return new Promise(e=>{let n;const t=this.localStorage.getCountry();if(this.cookieStorage.getVersion()&&(n=this.localStorage.getInitData(),n))return e({banner:n,country:t?t.toLowerCase():null});e(this.getNewInitData(!!t))})}async getNewInitData(e){return await this.cdn.getInitFile(e).then(n=>(this.localStorage.setInit(n.banner),this.localStorage.setCountry(n.country),this.cookieStorage.setVersion(n.banner.version),{banner:n.banner,country:n.country}))}getBanner(e,n,t,o){const a=this.getCountryCode(e,o),r=this.getBannerLanguage(this.getBrowserLanguage(),t,n),c=this.localStorage.getBanner();if(c.version!==this.cookieStorage.getVersion()){console.log("Getting full new version");const l=this.cdn.getBanner(a,r);return l.then(h=>(this.localStorage.setBanner(h),h)),l}return console.log("Skip to here"),c}getCountryCode(e,n){return e&&n.includes(e)?e:null}getBrowserLanguage(){return navigator.language.split("-")[0].toUpperCase()}getBannerLanguage(e,n,t){return t.includes(e)?e:t.length===1?t[0]:n}}class y{setValue(e,n){localStorage.setItem(e,JSON.stringify(n))}getValue(e){return JSON.parse(localStorage.getItem(e))}setBanner(e){this.setValue("cc_banner",JSON.stringify(e))}setInit(e){this.setValue("cc_init",JSON.stringify(e))}getInitData(){return JSON.parse(this.getValue("cc_init"))}setCountry(e){this.setValue("cc_location",e)}getCountry(){return this.getValue("cc_location")}getBanner(){return JSON.parse(this.getValue("cc_banner"))}}const m=new y;class k{constructor(e,n,t){s(this,"localStorageService");s(this,"apiUrl");s(this,"domain");this.apiUrl=n,this.domain=t,this.localStorageService=e}getRequestUrl(e){return`${this.apiUrl}/${e}`}makeRequest(e){const n=this.getRequestUrl(e);return fetch(n)}async getInitFile(e){const n=e?"init-with-location":"init",t=await this.makeRequest(`${n}.json`);return{banner:await t.json(),country:t.headers.get("X-Country")??null}}async getBanner(e,n){const t=["banner",e,n].filter(Boolean).join("-")+".json";return this.makeRequest(t).then(o=>o.json())}}const C=new k(m,"http://localhost:5173/development/data-sources",window.location.host),b=(i,e)=>{console.log("Dispatching: "+i),console.log(e),window.dispatchEvent(new CustomEvent(i,{detail:e}))},$=(i,e)=>{const n=t=>{e(t.detail)};return window.addEventListener(i,n),()=>window.removeEventListener(i,n)},S=()=>"10000000-1000-4000-8000-100000000000".replace(/[018]/g,i=>(+i^crypto.getRandomValues(new Uint8Array(1))[0]&15>>+i/4).toString(16));class E{constructor(e){s(this,"website");this.website=e}setCookie(e,n,t=30,o=0,a=0){console.log(e,t,o,a);const r=((t*24+o)*60+a)*60*1e3,c=new Date(Date.now()+r);document.cookie=`${e}=${n}; expires=${c.toUTCString()}; path=/`}getCookie(e){const n=e+"=",t=document.cookie.split(";");for(let o of t)if(o=o.trim(),o.indexOf(n)===0)return o.substring(n.length);return null}hasCookie(e){return this.getCookie(e)!==null}getConsentId(){let e=this.getCookie("CC_p_consent_id");return e||(e=S(),this.setCookie("CC_p_consent_id",e),e)}getAcceptedCookies(){const e=this.getCookie("CC_p_accepted_cookies");return e?JSON.parse(e):[]}setAcceptedCookies(e){console.log("Setting the cookies that are accepted"),console.log(e),this.setCookie("CC_p_accepted_cookies",JSON.stringify(e))}setVersion(e){this.setCookie("cc_version",e,0,0,15)}getVersion(){return parseInt(this.getCookie("cc_version"))}}const u=new E("website");class d{constructor(e,n,t,o){s(this,"translations");s(this,"banner");s(this,"cookies");s(this,"consentId");this.translations=e,this.banner=n,this.cookies=t,this.consentId=o}}class _ extends d{renderBorder(e){return e?`border: ${this.banner.design.consent.border} solid ${e};`:""}getButtonStyling(){let e="";const n=this.banner.design.consent.buttons;return Object.keys(n).forEach(t=>{const o=n[t];e+=`
        #${t} {
        background-color: ${o.bg};
          color: ${o.color};
          ${this.renderBorder(o.border)}
        }      
      `}),e}render(){return`
    ${this.getButtonStyling()}        

/* Reset and base styles */
#consent-banner,
#consent-banner * {
  box-sizing: border-box;
}

/* Base banner styles */
#consent-banner {
  font-family: Arial, Helvetica, sans-serif;
}

#consent-banner .tab-contents .text-left {
  text-align: left;
}

#consent-banner .tab-contents .tab-content .main-content {
  text-align: left;
}

#consent-banner #logo {
  border-radius: 0;
  width: auto;
  max-height: 20px;
}

#consent-banner.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(235, 226, 226, 0.4);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
}

#consent-banner .container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  width: 100%;
}

#consent-banner .b {
  background-color: #fff;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  height: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* Header styles */
#consent-banner .banner-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

#consent-banner .company-logo-container {
  max-width: 150px;
  display: flex;
  align-items: center;
}

#consent-banner .company-logo-container #company-logo {
  max-width: 100%;
  border-radius: 0;
  vertical-align: middle;
}

#consent-banner #close-button {
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Tab navigation */
#consent-banner .tab-navigation {
  border-bottom: 1px solid #e5e7eb;
}

#consent-banner .tab-navigation nav {
  display: flex;
}

.font-bold {
  font-weight: bold;
}

#consent-banner .tab-button {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: bold;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  align-content: center;
}

/* Tab content */
.tab-contents {
  flex: 1;
  overflow-y: auto;
}

#consent-banner .tab-content {
  display: none;
}

#consent-banner .tab-content.active {
  display: block;
  max-height: 50vh;
  overflow-y: auto;
  width: 100%;
}

/* Accordion styles */
#consent-banner .accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

#consent-banner .accordion-header {
  width: 100%;
  background-color: #f9fafb;
  padding: 12px 16px;
  border: none;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

/*// @todo*/
#consent-banner .accordion-content {
  //max-height: 0;
  overflow: auto;
  transition: max-height 0.3s ease-out;
}

/*// @todo*/
/*//#consent-banner .accordion-content.open {*/
/*//  max-height: 1000px;*/
/*//  transition: max-height 0.5s ease-in;*/
/*//}*/

/* Toggle switches */
#consent-banner .toggle,
#consent-banner .toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

#consent-banner .toggle-switch {
  cursor: not-allowed;
}

#consent-banner .toggle input[type='checkbox'],
#consent-banner .toggle-switch input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

#consent-banner .toggle .track,
#consent-banner .toggle-switch .track {
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  transition: background-color 0.3s;
}

#consent-banner .toggle .thumb,
#consent-banner .toggle-switch .thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border-radius: 9999px;
  transition: transform 0.3s;
}

#consent-banner .toggle input:checked + .track + .thumb,
#consent-banner .toggle-switch input:checked + .track + .thumb {
  transform: translateX(20px);
}

#consent-banner .not-toggleable.toggle-switch .track + .thumb {
  transform: translateX(20px) !important;
}

#consent-banner .not-toggleable {
  opacity: 0.5;
}

#consent-banner details[open] .icon,
#consent-banner .accordion-item.open .accordion-icon {
  transform: rotate(180deg);
}

/* Buttons */
#consent-banner .button {
  width: 33.3333%;
  max-width: 33.3333%;
  text-align: center;
  flex: 1;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s ease;
  border-style: solid;
  align-content: center;
}

#consent-banner .button:hover {
  opacity: 0.8;
}

/* Footer */
#consent-banner .banner-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

#consent-banner .footer-content {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

/* Utility classes */
#consent-banner .fs {
  font-size: 14px !important;
}

#consent-banner .flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#consent-banner .icon {
  display: block;
  width: 16px;
  height: 16px;
  color: #9ca3af;
  transition: all 0.3s ease;
}

#consent-banner .flex-between {
  display: flex;
  justify-content: space-between;
}

#consent-banner .text-bold-flex {
  font-weight: bold;
  display: flex;
  align-items: center;
}

#consent-banner .badge {
  margin-left: 5px;
}

#consent-banner .full-width {
  width: 100%;
}

#consent-banner .responsive-padding {
  padding: 16px;
}

#consent-banner .vertical-spacing > * + * {
  margin-top: 16px;
}

#consent-banner .parent > * + * {
  margin-top: 12px;
}

#consent-banner .mt-4 {
  margin-top: 16px;
}

#consent-banner .my-2 {
  margin-top: 8px;
  margin-bottom: 8px;
}

#consent-banner .pointer {
  cursor: pointer;
}

#consent-banner .content-box {
  padding: 16px;
  background-color: #fff;
}

#consent-banner .box-section {
  margin-top: 12px;
}

#consent-banner .box-between {
  display: flex;
  justify-content: space-between;
}

#consent-banner .box-section > * + * {
  margin-top: 8px;
}

#consent-banner .box-container {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

#consent-banner .box-card {
  border: 1px solid #f3f4f6;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background-color: #f9fafb;
}

#consent-banner .clickable-block {
  cursor: pointer;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
}

#consent-banner .consent-id-container {
  margin-top: 20px;
  font-size: 12px;
  text-align: left;
  margin-bottom: 10px;
}

#consent-banner .consent-id-label {
  font-weight: 700;
}

#consent-banner .flex-responsive {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

/* Mobile styles */
@media (max-width: 768px) {
  #consent-banner .container {
    min-height: 100vh;
    min-height: 100dvh;
    padding: 16px;
  }

  #consent-banner .b {
    width: 100%;
    max-width: 100%;
    margin: 0;
    max-height: 90vh;
    max-height: 90dvh;
  }

  #consent-banner .footer-content {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  #consent-banner .button {
    width: 100%;
    max-width: none;
    margin-bottom: 0;
  }

  #consent-banner .tab-content.active {
    max-height: 300px;
  }
}

/* Mobile landscape */
@media (max-width: 768px) and (orientation: landscape) {
  #consent-banner .footer-content {
    flex-direction: row !important;
    align-items: center;
    gap: 8px;
  }

  #consent-banner .button {
    width: 33.3333%;
    max-width: 33.3333%;
    flex: 1;
    font-size: 12px;
    padding: 10px 16px;
  }

  #consent-banner .b {
    max-height: 85vh;
    max-height: 85dvh;
  }

  #consent-banner .tab-content.active {
    max-height: 35vh;
  }

  #consent-banner .banner-header,
  #consent-banner .banner-footer {
    padding: 12px 16px;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  #consent-banner .container {
    padding: 8px;
  }

  #consent-banner .b {
    border-radius: 8px;
    max-height: 95vh;
    max-height: 95dvh;
  }

  #consent-banner .banner-header,
  #consent-banner .responsive-padding {
    padding: 12px;
  }
}

/* Desktop styles */
@media (min-width: 640px) {
  #consent-banner .banner-header,
  #consent-banner .banner-footer,
  #consent-banner .responsive-padding {
    padding: 24px;
  }

  #consent-banner .flex-responsive {
    flex-direction: row;
  }
}

/* Medium landscape devices */
@media (max-width: 956px) and (min-width: 393px) and (orientation: landscape) {
  #consent-banner .button {
    font-size: 13px;
    padding: 12px 20px;
  }

  #consent-banner .b {
    max-height: 90vh;
    max-height: 90dvh;
  }
}

.banner-footer {
  box-shadow: 0px -20px 20px 8px white !important;
  -webkit-box-shadow: 0px -20px 20px 8px white !important;
  -moz-box-shadow: 0px -20px 20px 8px white !important;
  position: relative;
  z-index: 10000;
}

#consent-banner #updated-at {
  font-weight: bold;
  color: black;
  text-decoration: none;
}

.box-container {
  border-bottom: 1px solid #e5e7eb;
}

.box-between p {
  padding: 0;
  margin: 0;
}

/* Display customize only if tab is not tab2 */
[data-tab-opened]:not([data-tab-opened='tab2']) #customizeSelection,
[data-tab-opened][data-tab-opened='tab2'] #allowSelection {
  display: block;
}

[data-tab-opened][data-tab-opened='tab2'] #customizeSelection,
.has-customize-selection #allowSelection {
  display: none;
}

/* New styles */
.hidden {
  display: none !important;
}

.accordion-icon-toggle {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

#consent-banner .accordion-icon {
  margin-right: 16px;
  width: 100%;
  height: 100%;
  color: #6b7280;
  transition: transform 0.2s;
}


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

.not-toggleable.toggle-switch .track + .thumb {
  transform: translateX(20px) !important;
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
`}}class I extends d{render(){return`
        <div class="flex-between-center">
            <div>
                ${this.getWebsiteLogo()}
            </div>
            <div class="company-logo-container">
                ${this.getPoweredBy(this.banner.branding.url,this.banner.branding.logo)}
                    <div id="close-button" tabindex="0">
                        ${this.getCloseIcon()}
                    </div>
            </div>
        </div>
    `}getWebsiteLogo(){return`<img id="logo" src="${this.banner.design.general.company_logo}" alt="Website logo" />`}getPoweredBy(e,n){return`
    <a
        class="full-width"
        href="${e}"
        rel="noopener nofollow"
        target="_blank"
        aria-label="${e} - opens in a new window">
            <img id="company-logo" src="${n}">
    </a>
`}getCloseIcon(){return`<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <line x1="4" y1="4" x2="16" y2="16" stroke="black" stroke-width="2"/>
              <line x1="16" y1="4" x2="4" y2="16" stroke="black" stroke-width="2"/>
          </svg>`}}class B extends d{render(){return`
        <nav>
            ${this.getNavigationButton(this.translations.tab_consent,"tab1",!0)}
            ${this.getNavigationButton(this.translations.tab_details,"tab2")}
            ${this.getNavigationButton(this.translations.tab_about,"tab3")}
        </nav>
    `}getNavigationButton(e,n,t=!1){return`<div class="tab-button font ${t?"active":""}" data-tab="${n}" tabindex="0" role="tab">${e}</div>`}}class D extends d{render(){return`
      <div class="responsive-padding">
    <div class="vertical-spacing">
        <strong class="text-left">${this.translations.title}</strong>
        <p class="main-content">
            ${this.translations.explanation}
        </p>
    </div>
</div>
      `}}const f=i=>`
    <svg
    class="${i}"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
>
    <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
    /></svg
>

    `,A=(i,e=!0,n=!0)=>{const t=`<input type="checkbox" hidden ${n?"checked":""} value="${i}" class="consent-type-value" id="toggle-${i}" />`;return`
    <div class="${e?"toggle toggleable":"toggle-switch not-toggleable"}" ${e?'tabindex="0"':""} role="button">
            ${e?t:""}
        <div class="track"></div>
        <div class="thumb"></div>
    </div>

    `};class T extends d{showToggle(e){return e!=="unclassified"}getCard(e,n){return`
<div>
<div class="clickable-block">
 <div class="accordion-item">
      <div class="accordion-header">
          <div class="full-width">
              <div class="flex-between">
                    <span class="text-bold-flex pointer open-cookie-controllers">
                      <span class="accordion-icon-toggle" tabindex="0">
                              ${f("accordion-icon")}
                    </span>
                        <span>${n.title}</span>
                      <span class="badge">(${n.total_cookies})</span>
                    </span>
  
                  ${this.showToggle(e)?A(e,e!=="functional"):""}
  
              </div>
              <p class="mt-4">
                  ${n.description}
              </p>
          </div>
      </div>
    
      <div class="accordion-content" hidden>
          <div class="content-box">
              <!-- Sub-accordion for specific cookies -->
  
              <div class="box-section">
                  ${this.getAccordionContent(e,n.controllers)}
  
              </div>
  
              <!-- Sub-accordion for specific cookies ends-->
          </div>
      </div>
    </div>
</div>
</div>
   
    `}getAccordionContent(e,n){const t=Object.keys(n);let o="";return t.length?t.forEach(a=>{o+=this.getCookieList(n[a])}):o+=this.getNoCookiesFound(),o}getCookieList(e){const n=Object.keys(e.cookies).map(t=>this.getCookieInformation(e.cookies[t]));return`
          <details class="box-card">
            <summary class="clickable-block">
                <div class="flex-between-center">
                <span class="text-bold-flex">
                  ${e.controller}
                  <span class="badge">(${Object.keys(e.cookies).length})</span>
                </span>
                    ${f("icon")}
                </div>
                ${e.privacy_policy?this.getPrivacyPolicy(e.privacy_policy):""}
            </summary>

${n.join("")}
        
    </details>
    `}getCookieInformation(e){return`
     <div class="box-container">
          <strong class="p-3">${e.cookie_key}</strong>
          <p class="p-3">
          ${this.getCookieDescription(e)}
          </p>
          <div class="box-between">
              <p>
                  <strong>${this.translations.maximum_cookie_saving_period_label}</strong> ${e.retention} 
              </p>
              <p><strong>Type:</strong> ${this.getCookieType(e)}</p>
          </div>
      </div>
    `}getCookieDescription(e){return e.description?e.description:this.translations.no_cookie_description_available}getPrivacyPolicy(e){return`
        <a class="privacy-policy-link"
       href="${e}"
       target="_blank"
       rel="noopener noreferrer"
    >${this.translations.privacy_policy_link_text}</a>
    `}getNoCookiesFound(){return`<div class="box-card">
        <div class="clickable-block">
            <div class="flex-between-center">
                <span class="text-bold-flex">
                    ${this.translations.no_cookies_of_this_type_used}
                </span>
            </div>
        </div>
    </div>`}render(){let e='<div class="responsive-padding">';return Object.keys(this.cookies).forEach(n=>{e+=this.getCard(n,this.cookies[n])}),e+="</div>"}getCookieType(e){return e.type?e.type:this.translations.unknown}}class L extends d{render(){return`
    <div class="responsive-padding">
      <div class="vertical-spacing">
          <p>
          ${this.translations.about_cookies_information}
          </p>
      </div>
      <div class="consent-id-container">
          <span class="consent-id-label">Consent ID:</span> <span id="consent-id">${this.consentId}</span>
      </div>
  </div>
    `}}class N extends d{render(){return`
        ${this.renderTab("tab1",new D(this.translations,this.banner,this.cookies,this.consentId),!0)}
        ${this.renderTab("tab2",new T(this.translations,this.banner,this.cookies,this.consentId))}
        ${this.renderTab("tab3",new L(this.translations,this.banner,this.cookies,this.consentId))}
        `}renderTab(e,n,t=!1){return`<div class="tab-content ${t?"active":""}" id="${e}">
            ${n.render()}
        </div>`}}const p=(i,e)=>`<button class="button" id="${e}" tabindex="0">${i}</button>`;class q extends d{render(){return`
    <div class="flex-responsive">
        <div class="footer-content">
            ${p(this.translations.btn_reject_all,"rejectAll")}
            ${p(this.translations.btn_customize_selection,"customizeSelection")}
            ${p(this.translations.btn_allow_selection,"allowSelection")}
            ${p(this.translations.btn_accept_all,"acceptAll")}
        </div>
    </div>
    `}}class P extends d{render(){return`
    
    <div class="modal-backdrop ${this.hasCustomizeSelection()}" id="consent-banner" data-tab-opened="tab1"
    role="dialog" aria-modal="true" aria-labelledby="cc-banner-heading"
     tabindex="-1"
     >
    <div class="container">
        <!-- Banner Container -->
        <div class="b">
            <!-- Banner Header -->
            <div class="banner-header">
                ${new I(this.translations,this.banner,this.cookies,this.consentId).render()}
            </div>

            <!-- Tabs Navigation -->
            <div class="tab-navigation">
                ${new B(this.translations,this.banner,this.cookies,this.consentId).render()}
            </div>

            <!-- Tab Contents -->
            <div class="tab-contents">
                ${new N(this.translations,this.banner,this.cookies,this.consentId).render()}
            </div>

            <!-- Banner Footer -->
            <div class="banner-footer">
                ${new q(this.translations,this.banner,this.cookies,this.consentId).render()}
            </div>
        </div>
    </div>
</div>

    `}hasCustomizeSelection(){return this.banner.functional.customizeSelectionButton?"has-customize-selection":""}}class j{constructor(e,n,t,o,a){s(this,"translations");s(this,"banner");s(this,"cookies");s(this,"events");s(this,"consentId");this.translations=e,this.banner=n,this.cookies=t,this.events=o,this.consentId=a,this.init()}renderBanner(){const e=document.getElementById("consent-banner");if(e){e.classList.remove("hidden");return}document.body.insertAdjacentHTML("beforeend",this.getBannerHtml());const n=document.createElement("style");n.textContent=this.getBannerCss(),document.head.appendChild(n),this.registerBannerEvents()}renderCookieIcon(){document.getElementById("cc-icon")||(document.body.insertAdjacentHTML("beforeend",this.getCookieIconHtml()),this.registerCookieIconEvents())}init(){window.ccListen("openBanner",()=>{this.renderBanner()}),window.ccListen("renderCookieIcon",()=>{this.renderCookieIcon()})}}class z extends j{getBannerHtml(){return new P(this.translations,this.banner,this.cookies,this.consentId).render()}registerCookieIconEvents(){this.events.registerCookieIconEvents()}registerBannerEvents(){this.events.registerBannerEvents()}getBannerCss(){return new _(this.translations,this.banner,this.cookies,this.consentId).render()}getCookieIconHtml(){return'<div id="cc-icon" style="position: fixed; bottom: 10px; left: 10px; cursor: pointer; z-index: 214748364"><img src="'+"https://assets.cookieconfirm.com/images/icons/icon-orange.png"+'" style="width:25px; height:25px" width="25" height="25" alt="Cookie Icon"></div>'}}class O{constructor(e,n){s(this,"consentId");s(this,"domain");this.consentId=e,this.domain=n}registerBannerEvents(){this.registerConsentButtons(),this.registerModalFocus(),this.registerTabButtonClicks(),this.registerTabButtonEnter(),this.registerModalTabFocus(),this.firstAccordionKeyboardEvents(),this.registerSwitches(),this.registerCookieIconTabOpen(),this.events()}registerConsentButtons(){this.onConsentClick("rejectAll",()=>{b("consentGiven",{method:"rejectAll",consent:["functional"],consentId:this.consentId,domain:this.domain})}),this.onConsentClick("allowSelection",()=>{const e=["functional"];document.querySelectorAll(".consent-type-value:checked").forEach(n=>{e.push(n.value)}),b("consentGiven",{method:"rejectAll",consent:e,consentId:this.consentId,domain:this.domain})}),this.onConsentClick("customizeSelection",()=>{this.openTab("tab2")}),this.onConsentClick("acceptAll",()=>{b("consentGiven",{method:"acceptAll",consent:["functional","marketing","analytics"],consentId:this.consentId,domain:this.domain})}),this.onConsentClick("close-button",()=>{b("consentGiven",{method:"closeButton",consent:["functional"],consentId:this.consentId,domain:this.domain})})}registerModalFocus(){var e;(e=document.getElementById("consent-banner"))==null||e.focus()}openTab(e){document.getElementById("consent-banner").setAttribute("data-tab-opened",e),document.querySelectorAll(".tab-button").forEach(n=>{n.classList.remove("active")}),document.querySelectorAll(".tab-content").forEach(n=>{n.classList.remove("active"),n.removeAttribute("hidden")}),document.querySelector('[data-tab="'+e+'"]').classList.add("active"),document.querySelector("#"+e).classList.add("active")}onConsentClick(e,n){document.getElementById(e).addEventListener("click",()=>{console.log("clicked on "+e),n&&n()})}registerTabButtonClicks(){document.querySelectorAll(".tab-button").forEach(e=>{e.addEventListener("click",()=>{const n=e.attributes.getNamedItem("data-tab").value;this.openTab(n)})})}registerTabButtonEnter(){document.querySelectorAll('.tab-navigation > nav > div[role="tab"]').forEach(n=>{n.addEventListener("keydown",t=>{t.key==="Enter"&&n.click()})})}registerModalTabFocus(){const e=document.querySelector("#consent-banner");e.addEventListener("keydown",n=>{if(n.key!=="Tab")return;const t=e.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');if(t.length===0)return;const o=t[0],a=t[t.length-1];n.shiftKey?document.activeElement===o&&(n.preventDefault(),a.focus()):document.activeElement===a&&(n.preventDefault(),o.focus())})}firstAccordionKeyboardEvents(){document.querySelectorAll(".accordion-icon-toggle").forEach(t=>{t.addEventListener("keydown",o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),this.toggleFirstAccordion(t))})}),document.querySelectorAll(".accordion-header").forEach(t=>{t.addEventListener("click",o=>{const a=o.target;a.closest(".thumb")||a.closest(".track")||this.toggleFirstAccordion(t)})})}toggleFirstAccordion(e){const n=e.closest(".accordion-item");n.querySelector(".accordion-content").toggleAttribute("hidden"),n.classList.toggle("open")}events(){window.ccListen("consentGiven",()=>{document.getElementById("consent-banner").classList.add("hidden"),window.ccDispatch("renderCookieIcon",{})}),window.ccListen("consentIdSet",e=>{document.getElementById("consent-id").innerText=e.id})}registerSwitches(){document.querySelectorAll(".toggle").forEach(e=>{e.addEventListener("click",()=>{this.handleSwitch(e)}),e.addEventListener("keydown",n=>{n.key==="Enter"&&(n.preventDefault(),this.handleSwitch(e))})})}handleSwitch(e){const n=e.querySelector('input[type="checkbox"]');n&&(n.checked=!n.checked)}registerCookieIconEvents(){document.getElementById("cc-icon").addEventListener("click",()=>{window.ccDispatch("openBanner",{tab:"tab2"})})}registerCookieIconTabOpen(){window.ccListen("openBanner",e=>{e.tab&&this.openTab(e.tab)})}}window.ccListen=$;window.ccDispatch=b;window.ccPlugins=[];window.ccDomain=window.location.hostname.replace(/^https?:\/\/(www\.)?/,"https://").replace(/^www\./,"");class g{onConsent(e){this.isDefined()&&window.ccListen("enableConsent",e)}}class G extends g{register(){this.onConsent(e=>{e.consent.includes("analytics")?(window._paq.push(["rememberCookieConsentGiven"]),window._paq.push(["setConsentGiven"])):(window._paq.push(["forgetCookieConsentGiven"]),window._paq.push(["deleteCookies"]))})}isDefined(){return typeof window._paq<"u"}}const R=new G;class V extends g{register(){this.onConsent(e=>{e.includes("analytics")&&window.clarity("consent")})}isDefined(){return typeof window.clarity=="function"}}const F=new V;class M extends g{isDefined(){return!0}register(){window.ccListen("consentGiven",e=>{this.storeConsent(e),window.ccDispatch("enableConsent",e.consent)})}storeConsent(e){fetch("https://b3sxcv3tyfq76r3kyab5gue2am0sgkxd.lambda-url.us-east-1.on.aws",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e.consentId,consentMethod:e.method,analytics:e.consent.includes("analytics"),marketing:e.consent.includes("marketing"),functional:!0,country:e.country,domain:e.domain})})}}const U=new M;class H extends g{constructor(){super(...arguments);s(this,"GRANT","grant");s(this,"REVOKE","revoke")}isDefined(){return typeof window.fbq=="function"}register(){this.isDefined()&&window.fbq("consent",this.REVOKE),this.onConsent(n=>{const t=n.consent.includes("marketing")?this.GRANT:this.REVOKE;window.fbq("consent",t)})}}const J=new H;class W extends g{register(){this.onConsent(e=>{this.setAllConsentTypes(e)})}isDefined(){var e,n;return typeof((n=(e=window.Shopify)==null?void 0:e.customerPrivacy)==null?void 0:n.setTrackingConsent)=="function"}setAllConsentTypes(e){var n,t;try{const o=r=>e.includes(r),a={analytics:o("analytics"),marketing:o("marketing"),preferences:o("functional"),sale_of_data:o("marketing")};(t=(n=window.Shopify)==null?void 0:n.loadFeatures)==null||t.call(n,[{name:"consent-tracking-api",version:"0.1"}],function(r){var c,l,h;if(r){console.error("Shopify loadFeatures error:",r);return}(h=(l=(c=window.Shopify)==null?void 0:c.customerPrivacy)==null?void 0:l.setTrackingConsent)==null||h.call(l,a)})}catch(o){console.log("A error occured while setting shopify consent: ",o)}}}const K=new W;class X extends g{register(){this.initDefault(),this.onConsent(e=>{e.includes("marketing")&&window.uetq.push("consent","update",{ad_storage:"granted"})})}isDefined(){return!0}initDefault(){window.uetq=window.uetq||[],window.uetq.push("consent","default",{ad_storage:"denied"})}}const Y=new X;class Q extends g{constructor(){super(...arguments);s(this,"ALLOW","allow");s(this,"DENY","deny")}register(){this.initDefault(),this.onConsent(n=>{const t=n,o=a=>t.includes(a)?this.ALLOW:this.DENY;this.setConsent("functional",o("functional")),this.setConsent("preferences",o("functional")),this.setConsent("analytics-anonymous",o("marketing")),this.setConsent("analytics",o("marketing")),this.setConsent("marketing",o("marketing"))})}isDefined(){return typeof window.wp_set_consent=="function"}setConsent(n,t){var o;(o=window.wp_set_consent)==null||o.call(window,n,t)}initDefault(){window.wp_consent_type="optin"}}const Z=new Q;class ee extends g{constructor(){super(...arguments);s(this,"GRANTED","granted");s(this,"DENIED","denied")}register(){window.cookieConfirmGtmInit||(window.dataLayer=window.dataLayer||[],this.gtag("consent","default",this.getData(!1,!1)),this.onConsent(n=>{const t=this.getData(n.includes("analytics"),n.includes("marketing"));this.gtag("consent","update",t)}))}isDefined(){return typeof window.dataLayer=="function"}gtag(n,t,o){return window.dataLayer.push([n,t,o]),this}getData(n,t,o=null){const a={ad_storage:t?this.GRANTED:this.DENIED,ad_user_data:t?this.GRANTED:this.DENIED,ad_personalization:t?this.GRANTED:this.DENIED,analytics_storage:n?this.GRANTED:this.DENIED,functionality_storage:this.GRANTED,personalization_storage:t?this.GRANTED:this.DENIED,security_storage:this.GRANTED};return o&&(a.wait_for_update=o),a}}const ne=new ee;class te{constructor(e){s(this,"plugins");this.plugins=e}register(){this.plugins.forEach(e=>{e.register()}),window.ccPlugins.forEach(e=>{e.register()})}}const oe=new te([U,ne,R,F,J,K,Y,Z]);(()=>{const i=(e,n)=>{const t=new v(C,m,u);t.getInitData().then(async o=>{const a=n.getConsentId();window.ccDispatch("consentIdSet",{id:a});const r=await t.getBanner(o.country,o.banner.availableLanguages,o.banner.fallbackLanguage,o.banner.geoRules),c=new e(r.translations,r.banner,r.cookies,new O("test","sample.com"),a),l=n.getAcceptedCookies();l.length?(c.renderCookieIcon(),b("enableConsent",l)):c.renderBanner(),window.ccListen("consentGiven",h=>{n.setAcceptedCookies(h.consent)})})};document.addEventListener("DOMContentLoaded",()=>{oe.register(),i(z,u)})})();
