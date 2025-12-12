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

interface EnvironmentResourceProps {
    idPrefix: string;
    resourcePrefix: string;
    version: string;
}

type EnvVars = EnvironmentVars;

export class EnvironmentResource extends Construct {
    private environmentVars: EnvVars;

    constructor(scope: Construct, id: string, props: EnvironmentResourceProps) {
        super(scope, id);

        const { idPrefix, version, resourcePrefix } = props;

        // 1) SSM-waarden ophalen
        const envFromSsm: SsmEnvVars = loadEnvironment(this, idPrefix);

        // 2) Computed values bouwen
        const computed: ComputedEnvVars = {
            S3_BANNER_ASSETS_BUCKET: `cdk-${resourcePrefix}-banner-assets-bucket`,
            S3_BANNER_COMPONENTS_BUCKET: `cdk-${resourcePrefix}-banner-components-bucket`,
            SCANNER_EVENT_BRIDGE_CONNECTION_NAME: `${resourcePrefix}-scanner-connection`,
            SCANNER_QUEUE_NAME: `${resourcePrefix}-cookie-scanner-queue`, // Queue name for the scanner requests
            APP_VERSION_HASH: version,
            FIREHOSE_CONSENT_LOGS_STREAM: `${resourcePrefix}-consent-log-stream`,
            ATHENA_CONSENT_LOGS_WORK_GROUP: `${resourcePrefix}_consent_logs_workgroup`,
            ATHENA_CONSENT_LOGS_DATABASE: `${resourcePrefix}_consent_logs`,
            ATHENA_CONSENT_LOGS_TABLE: `${resourcePrefix}_raw_logs`,
            ATHENA_CONSENT_LOGS_STORAGE_PATH_S3: `${resourcePrefix}-consent-logs-raw`,
            REDIS_PREFIX: idPrefix,

            BANNER_DOMAIN: `${envFromSsm.BANNER_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}`, // banner.cookieconfirm.tech
            OLD_ASSETS_DOMAIN: `assets.${envFromSsm.APP_MAIN_DOMAIN}`, // assets.cookieconfirm.tech
            APP_URL: `https://${envFromSsm.APP_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}`, // Platform URL https://platform.cookieconfirm.tech/
            ASSET_URL: `https://${envFromSsm.APP_PLATFORM_ASSETS_SUBDOMAIN}.${envFromSsm.APP_MAIN_DOMAIN}/${version}`, // cdn.cookieconfirm.tech/{HASH}/*
        };

        // 3) Alles samenvoegen: static ? ssm ? computed
        this.environmentVars = {
            ...STATIC_ENV,
            ...envFromSsm,
            ...computed,
        };
    }

    public getEnvironmentVars(): EnvVars {
        return this.environmentVars;
    }

    public append(key: AppendableVars, value: string) {
        (this.environmentVars as AppendableEnvVars)[key] = value;
        return this;
    }
}
