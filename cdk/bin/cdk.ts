#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import {env} from "../lib/helpers";
import {ConsentBannerStack} from "../lib/stacks/consent-banner-stack";
import {CookieScannerStack} from "../lib/stacks/cookie-scanner-stack";
import {ServerSetupStack} from "../lib/stacks/PlatformStack/server-setup-stack";
import {PlatformAssetsStack} from "../lib/stacks/PlatformStack/platform-assets-stack";
import {PlatformStack} from "../lib/stacks/platform-stack";

const envResult = dotenv.config({
    path: '../.env',
});

dotenvExpand.expand(envResult);

const app = new cdk.App();

new ConsentBannerStack(app, 'ConsentBannerStack', {
    app: {
        url: env('APP_DOMAIN'),
        cdnUrl: `${env('CLOUDFRONT_SUBDOMAIN')}.${env('APP_DOMAIN')}`
    },
    aws: {
        region: env('AWS_REGION'),
        account: env('AWS_ACCOUNT'),
    },
    services: {
        athena: {
            workGroup: env('ATHENA_CONSENT_LOGS_WORK_GROUP'),
            database: env('ATHENA_CONSENT_LOGS_DATABASE'),
            table: env('ATHENA_CONSENT_LOGS_TABLE'),
            storagePathS3: env('ATHENA_CONSENT_LOGS_STORAGE_PATH_S3'),
            athenaConsentLogBucket: env('ATHENA_CONSENT_LOGS_RAW_BUCKET')
        },
        cloudfront: {
            certificateArn: env('CLOUDFRONT_CERTIFICATE_ARN'),
            hostedZoneDomain: env('APP_DOMAIN'),
            recordName: env('CLOUDFRONT_SUBDOMAIN')
        },
        firehose: {
            streamName: env('FIREHOSE_CONSENT_LOGS_STREAM'),
            streamInterval: parseInt(env('FIREHOSE_CONSENT_LOGS_STREAM_INTERVAL')),
            streamSize: parseInt(env('FIREHOSE_CONSENT_LOGS_STREAM_SIZE'))
        },
        s3: {
            jsonFilesBucketName: env('S3_BANNER_COMPONENTS_BUCKET'),
            javascriptBucketName: env('S3_BANNER_ASSETS_BUCKET'),
        }
    }
})

new CookieScannerStack(app, 'CookieScannerStack', {
    queueName: env('SCANNER_QUEUE_NAME'),//"cookie-scanner-queue",
    apiKey: env('SCANNER_WEBHOOK_SEND_API_KEY'),
    connectionName: env('SCANNER_EVENT_BRIDGE_CONNECTION_NAME'),
    endpoint: env('SCANNER_WEBHOOK_POST_ENDPOINT'),
    eventDetailType: env('SCANNER_EVENT_BRIDGE_EVENT_DETAIL_TYPE'),
    eventSourceName: env('SCANNER_EVENT_BRIDGE_EVENT_SOURCE_NAME'),
    busName: env('SCANNER_EVENT_BRIDGE_EVENT_BUS_NAME'),
    env: {
        region: env('AWS_REGION'),
    }
})

new PlatformStack(app, 'PlatformStack', {
    domain: "cookieconfirm.tech",
    subdomain: "platform",
    env: {
        region: "eu-west-3",
        account: env('AWS_ACCOUNT'),
    }
})


app.synth();
