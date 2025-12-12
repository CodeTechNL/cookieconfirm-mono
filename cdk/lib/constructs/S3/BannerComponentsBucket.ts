import { Construct } from "constructs";
import { IOrigin } from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from "aws-cdk-lib/aws-s3";
import { RemovalPolicy } from "aws-cdk-lib";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

type BannerComponentsBucketResourceProps = {
    bucketName: string;
};

export class BannerComponentsBucket extends Bucket {
    constructor(scope: Construct, id: string, props: BannerComponentsBucketResourceProps) {
        const { bucketName } = props;

        super(scope, id, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
            versioned: false,
        });
    }

    public getOrigin(): IOrigin {
        return S3BucketOrigin.withOriginAccessControl(this);
    }
}
