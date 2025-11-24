import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface AppConfig extends StackProps {
    APP_KEY: string;
    APP_ENV: string;
    APP_DEBUG: string;
    APP_NAME: string;
    APP_TIMEZONE: string;
    APP_URL: string;
    APP_LOCALE: string;
    APP_FALLBACK_LOCALE: string;
    APP_FAKER_LOCALE: string;

    DB_CONNECTION: string;
    DB_HOST: string;
    DB_DATABASE: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_PORT: string;
    DB_READ_HOST: string;
    DB_WRITE_HOST: string;

    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_DB: string;
    REDIS_CACHE_CONNECTION: string;
    REDIS_PREFIX: string;
    REDIS_CLIENT: string;
    REDIS_PASSWORD: string;

    SESSION_DRIVER: string;
    SESSION_STORE: string;
    SESSION_LIFETIME: string;
    SESSION_ENCRYPT: string;
    SESSION_PATH: string;
    SESSION_DOMAIN: string;

    CACHE_STORE: string;
    QUEUE_CONNECTION: string;
    ASSET_URL: string;

    SQS_QUEUE: string;
    SQS_PREFIX: string;

    AWS_DEFAULT_REGION: string;
    AWS_BUCKET_CONSENT_LOG: string;
    AWS_BUCKET: string;

    FILAMENT_FILESYSTEM_DISK: string;
    FILESYSTEM_DISK: string;

    BUGSNAG_API_KEY: string;

    LOG_CHANNEL: string;
    LOG_STACK: string;
    LOG_DEPRECATIONS_CHANNEL: string;
    LOG_LEVEL: string;

    MAIL_MAILER: string;
    MAIL_FROM_ADDRESS: string;
    MAILGUN_DOMAIN: string;
    MAILGUN_SECRET: string;
    MAILGUN_ENDPOINT: string;
    MAIL_FROM_NAME: string;

    PHP_CLI_SERVER_WORKERS: string;
    BCRYPT_ROUNDS: string;

    BROADCAST_CONNECTION: string;
    MEMCACHED_HOST: string;

    SCOUT_DRIVER: string;
    MEILISEARCH_HOST: string;
    MEILISEARCH_KEY: string;

    WEB_COOKIE_PREFIX: string;
    APP_COMPANY_NAME: string;

    NIGHTWATCH_TOKEN: string;
    AWS_CDN_URL: string;
    NIGHTWATCH_REQUEST_SAMPLE_RATE: string;
    NIGHTWATCH_COMMAND_SAMPLE_RATE: string;

    MAILGUN_WEBHOOK_SIGNING_KEY: string;

    APP_MAINTENANCE_DRIVER: string;
    APP_MAINTENANCE_STORE: string;
    APP_MAINTENANCE_KEY: string;

    CHAT_GPT_API_KEY: string;
    SLACK_ALERT_WEBHOOK: string;

    PADDLE_CLIENT_SIDE_TOKEN: string;
    PADDLE_API_KEY: string;
    PADDLE_ENVIRONMENT: string;
    PADDLE_PRODUCT_ID: string;

    VITE_APP_NAME: string;
    VITE_API_ENDPOINT: string;
    VITE_BANNER_ASSETS_URL: string;

    PADDLE_WEBHOOK_SECRET: string;

    LAMBDA_WEBHOOKS_SECRET: string;
    AWS_LAMBDA_COOKIE_SCANNER_URL: string;
    AWS_LAMBDA_WEBSITE_SCRAPER_QUEUE: string;

    SETTINGS_CACHE_ENABLED: string;

    TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET_KEY: string;
}


