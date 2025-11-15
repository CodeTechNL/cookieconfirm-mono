import {Duration, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {JavaScriptAssetsBucketResource} from "../../constructs/ConsentLogs/S3/JavaScriptAssetsBucketResource";
import {CdnDistributionResource} from "../../constructs/ConsentLogs/Cloudfront/CdnDistributionResource";
import {BannerComponentsBucketResource} from "../../constructs/ConsentLogs/S3/BannerComponentsBucketResource";
import {UploadBannerResource} from "../../constructs/ConsentLogs/S3/StaticFiles/UploadBannerResource";
import {UploadLocalhostBannerResource} from "../../constructs/ConsentLogs/S3/StaticFiles/UploadLocalhostBannerResource";
import {CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior,} from "aws-cdk-lib/aws-cloudfront";
import {LambdaConsentStoreResource} from "../../constructs/ConsentLogs/Lambda/LambdaConsentStoreResource";
import {CloudfrontDomainSetup} from "../../constructs/ConsentLogs/Route53/CloudfrontDomainSetup";

interface SharedStackProps extends StackProps {
    app: {
        url: string;
        cdnUrl: string;
    },
    services: {
        cloudfront: {
            certificateArn: string
            hostedZoneDomain: string,
            recordName: string
        },
        firehose: {
            streamName: string
        },
        s3: {
            jsonFilesBucketName: string
            javascriptBucketName: string
        },
        athena: {
            athenaConsentLogBucket: string
        }
    }
}

export class FrontendBannerStack extends Stack {
    constructor(scope: Construct, id: string, props: SharedStackProps) {
        super(scope, id, props)

        const {javascriptBucketName, jsonFilesBucketName} = props.services.s3;
        const {athenaConsentLogBucket} = props.services.athena;
        const {streamName} = props.services.firehose;
        const {certificateArn, hostedZoneDomain, recordName} = props.services.cloudfront;

        /**
         * Bucket for storing the JavaScript files
         */
        const javascriptBucket = this.createJavascriptBucket(javascriptBucketName)

        /**
         * Bucket for storing the consent banner assets
         */
        const jsonFilesBucket = this.createJsonFilesBucket(jsonFilesBucketName)

        const distributionResource = new CdnDistributionResource(this, 'AssetsDistributionResource', {
            origin: javascriptBucket.getOrigin(),
            certificateArn: certificateArn,
            domainNames: [
                props.app.cdnUrl
            ],
        });

        new CloudfrontDomainSetup(this, 'CloudfrontDomainSetup', {
            hostedZoneDomain: hostedZoneDomain,
            recordName: recordName, // maakt banner.cookieconfirm.com
            distribution: distributionResource.getResource(),
        });

        const consentFunction = new LambdaConsentStoreResource(this, 'LambdaConsentStoreResource', {
            awsAccount: this.account,
            bucketName: athenaConsentLogBucket,
            streamName: streamName
        })

        const fifteenMinuteCache = this.createFifteenMinutesCachePolicy();
        const oneDayCachePolicy = this.createOneDayCachePolicy();

        distributionResource
            // Cache for 15 minutes as this init file contains a version and changes
            .addInitJsonBehavior('/banner/*/init.json',jsonFilesBucket.getOrigin(), fifteenMinuteCache)
            // The banner files can be cached forever as they will be busted by a version which is received out of the init.json
            .addDefaultBehavior('/banner/*', jsonFilesBucket.getOrigin(), this.createOneYearCachePolicy())
            .addConsentStorageBehavior("/api/v1/store-consent", consentFunction.getIngestUrl())
            .addDefaultBehavior('/js/*', javascriptBucket.getOrigin(), fifteenMinuteCache)
            .addDefaultBehavior('/images/*', javascriptBucket.getOrigin(), oneDayCachePolicy);

        new UploadBannerResource(this, 'UploadBannerResource', {
            bucket: javascriptBucket.getResource(),
            cloudfront: distributionResource.getResource()
        })

        new UploadLocalhostBannerResource(this, 'UploadLocalhostBannerResource', {
            bucket: jsonFilesBucket.getResource(),
            cloudfront: distributionResource.getResource()
        })
    }

    createJsonFilesBucket(bucketName: string) {
         return new BannerComponentsBucketResource(this, 'BannerComponentsBucketResource', {
            bucketName,
        });
    }

    createJavascriptBucket(bucketName: string){
        return new JavaScriptAssetsBucketResource(this, 'S3BucketResource', {
            bucketName: bucketName,
            description: 'Bucket for storing the JavaScript assets'
        })
    }

    private createFifteenMinutesCachePolicy(): CachePolicy {
        return new CachePolicy(this, "FifteenMinuteCache", {
            cachePolicyName: "FifteenMinuteCache",
            comment: "Cache responses for 15 minutes, bustable via ?v=",
            defaultTtl: Duration.minutes(15),
            minTtl: Duration.minutes(15),
            maxTtl: Duration.minutes(15),
            cookieBehavior: CacheCookieBehavior.none(),
            headerBehavior: CacheHeaderBehavior.none(),
            queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
        });
    }

    private createOneDayCachePolicy(): CachePolicy {
        return new CachePolicy(this, "OneDayCache", {
            cachePolicyName: "OneDayCache",
            comment: "Cache responses for 1 day, bustable via ?v=",
            defaultTtl: Duration.days(1),
            minTtl: Duration.days(1),
            maxTtl: Duration.days(1),
            cookieBehavior: CacheCookieBehavior.none(),
            headerBehavior: CacheHeaderBehavior.none(),
            queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
        });
    }

    private createOneYearCachePolicy(): CachePolicy {
        return new CachePolicy(this, "OneYearCache", {
            cachePolicyName: "OneYearCache",
            comment: "Cache responses for 1 year, bustable via ?v=",
            defaultTtl: Duration.days(365),
            minTtl: Duration.days(365),
            maxTtl: Duration.days(365),
            cookieBehavior: CacheCookieBehavior.none(),
            headerBehavior: CacheHeaderBehavior.none(),
            queryStringBehavior: CacheQueryStringBehavior.allowList("v"),
        });
    }
}
