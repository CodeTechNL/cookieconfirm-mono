import {Construct} from "constructs";
import * as cdk from "aws-cdk-lib";
import {
    AllowedMethods,
    CachePolicy,
    IOrigin,
    OriginAccessIdentity,
    ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership} from "aws-cdk-lib/aws-s3";
import {CfnOutput, RemovalPolicy} from "aws-cdk-lib";
import {S3BucketOrigin, S3StaticWebsiteOrigin} from "aws-cdk-lib/aws-cloudfront-origins";


type BannerComponentsBucketResourceProps = {
    bucketName: string
}

export class BannerComponentsBucketResource extends Construct {
    private readonly resource: Bucket;
    private readonly origin: IOrigin;

    constructor(scope: Construct, id: string, props: BannerComponentsBucketResourceProps) {
        super(scope, id);

        const {bucketName} = props;

        this.resource = new Bucket(this, id, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
            versioned: false,
        });

        new CfnOutput(this, 'AssetsBucketName', {
            value: this.getResource().bucketName,
            description: 'My S3 Bucket',
        })

        new cdk.CfnOutput(this, "BucketName", {
            value: this.getResource().bucketName
        })

        this.origin = S3BucketOrigin.withOriginAccessControl(this.getResource());
    }

    public getResource(): Bucket {
        return this.resource;
    }

    public getOrigin():IOrigin {
        return this.origin;
    }
}
