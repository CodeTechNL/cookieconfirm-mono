export interface ConsentLogInterface{
    uuid:string
    ipAddress: string
    country: string
    pageUrl: string
    userAgent: string
    website: string
    updatedAt: string
    consentMethod: string
    acceptedMarketing: boolean
    acceptedAnalytic: boolean
    acceptedFunctional: boolean
}