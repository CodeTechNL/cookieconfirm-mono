import {CfnOutput, Environment, Stack, StackProps} from "aws-cdk-lib";
import { Construct } from "constructs";
import { AthenaConsentStore } from "../patterns/AthenaConsentStore";
import { DeliveryStream } from "../patterns/DeliveryStream";
import { LambdaConsentStoreResource } from "../constructs/Lambda/LambdaConsentStoreResource";
import { UploadBannerScripts } from "../constructs/S3/StaticFiles/UploadBannerScripts";
import { UploadLocalhostBannerComponents } from "../constructs/S3/StaticFiles/UploadLocalhostBannerComponents";
import { EnvironmentResource } from "../constructs/Platform/EnvironmentResource";
import { JavaScriptAssetsBucket } from "../constructs/S3/JavaScriptAssetsBucket";
import { BannerComponentsBucket } from "../constructs/S3/BannerComponentsBucket";
import { FifteenMinutesCachePolicy } from "../constructs/Cloudfront/CachePolicies/FifteenMinutesCachePolicy";
import { OneDayCachePolicy } from "../constructs/Cloudfront/CachePolicies/OneDayCachePolicy";
import { OneYearCachePolicy } from "../constructs/Cloudfront/CachePolicies/OneYearCachePolicy";
import { CloudfrontDistribution } from "../constructs/Cloudfront/CloudfrontDistribution";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {PlatformAssetsCorsPolicy} from "../constructs/Cloudfront/ResponseHeaders/PlatformAssetsCorsPolicy";
import {ResponseHeadersPolicy} from "aws-cdk-lib/aws-cloudfront";
import {GetSsmParameter} from "../constructs/Ssm/GetSsmParameter";

interface ConsentBannerStackProps extends StackProps {
    idPrefix: string;
    env: Environment,
    resourcePrefix: string
}

export class ConsentBannerStack extends Stack {
    constructor(scope: Construct, id: string, props: ConsentBannerStackProps) {
        super(scope, id, props);


        const { idPrefix, env, resourcePrefix } = props;

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

        /**
         * Bucket for storing the JavaScript files
         */
        const javascriptBucket = new JavaScriptAssetsBucket(this, `${idPrefix}JavascriptAssetsBucket`, {
            bucketName: config.S3_BANNER_ASSETS_BUCKET,
            description: "Bucket to store the banner javascript",
        });

        /**
         * Bucket for storing the consent banner assets
         */
        const jsonFilesBucket = new BannerComponentsBucket(this, `${idPrefix}BannerComponentsBucket`, {
            bucketName: config.S3_BANNER_COMPONENTS_BUCKET,
        });

        const arn = StringParameter.valueForStringParameter(this, `/${idPrefix}/CERTIFICATE_ARN`);

        const certificate = Certificate.fromCertificateArn(this, "Certificate", arn);

        const cdnDistribution = new CloudfrontDistribution(this, "SiteDistribution", {
            certificate,
            domainNames: [config.OLD_ASSETS_DOMAIN, config.BANNER_DOMAIN],
            origin: javascriptBucket.getOrigin(),
            idPrefix
        });

        const consentFunction = new LambdaConsentStoreResource(this, `${idPrefix}LambdaConsentStoreResource`, {
            awsAccount: this.account,
            bucketName: config.ATHENA_CONSENT_LOGS_RAW_BUCKET,
            streamName: config.FIREHOSE_CONSENT_LOGS_STREAM,
        });

        const fifteenMinuteCache = new FifteenMinutesCachePolicy(this, `${idPrefix}FifteenMinutesCachePolicy`);
        const oneDayCachePolicy = new OneDayCachePolicy(this, `${idPrefix}OneDayCachePolicy`);
        const oneYearCachePolicy = new OneYearCachePolicy(this, `${idPrefix}OneYearCachePolicy`);

        cdnDistribution
            // Cache for 15 minutes as this init file contains a version and changes
            .addInitJsonBehavior("/banner/*/init.json", jsonFilesBucket.getOrigin(), fifteenMinuteCache)
            // The banner files can be cached forever as they will be busted by a version which is received out of the init.json
            .addDefaultBehavior("/banner/*", jsonFilesBucket.getOrigin(), oneYearCachePolicy)
            .addConsentStorageBehavior("/api/v1/store-consent", consentFunction.getIngestUrl())
            .addDefaultBehavior("/js/*", javascriptBucket.getOrigin(), fifteenMinuteCache, ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT)
            .addDefaultBehavior("/images/*", javascriptBucket.getOrigin(), oneDayCachePolicy);

        // VITE_APP_URL=https://$CLOUDFRONT_SUBDOMAIN.$APP_DOMAIN
        // VITE_CDN_URL=https://$CLOUDFRONT_SUBDOMAIN.$APP_DOMAIN/banner
        //

        const MAIN_DOMAIN = GetSsmParameter.get(this, idPrefix, 'APP_MAIN_DOMAIN')
        const SUBDOMAIN = GetSsmParameter.get(this, idPrefix, 'BANNER_SUBDOMAIN')
        const URL = `https://${SUBDOMAIN}.${MAIN_DOMAIN}`

        new CfnOutput(this, 'SampleOutputUrl', {
            value: URL
        })
        new UploadBannerScripts(this, "UploadBannerResource", {
            destinationBucket: javascriptBucket,
            distribution: cdnDistribution,
            viteConfig: {
                VITE_APP_URL: URL,
                VITE_CDN_URL: `${URL}/banner`
            }
        });

        new UploadLocalhostBannerComponents(this, "UploadLocalhostBannerResource", {
            destinationBucket: jsonFilesBucket,
            distribution: cdnDistribution,
        });

        const zone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
            hostedZoneId: config.HOSTED_ZONE_ID,
            zoneName: config.APP_MAIN_DOMAIN,
        });

        new ARecord(this, `${idPrefix}BannerSubdomainRecord`, {
            zone,
            recordName: config.BANNER_SUBDOMAIN,
            target: RecordTarget.fromAlias(new CloudFrontTarget(cdnDistribution)),
        });
    }
}
