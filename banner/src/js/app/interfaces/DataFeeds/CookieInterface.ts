import { ClassificationTypes } from '@/js/app/types'

export type CookieType = 'http_cookie' | 'html_local_storage' | 'pixel_tracker' | 'indexed_db' | 'unknown' | 'session_storage'

export interface RetentionPeriodInterface {
  minutes: number
  hours: number
  days: number
  months: number
  years: number
}

export interface CookieInterface {
  retention: RetentionPeriodInterface
  description: string | null
  type: CookieType
}

export interface CookiePlatformInterface {
  platform: string
  privacy_policy: string | null
  total_cookies: number
  cookies: Record<string, CookieInterface>
}

export type CookieListType = Record<ClassificationTypes, CookiePlatformInterface[]>
