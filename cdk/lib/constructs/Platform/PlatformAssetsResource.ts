import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from "aws-cdk-lib/aws-s3";
import { AllowedMethods, CachePolicy, Distribution, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { BucketDeployment, CacheControl, Source } from "aws-cdk-lib/aws-s3-deployment";
import { fromRoot } from "../../helpers";
import * as cdk from "aws-cdk-lib";

interface PlatformAssetsProps extends StackProps {
    bucketName: string;
    prefix: string;
    domain: string;
    certificateArn: string;
}

export class PlatformAssetsResource extends Construct {
    private readonly bucket: Bucket;
    private readonly distribution: Distribution;

    constructor(scope: Construct, id: string, props: PlatformAssetsProps) {
        super(scope, id);

        const { prefix, bucketName, domain, certificateArn } = props;

        this.bucket = new Bucket(this, `${prefix}AssetsBucket`, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        });

        const origin = S3BucketOrigin.withOriginAccessControl(this.getBucket());

        const certificate = Certificate.fromCertificateArn(this, `${prefix}SslCertificate`, certificateArn);

        console.log('Desired domain: ' + domain)
        this.distribution = new Distribution(this, `${prefix}SiteDistribution`, {
            comment: "CDN for serving banner assets",
            defaultRootObject: "index.html",
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            priceClass: PriceClass.PRICE_CLASS_100,
            domainNames: [domain],
            certificate,
            defaultBehavior: {
                cachePolicy: CachePolicy.CACHING_DISABLED,
                origin,
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            errorResponses: [
                {
                    httpStatus: 404,
                    ttl: Duration.minutes(5),
                    responseHttpStatus: 404,
                    responsePagePath: "/404.html", // pad in je S3 bucket / origin
                },
                {
                    httpStatus: 403,
                    ttl: Duration.minutes(5),
                    responseHttpStatus: 404,
                    responsePagePath: "/403.html", // pad in je S3 bucket / origin
                },
            ],
        });

        new BucketDeployment(this, `${prefix}DeployBannerAssets`, {
            prune: false,
            sources: [Source.asset(fromRoot("cdn-pages"))],
            destinationBucket: this.getBucket(),
            distribution: this.getDistribution(),
            distributionPaths: ["/*"],
            cacheControl: [CacheControl.maxAge(cdk.Duration.minutes(15)), CacheControl.setPublic()],
        });

        new CfnOutput(this, `${prefix}CloudFrontDomain`, { value: this.getDistribution().domainName });
    }

    getBucket() {
        return this.bucket;
    }

    getDistribution() {
        return this.distribution;
    }
}
