import { ConsentTypes, CookieKeysType } from "@/js/app/types";
import { generateUuid } from "@/js/app/helpers";

class CookieStorageService {
  website: string;

  constructor(website: string) {
    this.website = website;
  }

  setCookie(name: CookieKeysType, value: string | number, days: number = 30, hours: number = 0, minutes: number = 0) {
    const expiresMs = ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
    const date = new Date(Date.now() + expiresMs);

    // document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; domain=${this.website}`
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  }

  getCookie(name: CookieKeysType): string | number | null {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
    }
    return null;
  }

  hasCookie(name: CookieKeysType): boolean {
    return this.getCookie(name) !== null;
  }

  getConsentId(): string {
    let id = this.getCookie("CC_p_consent_id") as string;

    if (id) {
      return id;
    }

    id = generateUuid();
    this.setCookie("CC_p_consent_id", id);
    return id;
  }

  getAcceptedCookies(): ConsentTypes[] {
    const cookies = this.getCookie("CC_p_accepted_cookies") as string;

    return cookies ? JSON.parse(cookies) : [];
  }

  setAcceptedCookies(cookies: ConsentTypes[]): void {
    console.log("Setting the cookies that are accepted");

    this.setCookie("CC_p_accepted_cookies", JSON.stringify(cookies));
  }

  setVersion(version: number) {
    this.setCookie("cc_version", version, 0, 0, 15);
  }

  getVersion(): number {
    return parseInt(this.getCookie("cc_version") as string);
  }
}

export default new CookieStorageService("website");
