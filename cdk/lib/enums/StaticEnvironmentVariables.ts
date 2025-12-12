import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export const STATIC_ENV = {
    SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE: "completed",
    SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME: "CookieScanner",
    SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME: "cookie-scanner",

    FIREHOSE_CONSENT_LOGS_STREAM_INTERVAL: "30",
    FIREHOSE_CONSENT_LOGS_STREAM_SIZE: "5",

    DB_CONNECTION: "mysql",
    DB_PORT: "3306",

    REDIS_PORT: "6379",
    REDIS_DB: "0",
    REDIS_CACHE_CONNECTION: "default",
    REDIS_CLIENT: "phpredis",
    REDIS_PASSWORD: "null",

    SESSION_DRIVER: "redis",
    SESSION_STORE: "redis",
    SESSION_LIFETIME: "1440",
    SESSION_ENCRYPT: "false",
    SESSION_PATH: "/",
    SESSION_DOMAIN: "null",

    CACHE_STORE: "redis",
    QUEUE_CONNECTION: "redis",

    FILAMENT_FILESYSTEM_DISK: "s3",
    FILESYSTEM_DISK: "s3",

    LOG_CHANNEL: "stack",
    LOG_STACK: "single",
    LOG_DEPRECATIONS_CHANNEL: "null",
    LOG_LEVEL: "debug",

    MAIL_MAILER: "mailgun",

    PHP_CLI_SERVER_WORKERS: "4",
    BCRYPT_ROUNDS: "12",
    BROADCAST_CONNECTION: "log",
    MEMCACHED_HOST: "127.0.0.1",

    SCOUT_DRIVER: "meilisearch",
    MEILISEARCH_HOST: "",
    MEILISEARCH_KEY: "",

    NIGHTWATCH_TOKEN: "",
    NIGHTWATCH_REQUEST_SAMPLE_RATE: "1",
    NIGHTWATCH_COMMAND_SAMPLE_RATE: "1",

    PADDLE_ENVIRONMENT: "production",

    SETTINGS_CACHE_ENABLED: "true",

    EVENT_SOURCE_NAME: "",
    EVENT_DETAIL_TYPE: "",
    EVENT_BUS_NAME: "",
    EVENT_BUS_TYPE: "",

    SCANNER_QUEUE_SUFFIX: "",
    SCANNER_EVENT_BRIDGE_CONNECTION_PREFIX: "",
} as const;

export type StaticEnvVars = typeof STATIC_ENV;

// SSM keys (die je uit Parameter Store wilt trekken)
const ENV_KEYS = [
    "APP_KEY",
    "APP_ENV",
    "DB_PASSWORD",
    "DB_USERNAME",
    "BUGSNAG_API_KEY",
    "MAIL_FROM_ADDRESS",
    "MAILGUN_DOMAIN",
    "MAILGUN_SECRET",
    "MAILGUN_ENDPOINT",
    "MAILGUN_WEBHOOK_SIGNING_KEY",
    "CHAT_GPT_API_KEY",
    "SLACK_ALERT_WEBHOOK",
    "PADDLE_CLIENT_SIDE_TOKEN",
    "PADDLE_API_KEY",
    "PADDLE_PRODUCT_ID",
    "VITE_APP_NAME",
    "VITE_API_ENDPOINT",
    "VITE_BANNER_ASSETS_URL",
    "PADDLE_WEBHOOK_SECRET",
    "LAMBDA_WEBHOOKS_SECRET",
    "AWS_LAMBDA_COOKIE_SCANNER_URL",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
    "DB_DATABASE",
    "APP_COMPANY_NAME",
    "APP_SUBDOMAIN",          // platform
    "APP_MAIN_DOMAIN",        // cookieconfirm.tech
    "CERTIFICATE_ARN",
    "APP_VERSION_HASH",       // later overridden
    "ATHENA_CONSENT_LOGS_RAW_BUCKET",
    "SCANNER_WEBHOOK_POST_ENDPOINT",
    "SCANNER_WEBHOOK_SEND_API_KEY",
    "HOSTED_ZONE_ID",
    "APP_PLATFORM_ASSETS_SUBDOMAIN",
    "BANNER_SUBDOMAIN"
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];

export type SsmEnvVars = Record<EnvKey, string>;

// Helper om alles uit SSM te trekken
export function loadEnvironment(scope: Construct, idPrefix: string): SsmEnvVars {
    return ENV_KEYS.reduce((acc, key) => {
        acc[key] = StringParameter.valueForStringParameter(
            scope,
            `/${idPrefix}/${key}`,
        );
        return acc;
    }, {} as SsmEnvVars);
}

// Computed env keys
export const COMPUTED_ENV_KEYS = [
    "APP_URL",
    "ASSET_URL",
    "APP_VERSION_HASH",
    "SCANNER_QUEUE_NAME",
    "SCANNER_EVENT_BRIDGE_CONNECTION_NAME",
    "FIREHOSE_CONSENT_LOGS_STREAM",
    "ATHENA_CONSENT_LOGS_WORK_GROUP",
    "ATHENA_CONSENT_LOGS_DATABASE",
    "ATHENA_CONSENT_LOGS_TABLE",
    "ATHENA_CONSENT_LOGS_STORAGE_PATH_S3",
    "REDIS_PREFIX",
    "BANNER_DOMAIN",
    "OLD_ASSETS_DOMAIN",
    "S3_BANNER_ASSETS_BUCKET",
    "S3_BANNER_COMPONENTS_BUCKET",
] as const;

export type ComputedEnvKey = (typeof COMPUTED_ENV_KEYS)[number];
export type ComputedEnvVars = Record<ComputedEnvKey, string>;

export type AppendableVars =
    | "DB_HOST"
    | "DB_READ_HOST"
    | "DB_WRITE_HOST"
    | "DB_PORT"
    | "AWS_BUCKET"
    | "AWS_BUCKET_ASSETS"
    | "REDIS_HOST"
    | "REDIS_PORT"
    | "SQS_PREFIX"
    | "SQS_QUEUE";

export type AppendableEnvVars = Partial<Record<AppendableVars, string>>;

// Volledige env type (inclusief latere appendable vars)
export type EnvironmentVars =
    StaticEnvVars &
    SsmEnvVars &
    ComputedEnvVars &
    AppendableEnvVars;
