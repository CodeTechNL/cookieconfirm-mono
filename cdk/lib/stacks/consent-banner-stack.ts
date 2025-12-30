import {CfnOutput, CustomResource, Environment, Size, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {AthenaConsentStore} from "../patterns/AthenaConsentStore";
import {DeliveryStream} from "../patterns/DeliveryStream";
import {LambdaConsentStoreResource} from "../constructs/Lambda/LambdaConsentStoreResource";
import {UploadBannerScripts} from "../constructs/S3/StaticFiles/UploadBannerScripts";
import {UploadLocalhostBannerComponents} from "../constructs/S3/StaticFiles/UploadLocalhostBannerComponents";
import {EnvironmentResource} from "../constructs/Platform/EnvironmentResource";
import {JavaScriptAssetsBucket} from "../constructs/S3/JavaScriptAssetsBucket";
import {BannerComponentsBucket} from "../constructs/S3/BannerComponentsBucket";
import {FifteenMinutesCachePolicy} from "../constructs/Cloudfront/CachePolicies/FifteenMinutesCachePolicy";
import {OneDayCachePolicy} from "../constructs/Cloudfront/CachePolicies/OneDayCachePolicy";
import {OneYearCachePolicy} from "../constructs/Cloudfront/CachePolicies/OneYearCachePolicy";
import {CloudfrontDistribution} from "../constructs/Cloudfront/CloudfrontDistribution";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import {PlatformAssetsCorsPolicy} from "../constructs/Cloudfront/ResponseHeaders/PlatformAssetsCorsPolicy";
import {ResponseHeadersPolicy} from "aws-cdk-lib/aws-cloudfront";
import {GetSsmParameter} from "../constructs/Ssm/GetSsmParameter";
import {Duration} from "aws-cdk-lib/core";
import {DockerImageCode, DockerImageFunction} from "aws-cdk-lib/aws-lambda";
import {fromRoot, uuid} from "../helpers";
import {Platform} from "aws-cdk-lib/aws-ecr-assets";
import {Provider} from "aws-cdk-lib/custom-resources";

interface ConsentBannerStackProps extends StackProps {
    idPrefix: string;
    env: Environment,
    resourcePrefix: string
}

export class ConsentBannerStack extends Stack {
    constructor(scope: Construct, id: string, props: ConsentBannerStackProps) {
        super(scope, id, props);

        const {idPrefix, env, resourcePrefix} = props;

        const environment = new EnvironmentResource(this, `${idPrefix}EnvironmentVariables`, {
            env, idPrefix, resourcePrefix
        })

        const config = environment.getEnvironmentVars();

        const athena = new AthenaConsentStore(this, `${idPrefix}AthenaDatabaseResource`, {
            idPrefix,
            storagePathS3: config.ATHENA_CONSENT_LOGS_STORAGE_PATH_S3, // athenaConfig.storagePathS3,
            account: this.account,
            workGroupName: config.ATHENA_CONSENT_LOGS_WORK_GROUP,
            bucketName: config.ATHENA_CONSENT_LOGS_RAW_BUCKET,
            databaseName: config.ATHENA_CONSENT_LOGS_DATABASE,
            tableName: config.ATHENA_CONSENT_LOGS_TABLE,
        });

        new DeliveryStream(this, `${idPrefix}DeliveryStreamResource`, {
            idPrefix,
            streamInterval: parseInt(config.FIREHOSE_CONSENT_LOGS_STREAM_INTERVAL), // firehoseConfig.streamInterval,
            streamSize: parseInt(config.FIREHOSE_CONSENT_LOGS_STREAM_SIZE), // firehoseConfig.streamSize,
            storagePathS3: config.ATHENA_CONSENT_LOGS_STORAGE_PATH_S3, // athenaConfig.storagePathS3,
            bucket: athena.getAthenaBucket(),
            streamName: config.FIREHOSE_CONSENT_LOGS_STREAM, // firehoseConfig.streamName
        });

        const consentFunction = new LambdaConsentStoreResource(this, `${idPrefix}LambdaConsentStoreResource`, {
            awsAccount: this.account,
            bucketName: config.ATHENA_CONSENT_LOGS_RAW_BUCKET,
            streamName: config.FIREHOSE_CONSENT_LOGS_STREAM,
        });

        new CfnOutput(this, `${idPrefix}ConsentBannerStorageUrl`, {
            value: consentFunction.getIngestUrl()
        })

        /**
         * Docker image build (uses your existing Dockerfile in ./uploader)
         * IMPORTANT: for Lambda this Dockerfile must be Lambda-compatible.
         */
        const code = DockerImageCode.fromImageAsset(
            fromRoot('./banner'),
            {
                platform: Platform.LINUX_AMD64,
            },
        )

        const fn = new DockerImageFunction(this, 'OneShotFn', {
            code,
            timeout: Duration.minutes(15),
            memorySize: 2048,
            ephemeralStorageSize: Size.gibibytes(4),
            environment: {
                CI: 'true',
                WRANGLER_SEND_METRICS: 'false',

                R2_BUCKET: resourcePrefix,
                CLOUDFLARE_ACCOUNT_ID: config.CF_ACCOUNT_ID,

                // CloudFormation dynamic reference -> resolved at deploy, not stored in template plaintext.
                CLOUDFLARE_API_TOKEN: config.CF_SECRET,
                VITE_CONSENT_STORAGE_URL: consentFunction.getConsentStoreUrl(),
                VITE_CDN_URL: config.FULL_BANNER_DOMAIN,
            },
        })

        new CfnOutput(this, 'BannerFunctionArn', {
            value: consentFunction.getConsentStoreUrl()
        })

        new CfnOutput(this, 'BannerCdnUrlArn', {
            value: config.BANNER_DOMAIN
        })

        /**
         * Custom Resource Provider
         * - Create/Update => runs the Lambda (and therefore your container) once
         * - Delete => no-op (provider handles it)
         */
        const provider = new Provider(this, 'OneShotProvider', {
            onEventHandler: fn,
        })

        /**
         * Trigger rerun automatically when the Docker build context changes
         * (asset hash changes when files in uploader/ change)
         */
        new CustomResource(this, 'RunOnce', {
            serviceToken: provider.serviceToken,
            properties: {
                trigger: uuid(),
            },
        })
    }
}
