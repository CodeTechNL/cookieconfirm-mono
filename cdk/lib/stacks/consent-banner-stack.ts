import { Stack, StackProps } from "aws-cdk-lib";
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

interface ConsentBannerStackProps extends StackProps {
    idPrefix: string;
    environment: EnvironmentResource;
}

export class ConsentBannerStack extends Stack {
    constructor(scope: Construct, id: string, props: ConsentBannerStackProps) {
        super(scope, id, props);

        const { idPrefix, environment } = props;

        const config = environment.getEnvironmentVars();

        const athena = new AthenaConsentStore(this, `${idPrefix}AthenaDatabaseResource`, {
            idPrefix,
            storagePathS3: config.ATHENA_CONSENT_LOGS_STORAGE_PATH_S3, // athenaConfig.storagePathS3,
            account: this.account,
            workGroupName: config.ATHENA_CONSENT_LOGS_WORK_GROUP, // athenaConfig.workGroup,
            bucketName: config.ATHENA_CONSENT_LOGS_RAW_BUCKET, // athenaConfig.rawBucket,
            databaseName: config.ATHENA_CONSENT_LOGS_DATABASE, // athenaConfig.database,
            tableName: config.ATHENA_CONSENT_LOGS_TABLE, // athenaConfig.table
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
            .addDefaultBehavior("/js/*", javascriptBucket.getOrigin(), fifteenMinuteCache)
            .addDefaultBehavior("/images/*", javascriptBucket.getOrigin(), oneDayCachePolicy);

        new UploadBannerScripts(this, "UploadBannerResource", {
            destinationBucket: javascriptBucket,
            distribution: cdnDistribution,
        });

        new UploadLocalhostBannerComponents(this, "UploadLocalhostBannerResource", {
            destinationBucket: jsonFilesBucket,
            distribution: cdnDistribution,
        });

        const zone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
            hostedZoneId: environment.getEnvironmentVars().HOSTED_ZONE_ID,
            zoneName: environment.getEnvironmentVars().APP_MAIN_DOMAIN,
        });

        new ARecord(this, `${idPrefix}BannerSubdomainRecord`, {
            zone,
            recordName: "banner",
            target: RecordTarget.fromAlias(new CloudFrontTarget(cdnDistribution)),
        });
    }
}
