import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, CfnBucket, StorageClass} from "aws-cdk-lib/aws-s3";
import {Duration, RemovalPolicy} from "aws-cdk-lib";

type AthenaDatabaseBucketProps = {
    bucketName: string
}

export class AthenaDatabaseBucketResource extends Construct {
    private readonly resource: Bucket;

    constructor(scope: Construct, id: string, props: AthenaDatabaseBucketProps) {
        super(scope, id);

        const {bucketName} = props;

        this.resource = new Bucket(this, id, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: false,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            lifecycleRules: [
                {
                    prefix: 'logs/',
                    expiration: Duration.days(365), // delete after 1 year
                    transitions: [
                        {
                            storageClass: StorageClass.INTELLIGENT_TIERING,
                            transitionAfter: Duration.days(0)
                        }
                    ]
                },
                {
                    enabled: true,
                    prefix: "requests/",
                    expiration: Duration.days(180),
                },
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
