import {Duration, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {JavaScriptAssetsBucketResource} from "../../constructs/ConsentLogs/S3/JavaScriptAssetsBucketResource";
import {CdnDistributionResource} from "../../constructs/ConsentLogs/Cloudfront/CdnDistributionResource";
import {BannerComponentsBucketResource} from "../../constructs/ConsentLogs/S3/BannerComponentsBucketResource";
import {UploadBannerResource} from "../../constructs/ConsentLogs/S3/StaticFiles/UploadBannerResource";
import {UploadLocalhostBannerResource} from "../../constructs/ConsentLogs/S3/StaticFiles/UploadLocalhostBannerResource";
import {CacheCookieBehavior, CacheHeaderBehavior, CachePolicy, CacheQueryStringBehavior,} from "aws-cdk-lib/aws-cloudfront";
import {LambdaConsentStoreResource} from "../../constructs/ConsentLogs/Lambda/LambdaConsentStoreResource";

interface SharedStackProps extends StackProps {
    services: {
        cloudfront: {
            certificateArn: string
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

export class CdnStack extends Stack {
    constructor(scope: Construct, id: string, props: SharedStackProps) {
        super(scope, id, props)

        const {javascriptBucketName, jsonFilesBucketName} = props.services.s3;
        const {athenaConsentLogBucket} = props.services.athena;
        const {streamName} = props.services.firehose;
        const {certificateArn} = props.services.cloudfront;

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
            certificateArn: certificateArn
        });

        const consentFunction = new LambdaConsentStoreResource(this, 'LambdaConsentStoreResource', {
            awsAccount: this.account,
            bucketName: athenaConsentLogBucket,
            streamName: streamName
        })

        const fifteenMinuteCache = this.createCachePolicy();

        distributionResource
            .addInitJsonBehavior(jsonFilesBucket.getOrigin(), fifteenMinuteCache)
            .addBannerComponentsBehavior(jsonFilesBucket.getOrigin(), fifteenMinuteCache)
            .addConsentStorageBehavior(consentFunction.getIngestUrl());

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

    private createCachePolicy(): CachePolicy {
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
}
