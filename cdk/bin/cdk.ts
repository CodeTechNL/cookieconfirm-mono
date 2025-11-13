#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ConsentBannerStack } from '../lib/stacks/ConsentBannerStacks/consent-banner-stack';
import { CdnStack } from '../lib/stacks/ConsentBannerStacks/cdn-stack';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';

// .env laden
const envResult = dotenv.config({
    path: '../.env',
});
dotenvExpand.expand(envResult);

// Helper om env vars verplicht als string op te halen
function env(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const app = new cdk.App();

const consentBannerStack = new ConsentBannerStack(app, 'ConsentBannerStack', {
    services: {
        athena: {
            workGroup: env('ATHENA_CONSENT_LOGS_WORK_GROUP'),
            bucket: env('ATHENA_CONSENT_LOGS_RAW_BUCKET'),
            database: env('ATHENA_CONSENT_LOGS_DATABASE'),
            table: env('ATHENA_CONSENT_LOGS_TABLE'),
        },
        firehose: {
            streamName: env('FIREHOSE_CONSENT_LOGS_STREAM'),
        },
    },
    env: { region: env('AWS_REGION') },
});

const cloudfrontStack = new CdnStack(app, 'CloudfrontDistributionStack', {
    services: {
        cloudfront: {
            certificateArn: env('CLOUDFRONT_CERTIFICATE_ARN'),
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
    env: { region: env('AWS_REGION') },
});

consentBannerStack.addDependency(cloudfrontStack);

app.synth();
