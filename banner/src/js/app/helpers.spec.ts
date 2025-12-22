import { getGeoCountryUrl, getLocale } from '@/js/app/helpers'

describe('Helpers - getBannerUrl', () => {
  it('returns the correct country part', () => {
    expect(getGeoCountryUrl('nl', ['en', 'de'])).toBeNull()
    expect(getGeoCountryUrl('nl', ['en', 'de', 'nl'])).toBe('nl')
    expect(getGeoCountryUrl('nl', [])).toBeNull()
  })
})

describe('Helpers - getLocale', () => {
  it('returns correct locale', () => {
    expect(getLocale('nl', ['en', 'de'], 'en')).toBe('en')
    expect(getLocale('nl', ['en', 'de'], 'de')).toBe('de')
    expect(getLocale('nl', ['nl', 'en'], 'en')).toBe('nl')
    expect(getLocale('nl', ['nl'])).toBe('nl')
  })
})
