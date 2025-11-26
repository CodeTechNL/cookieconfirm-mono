import {CfnOutput, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership} from "aws-cdk-lib/aws-s3";
import { AllowedMethods, CachePolicy, Distribution, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins";

interface PlatformAssetsStackProps extends StackProps {

}

/**
 * - Queue
 * - Lambda
 * - Event Bus
 * - Event Connection
 * - Event API Destination
 */
export class PlatformAssetsStack extends Stack {
    private readonly bucket: Bucket;

    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props)

        this.bucket = new Bucket(this, 'CookieConfirmAssetsBucket', {
            bucketName: 'platform-assets-stack-bucket',
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        })

        const origin = S3BucketOrigin.withOriginAccessControl(this.getBucket());

        const distribution = new Distribution(this, "SiteDistribution", {
            comment: "CDN for serving banner assets",
            defaultRootObject: "index.html",
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            priceClass: PriceClass.PRICE_CLASS_100,
            defaultBehavior: {
                cachePolicy: CachePolicy.CACHING_DISABLED,
                origin: origin,
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
        });

        new CfnOutput(this, "CloudFrontDomain", { value: distribution.domainName })
    }

    getBucket(){
        return this.bucket
    }
}
