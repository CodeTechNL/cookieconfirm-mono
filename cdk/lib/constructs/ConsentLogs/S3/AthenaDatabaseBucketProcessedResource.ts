import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, CfnBucket, StorageClass} from "aws-cdk-lib/aws-s3";
import {Duration, RemovalPolicy} from "aws-cdk-lib";

type AthenaDatabaseBucketProps = {
    bucketName: string
}

export class AthenaDatabaseBucketProcessedResource extends Construct {
    private readonly resource: Bucket;

    constructor(scope: Construct, id: string, props: AthenaDatabaseBucketProps) {
        super(scope, id);

        const {bucketName} = props;

        this.resource = new Bucket(this, id, {
            bucketName: `${bucketName}-processed`,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: false,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            lifecycleRules: [
                {
                    enabled: true,
                    prefix: "athena-results/",
                    expiration: Duration.days(30),
                },
            ],
        });
    }

    public getResource(): Bucket{
        return this.resource;
    }
}
