import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { DefaultEnvironmentVariablesInterface } from '../../interfaces/DefaultEnvironmentVariablesInterface';

interface EnvironmentResourceProps {
    idPrefix: string;
    version: string
}

export class EnvironmentResource extends Construct {
    private readonly environmentVars: DefaultEnvironmentVariablesInterface;

    private keys : (keyof DefaultEnvironmentVariablesInterface)[] = [
        'APP_KEY',
        'APP_ENV',
        'DB_PASSWORD',
        'DB_USERNAME',
        'ASSET_URL',
        'FILAMENT_FILESYSTEM_DISK',
        'FILESYSTEM_DISK',
        'BUGSNAG_API_KEY',
        'MAIL_FROM_ADDRESS',
        'MAILGUN_DOMAIN',
        'MAILGUN_SECRET',
        'MAILGUN_ENDPOINT',
        'PHP_CLI_SERVER_WORKERS',
        'BCRYPT_ROUNDS',
        'BROADCAST_CONNECTION',
        'MEMCACHED_HOST',
        'MEILISEARCH_HOST',
        'MEILISEARCH_KEY',
        'APP_COMPANY_NAME',
        'NIGHTWATCH_TOKEN',
        'AWS_CDN_URL',
        'NIGHTWATCH_REQUEST_SAMPLE_RATE',
        'NIGHTWATCH_COMMAND_SAMPLE_RATE',
        'MAILGUN_WEBHOOK_SIGNING_KEY',
        'CHAT_GPT_API_KEY',
        'SLACK_ALERT_WEBHOOK',
        'PADDLE_CLIENT_SIDE_TOKEN',
        'PADDLE_API_KEY',
        'PADDLE_ENVIRONMENT',
        'PADDLE_PRODUCT_ID',
        'VITE_APP_NAME',
        'VITE_API_ENDPOINT',
        'VITE_BANNER_ASSETS_URL',
        'PADDLE_WEBHOOK_SECRET',
        'LAMBDA_WEBHOOKS_SECRET',
        'AWS_LAMBDA_COOKIE_SCANNER_URL',
        'AWS_LAMBDA_WEBSITE_SCRAPER_QUEUE',
        'SETTINGS_CACHE_ENABLED',
        'TURNSTILE_SITE_KEY',
        'TURNSTILE_SECRET_KEY',
        'REDIS_PASSWORD',
        'DB_DATABASE',
        'DB_CONNECTION',
        'QUEUE_CONNECTION',
        'APP_SUBDOMAIN',
        'APP_MAIN_DOMAIN',
        'APP_ASSETS_SUBDOMAIN',
        'DOMAIN_CERTIFICATE',
        'APP_VERSION_HASH',
        'SCANNER_QUEUE_NAME',
        'SCANNER_WEBHOOK_POST_ENDPOINT',
        'SCANNER_WEBHOOK_SEND_API_KEY',
        'SCANNER_EVENT_BRIDGE_CONNECTION_NAME',
        'SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE',
        'SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME',
        'SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME',

        'ATHENA_CONSENT_LOGS_STORAGE_PATH_S3',
        'ATHENA_CONSENT_LOGS_WORK_GROUP',
        'ATHENA_CONSENT_LOGS_RAW_BUCKET',
        'ATHENA_CONSENT_LOGS_DATABASE',
        'ATHENA_CONSENT_LOGS_TABLE',

        'FIREHOSE_CONSENT_LOGS_STREAM',
        'FIREHOSE_CONSENT_LOGS_STREAM_INTERVAL',
        'FIREHOSE_CONSENT_LOGS_STREAM_SIZE',
        'CLOUDFRONT_SUBDOMAIN',
        'S3_BANNER_COMPONENTS_BUCKET',
        'S3_BANNER_ASSETS_BUCKET'
    ];

    constructor(scope: Construct, id: string, props: EnvironmentResourceProps) {
        super(scope, id);

        const {idPrefix, version} = props;
        const vars = this.getEnvObject(idPrefix);

        // Set the APP_URL based on the subdomain and Main Domain
        vars.APP_URL = `https://${vars.APP_SUBDOMAIN}.${vars.APP_MAIN_DOMAIN}`;
        vars.ASSET_URL = `https://${vars.APP_ASSETS_SUBDOMAIN}.${vars.APP_MAIN_DOMAIN}/${version}`;
        vars.CLOUDFRONT_ASSETS_DOMAIN = `${vars.APP_ASSETS_SUBDOMAIN}.${vars.APP_MAIN_DOMAIN}`;
        vars.APP_VERSION_HASH = version;

        this.environmentVars = vars;
    }

    public getEnvironmentVars(): (DefaultEnvironmentVariablesInterface) {
        return this.environmentVars;
    }

    private getEnvObject(prefix: string): DefaultEnvironmentVariablesInterface {
        const out = {} as DefaultEnvironmentVariablesInterface;

        this.keys.forEach((key) => {
            out[key] = StringParameter.valueForStringParameter(
                this,
                `/${prefix}/${key}`
            );
        });

        return out;
    }

    public append(key: (keyof DefaultEnvironmentVariablesInterface), value: string) {
        this.environmentVars[key] = value;

        return this;
    }
}
