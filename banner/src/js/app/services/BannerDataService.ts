import CdnService from "@/js/app/services/CdnService";
import localStorageService from "@/js/app/services/LocalStorageService";
import CookieStorageService from "@/js/app/services/CookieStorageService";
import LocalStorageService from "@/js/app/services/LocalStorageService";
import { StylingInterface } from "@/js/app/interfaces/StylingInterface";

export class BannerDataService {
    cdn: typeof CdnService;
    localStorage: typeof LocalStorageService;
    cookieStorage: typeof CookieStorageService;
    constructor(cdnService: typeof CdnService, localStorage: typeof localStorageService, cookieStorage: typeof CookieStorageService) {
        this.cdn = cdnService;
        this.localStorage = localStorage;
        this.cookieStorage = cookieStorage;
    }

    async getInitData(): Promise<{
        banner: InitResponseInterface;
        country: string | null;
    }> {
        return new Promise((resolve) => {
            let data;
            const country = this.localStorage.getCountry();

            if (this.cookieStorage.getVersion()) {
                data = this.localStorage.getInitData();

                if (data) {
                    return resolve({
                        banner: data,
                        country: country ? country.toLowerCase() : null,
                    });
                }
            }

            resolve(this.getNewInitData(!!country));
        });
    }

    async getNewInitData(withLocation: boolean) {
        return await this.cdn.getInitFile(withLocation).then((data) => {
            this.localStorage.setInit(data.banner as unknown as Promise<InitResponseInterface>);
            this.localStorage.setCountry(data.country);
            this.cookieStorage.setVersion(data.banner.version);

            return {
                banner: data.banner,
                country: data.country,
            };
        });
    }

    getBanner(country: string | null, availableLanguages: string[], fallbackLanguage: string | null, geoRules: string[]) {
        const geoCountry = this.getCountryCode(country, geoRules);
        const bannerLanguage = this.getBannerLanguage(this.getBrowserLanguage(), fallbackLanguage, availableLanguages);

        const banner = this.localStorage.getBanner();

        console.log(banner.version, this.cookieStorage.getVersion());
        if (banner.version !== this.cookieStorage.getVersion()) {
            console.log("Getting full new version");
            const data = this.cdn.getBanner(geoCountry, bannerLanguage);

            data.then((response: StylingInterface) => {
                this.localStorage.setBanner(response);

                return response;
            });

            return data;
        }

        console.log("Skip to here");

        return banner;
    }

    getCountryCode(country: string | null, availableCountries: string[]): string | null {
        if (country) {
            if (availableCountries.includes(country)) {
                return country;
            }
        }
        return null;
    }

    getBrowserLanguage(): string {
        return navigator.language.split("-")[0].toUpperCase();
    }

    getBannerLanguage(browserLanguage: string, fallbackLanguage: string | null, availableLanguages: string[]): string {
        if (availableLanguages.includes(browserLanguage)) {
            return browserLanguage;
        }

        if (availableLanguages.length === 1) {
            return availableLanguages[0];
        }

        // fallback language is always defined if there are more then 2 availableLanguages
        return fallbackLanguage!;
    }
}

export default BannerDataService;