export class ConfigStack extends Stack {
    constructor(scope: Construct, id: string, props: AppConfig) {
        super(scope, id);

        new StringParameter(this, "APP_KEY", { parameterName: "/cc/local/APP_KEY", stringValue: props.APP_KEY });
        new StringParameter(this, "APP_ENV", { parameterName: "/cc/local/APP_ENV", stringValue: props.APP_ENV });
        new StringParameter(this, "APP_DEBUG", { parameterName: "/cc/local/APP_DEBUG", stringValue: props.APP_DEBUG });
        new StringParameter(this, "APP_NAME", { parameterName: "/cc/local/APP_NAME", stringValue: props.APP_NAME });
        new StringParameter(this, "APP_TIMEZONE", { parameterName: "/cc/local/APP_TIMEZONE", stringValue: props.APP_TIMEZONE });
        new StringParameter(this, "APP_URL", { parameterName: "/cc/local/APP_URL", stringValue: props.APP_URL });
        new StringParameter(this, "APP_LOCALE", { parameterName: "/cc/local/APP_LOCALE", stringValue: props.APP_LOCALE });
        new StringParameter(this, "APP_FALLBACK_LOCALE", { parameterName: "/cc/local/APP_FALLBACK_LOCALE", stringValue: props.APP_FALLBACK_LOCALE });
        new StringParameter(this, "APP_FAKER_LOCALE", { parameterName: "/cc/local/APP_FAKER_LOCALE", stringValue: props.APP_FAKER_LOCALE });

        new StringParameter(this, "DB_CONNECTION", { parameterName: "/cc/local/DB_CONNECTION", stringValue: props.DB_CONNECTION });
        new StringParameter(this, "DB_HOST", { parameterName: "/cc/local/DB_HOST", stringValue: props.DB_HOST });
        new StringParameter(this, "DB_DATABASE", { parameterName: "/cc/local/DB_DATABASE", stringValue: props.DB_DATABASE });
        new StringParameter(this, "DB_USERNAME", { parameterName: "/cc/local/DB_USERNAME", stringValue: props.DB_USERNAME });
        new StringParameter(this, "DB_PASSWORD", { parameterName: "/cc/local/DB_PASSWORD", stringValue: props.DB_PASSWORD });
        new StringParameter(this, "DB_PORT", { parameterName: "/cc/local/DB_PORT", stringValue: props.DB_PORT });
        new StringParameter(this, "DB_READ_HOST", { parameterName: "/cc/local/DB_READ_HOST", stringValue: props.DB_READ_HOST });
        new StringParameter(this, "DB_WRITE_HOST", { parameterName: "/cc/local/DB_WRITE_HOST", stringValue: props.DB_WRITE_HOST });

        new StringParameter(this, "REDIS_HOST", { parameterName: "/cc/local/REDIS_HOST", stringValue: props.REDIS_HOST });
        new StringParameter(this, "REDIS_PORT", { parameterName: "/cc/local/REDIS_PORT", stringValue: props.REDIS_PORT });
        new StringParameter(this, "REDIS_DB", { parameterName: "/cc/local/REDIS_DB", stringValue: props.REDIS_DB });
        new StringParameter(this, "REDIS_CACHE_CONNECTION", { parameterName: "/cc/local/REDIS_CACHE_CONNECTION", stringValue: props.REDIS_CACHE_CONNECTION });
        new StringParameter(this, "REDIS_PREFIX", { parameterName: "/cc/local/REDIS_PREFIX", stringValue: props.REDIS_PREFIX });
        new StringParameter(this, "REDIS_CLIENT", { parameterName: "/cc/local/REDIS_CLIENT", stringValue: props.REDIS_CLIENT });
        new StringParameter(this, "REDIS_PASSWORD", { parameterName: "/cc/local/REDIS_PASSWORD", stringValue: props.REDIS_PASSWORD });

        new StringParameter(this, "SESSION_DRIVER", { parameterName: "/cc/local/SESSION_DRIVER", stringValue: props.SESSION_DRIVER });
        new StringParameter(this, "SESSION_STORE", { parameterName: "/cc/local/SESSION_STORE", stringValue: props.SESSION_STORE });
        new StringParameter(this, "SESSION_LIFETIME", { parameterName: "/cc/local/SESSION_LIFETIME", stringValue: props.SESSION_LIFETIME });
        new StringParameter(this, "SESSION_ENCRYPT", { parameterName: "/cc/local/SESSION_ENCRYPT", stringValue: props.SESSION_ENCRYPT });
        new StringParameter(this, "SESSION_PATH", { parameterName: "/cc/local/SESSION_PATH", stringValue: props.SESSION_PATH });
        new StringParameter(this, "SESSION_DOMAIN", { parameterName: "/cc/local/SESSION_DOMAIN", stringValue: props.SESSION_DOMAIN });

        new StringParameter(this, "CACHE_STORE", { parameterName: "/cc/local/CACHE_STORE", stringValue: props.CACHE_STORE });
        new StringParameter(this, "QUEUE_CONNECTION", { parameterName: "/cc/local/QUEUE_CONNECTION", stringValue: props.QUEUE_CONNECTION });
        new StringParameter(this, "ASSET_URL", { parameterName: "/cc/local/ASSET_URL", stringValue: props.ASSET_URL });

        new StringParameter(this, "SQS_QUEUE", { parameterName: "/cc/local/SQS_QUEUE", stringValue: props.SQS_QUEUE });
        new StringParameter(this, "SQS_PREFIX", { parameterName: "/cc/local/SQS_PREFIX", stringValue: props.SQS_PREFIX });

        new StringParameter(this, "AWS_DEFAULT_REGION", { parameterName: "/cc/local/AWS_DEFAULT_REGION", stringValue: props.AWS_DEFAULT_REGION });
        new StringParameter(this, "AWS_BUCKET_CONSENT_LOG", { parameterName: "/cc/local/AWS_BUCKET_CONSENT_LOG", stringValue: props.AWS_BUCKET_CONSENT_LOG });
        new StringParameter(this, "AWS_BUCKET", { parameterName: "/cc/local/AWS_BUCKET", stringValue: props.AWS_BUCKET });

        new StringParameter(this, "FILAMENT_FILESYSTEM_DISK", { parameterName: "/cc/local/FILAMENT_FILESYSTEM_DISK", stringValue: props.FILAMENT_FILESYSTEM_DISK });
        new StringParameter(this, "FILESYSTEM_DISK", { parameterName: "/cc/local/FILESYSTEM_DISK", stringValue: props.FILESYSTEM_DISK });

        new StringParameter(this, "BUGSNAG_API_KEY", { parameterName: "/cc/local/BUGSNAG_API_KEY", stringValue: props.BUGSNAG_API_KEY });

        new StringParameter(this, "LOG_CHANNEL", { parameterName: "/cc/local/LOG_CHANNEL", stringValue: props.LOG_CHANNEL });
        new StringParameter(this, "LOG_STACK", { parameterName: "/cc/local/LOG_STACK", stringValue: props.LOG_STACK });
        new StringParameter(this, "LOG_DEPRECATIONS_CHANNEL", { parameterName: "/cc/local/LOG_DEPRECATIONS_CHANNEL", stringValue: props.LOG_DEPRECATIONS_CHANNEL });
        new StringParameter(this, "LOG_LEVEL", { parameterName: "/cc/local/LOG_LEVEL", stringValue: props.LOG_LEVEL });

        new StringParameter(this, "MAIL_MAILER", { parameterName: "/cc/local/MAIL_MAILER", stringValue: props.MAIL_MAILER });
        new StringParameter(this, "MAIL_FROM_ADDRESS", { parameterName: "/cc/local/MAIL_FROM_ADDRESS", stringValue: props.MAIL_FROM_ADDRESS });
        new StringParameter(this, "MAILGUN_DOMAIN", { parameterName: "/cc/local/MAILGUN_DOMAIN", stringValue: props.MAILGUN_DOMAIN });
        new StringParameter(this, "MAILGUN_SECRET", { parameterName: "/cc/local/MAILGUN_SECRET", stringValue: props.MAILGUN_SECRET });
        new StringParameter(this, "MAILGUN_ENDPOINT", { parameterName: "/cc/local/MAILGUN_ENDPOINT", stringValue: props.MAILGUN_ENDPOINT });
        new StringParameter(this, "MAIL_FROM_NAME", { parameterName: "/cc/local/MAIL_FROM_NAME", stringValue: props.MAIL_FROM_NAME });

        new StringParameter(this, "VITE_APP_NAME", { parameterName: "/cc/local/VITE_APP_NAME", stringValue: props.VITE_APP_NAME });

        new StringParameter(this, "PHP_CLI_SERVER_WORKERS", { parameterName: "/cc/local/PHP_CLI_SERVER_WORKERS", stringValue: props.PHP_CLI_SERVER_WORKERS });
        new StringParameter(this, "BCRYPT_ROUNDS", { parameterName: "/cc/local/BCRYPT_ROUNDS", stringValue: props.BCRYPT_ROUNDS });

        new StringParameter(this, "BROADCAST_CONNECTION", { parameterName: "/cc/local/BROADCAST_CONNECTION", stringValue: props.BROADCAST_CONNECTION });
        new StringParameter(this, "MEMCACHED_HOST", { parameterName: "/cc/local/MEMCACHED_HOST", stringValue: props.MEMCACHED_HOST });

        new StringParameter(this, "SCOUT_DRIVER", { parameterName: "/cc/local/SCOUT_DRIVER", stringValue: props.SCOUT_DRIVER });
        new StringParameter(this, "MEILISEARCH_HOST", { parameterName: "/cc/local/MEILISEARCH_HOST", stringValue: props.MEILISEARCH_HOST });
        new StringParameter(this, "MEILISEARCH_KEY", { parameterName: "/cc/local/MEILISEARCH_KEY", stringValue: props.MEILISEARCH_KEY });

        new StringParameter(this, "WEB_COOKIE_PREFIX", { parameterName: "/cc/local/WEB_COOKIE_PREFIX", stringValue: props.WEB_COOKIE_PREFIX });
        new StringParameter(this, "APP_COMPANY_NAME", { parameterName: "/cc/local/APP_COMPANY_NAME", stringValue: props.APP_COMPANY_NAME });

        new StringParameter(this, "NIGHTWATCH_TOKEN", { parameterName: "/cc/local/NIGHTWATCH_TOKEN", stringValue: props.NIGHTWATCH_TOKEN });
        new StringParameter(this, "AWS_CDN_URL", { parameterName: "/cc/local/AWS_CDN_URL", stringValue: props.AWS_CDN_URL });
        new StringParameter(this, "NIGHTWATCH_REQUEST_SAMPLE_RATE", { parameterName: "/cc/local/NIGHTWATCH_REQUEST_SAMPLE_RATE", stringValue: props.NIGHTWATCH_REQUEST_SAMPLE_RATE });
        new StringParameter(this, "NIGHTWATCH_COMMAND_SAMPLE_RATE", { parameterName: "/cc/local/NIGHTWATCH_COMMAND_SAMPLE_RATE", stringValue: props.NIGHTWATCH_COMMAND_SAMPLE_RATE });

        new StringParameter(this, "MAILGUN_WEBHOOK_SIGNING_KEY", { parameterName: "/cc/local/MAILGUN_WEBHOOK_SIGNING_KEY", stringValue: props.MAILGUN_WEBHOOK_SIGNING_KEY });

        new StringParameter(this, "APP_MAINTENANCE_DRIVER", { parameterName: "/cc/local/APP_MAINTENANCE_DRIVER", stringValue: props.APP_MAINTENANCE_DRIVER });
        new StringParameter(this, "APP_MAINTENANCE_STORE", { parameterName: "/cc/local/APP_MAINTENANCE_STORE", stringValue: props.APP_MAINTENANCE_STORE });
        new StringParameter(this, "APP_MAINTENANCE_KEY", { parameterName: "/cc/local/APP_MAINTENANCE_KEY", stringValue: props.APP_MAINTENANCE_KEY });

        new StringParameter(this, "CHAT_GPT_API_KEY", { parameterName: "/cc/local/CHAT_GPT_API_KEY", stringValue: props.CHAT_GPT_API_KEY });
        new StringParameter(this, "SLACK_ALERT_WEBHOOK", { parameterName: "/cc/local/SLACK_ALERT_WEBHOOK", stringValue: props.SLACK_ALERT_WEBHOOK });

        new StringParameter(this, "PADDLE_CLIENT_SIDE_TOKEN", { parameterName: "/cc/local/PADDLE_CLIENT_SIDE_TOKEN", stringValue: props.PADDLE_CLIENT_SIDE_TOKEN });
        new StringParameter(this, "PADDLE_API_KEY", { parameterName: "/cc/local/PADDLE_API_KEY", stringValue: props.PADDLE_API_KEY });
        new StringParameter(this, "PADDLE_ENVIRONMENT", { parameterName: "/cc/local/PADDLE_ENVIRONMENT", stringValue: props.PADDLE_ENVIRONMENT });
        new StringParameter(this, "PADDLE_PRODUCT_ID", { parameterName: "/cc/local/PADDLE_PRODUCT_ID", stringValue: props.PADDLE_PRODUCT_ID });

        new StringParameter(this, "VITE_API_ENDPOINT", { parameterName: "/cc/local/VITE_API_ENDPOINT", stringValue: props.VITE_API_ENDPOINT });
        new StringParameter(this, "VITE_BANNER_ASSETS_URL", { parameterName: "/cc/local/VITE_BANNER_ASSETS_URL", stringValue: props.VITE_BANNER_ASSETS_URL });


        new StringParameter(this, "PADDLE_WEBHOOK_SECRET", { parameterName: "/cc/local/PADDLE_WEBHOOK_SECRET", stringValue: props.PADDLE_WEBHOOK_SECRET });

        new StringParameter(this, "LAMBDA_WEBHOOKS_SECRET", { parameterName: "/cc/local/LAMBDA_WEBHOOKS_SECRET", stringValue: props.LAMBDA_WEBHOOKS_SECRET });
        new StringParameter(this, "AWS_LAMBDA_COOKIE_SCANNER_URL", { parameterName: "/cc/local/AWS_LAMBDA_COOKIE_SCANNER_URL", stringValue: props.AWS_LAMBDA_COOKIE_SCANNER_URL });
        new StringParameter(this, "AWS_LAMBDA_WEBSITE_SCRAPER_QUEUE", { parameterName: "/cc/local/AWS_LAMBDA_WEBSITE_SCRAPER_QUEUE", stringValue: props.AWS_LAMBDA_WEBSITE_SCRAPER_QUEUE });

        new StringParameter(this, "SETTINGS_CACHE_ENABLED", { parameterName: "/cc/local/SETTINGS_CACHE_ENABLED", stringValue: props.SETTINGS_CACHE_ENABLED });

        new StringParameter(this, "TURNSTILE_SITE_KEY", { parameterName: "/cc/local/TURNSTILE_SITE_KEY", stringValue: props.TURNSTILE_SITE_KEY });
        new StringParameter(this, "TURNSTILE_SECRET_KEY", { parameterName: "/cc/local/TURNSTILE_SECRET_KEY", stringValue: props.TURNSTILE_SECRET_KEY });


    }
}
