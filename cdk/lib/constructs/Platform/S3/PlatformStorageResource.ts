import {CfnOutput, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {BlockPublicAccess, Bucket, BucketEncryption, BucketProps, ObjectOwnership} from "aws-cdk-lib/aws-s3";
import { AllowedMethods, CachePolicy, Distribution, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins";

interface PlatformAssetsProps extends BucketProps {
    bucketName: string
}

export class PlatformStorageResource extends Bucket {
    private readonly bucket: Bucket;

    constructor(scope: Construct, id: string, props: PlatformAssetsProps) {
        const baseProps = {
            bucketName: props.bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
        }
        super(scope, id, baseProps)
    }

    getBucket(){
        return this.bucket
    }
}
