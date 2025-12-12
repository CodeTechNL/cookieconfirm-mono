import { Construct } from "constructs";
import { BlockPublicAccess, Bucket, StorageClass } from "aws-cdk-lib/aws-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

type AthenaDatabaseBucketProps = {
    bucketName: string;
};

export class AthenaDatabaseConsentLogsBucket extends Bucket {
    constructor(scope: Construct, id: string, props: AthenaDatabaseBucketProps) {
        const { bucketName } = props;

        super(scope, id, {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            enforceSSL: false,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            lifecycleRules: [
                {
                    prefix: "logs/",
                    expiration: Duration.days(365), // delete after 1 year
                    transitions: [
                        {
                            storageClass: StorageClass.INTELLIGENT_TIERING,
                            transitionAfter: Duration.days(0),
                        },
                    ],
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
}
