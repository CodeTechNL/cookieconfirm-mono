import { Construct } from "constructs";
import {
    ComputedEnvVars,
    EnvironmentVars,
    loadEnvironment,
    STATIC_ENV,
    SsmEnvVars,
    AppendableVars,
    AppendableEnvVars,
} from "../../enums/StaticEnvironmentVariables";
import {Environment} from "aws-cdk-lib";
import {extractCapitals} from "../../helpers";

interface EnvironmentResourceProps {
    idPrefix: string;
    resourcePrefix: string;
    version?: string;
    env: Environment
}

export class EnvironmentResource extends Construct {
    private readonly environmentVars: EnvironmentVars;

    constructor(scope: Construct, id: string, props: EnvironmentResourceProps) {
        super(scope, id);

        const { idPrefix, version, resourcePrefix, env } = props;

        // 1) SSM-waarden ophalen
        const envFromSsm: SsmEnvVars = loadEnvironment(this, idPrefix);

        const appUrl = `https://${envFromSsm.APP_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}`;

        const SCANNER_QUEUE_NAME = `${resourcePrefix}-cookie-scanner-queue`; // Queue name for the scanner requests

        const bannerDomain = `${envFromSsm.BANNER_SUBDOMAIN}.${envFromSsm.BANNER_DOMAIN}`; // banner.cookieconfirm.tech

        // 2) Computed values bouwen
        const computed: ComputedEnvVars = {
            S3_BANNER_ASSETS_BUCKET: `cdk-${resourcePrefix}-banner-assets-bucket`,
            S3_BANNER_COMPONENTS_BUCKET: `cdk-${resourcePrefix}-banner-components-bucket`,
            SCANNER_EVENT_BRIDGE_CONNECTION_NAME: `${resourcePrefix}-scanner-connection`,
            SCANNER_QUEUE_NAME,
            FIREHOSE_CONSENT_LOGS_STREAM: `${resourcePrefix}-consent-log-stream`,
            ATHENA_CONSENT_LOGS_WORK_GROUP: `${resourcePrefix}_consent_logs_workgroup`,
            ATHENA_CONSENT_LOGS_DATABASE: `${resourcePrefix}_consent_logs`,
            ATHENA_CONSENT_LOGS_TABLE: `${resourcePrefix}_raw_logs`,
            ATHENA_CONSENT_LOGS_STORAGE_PATH_S3: `${resourcePrefix}-consent-logs-raw`,
            REDIS_PREFIX: extractCapitals(idPrefix),


            BANNER_DOMAIN: bannerDomain,
            FULL_BANNER_DOMAIN: `https://${bannerDomain}`,
            OLD_ASSETS_DOMAIN: `assets.${envFromSsm.APP_MAIN_DOMAIN}`, // assets.cookieconfirm.tech
            APP_URL: `https://${envFromSsm.APP_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}`, // Platform URL https://platform.cookieconfirm.tech/
            ASSET_URL: `https://${envFromSsm.APP_PLATFORM_ASSETS_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}/${version}`, // cdn.cookieconfirm.tech/{HASH}/*
            PLATFORM_ASSETS_URL: `${envFromSsm.APP_PLATFORM_ASSETS_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}`,
            AWS_LAMBDA_COOKIE_SCANNER_URL: `https://sqs.${env.region}.amazonaws.com/${env.account}/${SCANNER_QUEUE_NAME}`,

            AWS_DEFAULT_REGION: env.region!,
            ATHENA_REGION: env.region!,

            // Webhook endpoints
            WEBHOOKS_COOKIE_SCANNER_RESULTS_ENDPOINT: `${appUrl}/webhooks/lambda/cookie-scanner-result`,
        };

        if(version){
            computed.APP_VERSION_HASH = version;
        }

        // 3) Alles samenvoegen: static ? ssm ? computed
        this.environmentVars = {
            ...STATIC_ENV,
            ...envFromSsm,
            ...computed,
        };
    }

    public getEnvironmentVars(): EnvironmentVars {
        return this.environmentVars;
    }

    public append(key: AppendableVars, value: string) {
        (this.environmentVars as AppendableEnvVars)[key] = value;

        return this;
    }
}
