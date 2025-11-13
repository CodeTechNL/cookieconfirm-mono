import {Construct} from "constructs";
import * as cdk from "aws-cdk-lib";
import {IOrigin, OriginAccessIdentity} from "aws-cdk-lib/aws-cloudfront";
import {BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership} from "aws-cdk-lib/aws-s3";
import {CfnOutput, RemovalPolicy} from "aws-cdk-lib";
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins";


type DefaultCdnBucketResourceProps = {
    bucketName: string
    description: string
}

export class JavaScriptAssetsBucketResource extends Construct {
    private readonly resource: Bucket;
    private readonly origin: IOrigin;

    constructor(scope: Construct, id: string, props: DefaultCdnBucketResourceProps) {
        super(scope, id);

        const {bucketName, description} = props;

        this.resource = new Bucket(this, id, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        });

        new CfnOutput(this, `AssetsBucketName-${id}`, {
            value: this.getResource().bucketName,
            description: 'Bucket for storing the JavaScript assets',
        })

        new cdk.CfnOutput(this, "BucketName", { value: this.getResource().bucketName })

        this.origin = S3BucketOrigin.withOriginAccessControl(this.getResource());
    }

    public getResource(): Bucket {
        return this.resource;
    }

    public getOrigin():IOrigin {
        return this.origin;
    }
}
