import { ClassificationTypes } from '@/js/app/types'

export interface CookieDataInterface {
  cookie_key: string
  type?: string
  retention: string
  description: string | null
}

export interface CookieControllerDataInterface {
  controller: string
  privacy_policy: string | null
  cookies: Record<string, CookieDataInterface>
}

export interface CookieCategoryDataInterface {
  controllers: Record<string, CookieControllerDataInterface>
  description: string
  title: string
  total_cookies: number
}

export type CookieListType = Record<ClassificationTypes, CookieCategoryDataInterface>
