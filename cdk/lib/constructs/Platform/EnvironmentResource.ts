import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { EnvironmentVariablesInterface } from '../../interfaces/EnvironmentVariablesInterface';

interface EnvironmentResourceProps {
    APP_ENV: string;
}

export class EnvironmentResource extends Construct {
    private readonly environmentVars: EnvironmentVariablesInterface;

    private keys : (keyof EnvironmentVariablesInterface)[] = [
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
    ];

    constructor(scope: Construct, id: string, props: EnvironmentResourceProps) {
        super(scope, id);

        const vars = this.getEnvObject(props.APP_ENV);

        // Set the APP_URL based on the subdomain and Main Domain
        vars.APP_URL = `https://${vars.APP_SUBDOMAIN}.${vars.APP_MAIN_DOMAIN}`;

        this.environmentVars = vars;
    }

    public getEnvironmentVars(): (EnvironmentVariablesInterface) {
        return this.environmentVars;
    }

    private getEnvObject(env: string): EnvironmentVariablesInterface {
        const out = {} as EnvironmentVariablesInterface;

        this.keys.forEach((key) => {
            out[key] = StringParameter.fromStringParameterName(
                this,
                `${env}-${key}`,
                `/cc/${env}/${key}`,
            ).stringValue;
        });

        return out;
    }

    public append(key: (keyof EnvironmentVariablesInterface), value: string) {
        this.environmentVars[key] = value;

        return this;
    }
}
