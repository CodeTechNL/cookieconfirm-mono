interface InitResponseInterface {
  version: number;
  geoRules: string[];
  cookieDomain: string;
  availableLanguages: string[];
  fallbackLanguage: string | null;
  excludePaths: string[];
}
