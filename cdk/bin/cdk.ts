#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ConsentBannerStack } from '../lib/stacks/ConsentBannerStacks/consent-banner-stack';
import { CdnStack } from '../lib/stacks/ConsentBannerStacks/cdn-stack';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import {env} from "../lib/helpers";

// .env laden
const envResult = dotenv.config({
    path: '../.env',
});
dotenvExpand.expand(envResult);

const app = new cdk.App();

const consentBannerStack = new ConsentBannerStack(app, 'ConsentBannerStack', {
    services: {
        athena: {
            workGroup: env('ATHENA_CONSENT_LOGS_WORK_GROUP'),
            bucket: env('ATHENA_CONSENT_LOGS_RAW_BUCKET'),
            database: env('ATHENA_CONSENT_LOGS_DATABASE'),
            table: env('ATHENA_CONSENT_LOGS_TABLE'),
            storagePathS3: env('ATHENA_CONSENT_LOGS_STORAGE_PATH_S3')
        },
        firehose: {
            streamName: env('FIREHOSE_CONSENT_LOGS_STREAM'),
            streamInterval: parseInt(env('FIREHOSE_CONSENT_LOGS_STREAM_INTERVAL')),
            streamSize: parseInt(env('FIREHOSE_CONSENT_LOGS_STREAM_SIZE'))
        },
    },
    env: {
        region: env('AWS_REGION'),
        account: env('AWS_ACCOUNT'),
    },
});

const cloudfrontStack = new CdnStack(app, 'CloudfrontDistributionStack', {
    app: {
        url: env('APP_DOMAIN'),
        cdnUrl: `${env('CLOUDFRONT_SUBDOMAIN')}.${env('APP_DOMAIN')}`
    },
    services: {
        cloudfront: {
            certificateArn: env('CLOUDFRONT_CERTIFICATE_ARN'),
            hostedZoneDomain: env('APP_DOMAIN'),
            recordName: env('CLOUDFRONT_SUBDOMAIN')
        },
        firehose: {
            streamName: env('FIREHOSE_CONSENT_LOGS_STREAM'),
        },
        athena: {
            athenaConsentLogBucket: env('ATHENA_CONSENT_LOGS_RAW_BUCKET'),
        },
        s3: {
            jsonFilesBucketName: env('S3_BANNER_COMPONENTS_BUCKET'),
            javascriptBucketName: env('S3_BANNER_ASSETS_BUCKET'),
        },
    },
    env: {
        region: env('AWS_REGION'),
        account: env('AWS_ACCOUNT'),
    },
});

consentBannerStack.addDependency(cloudfrontStack);

app.synth();
