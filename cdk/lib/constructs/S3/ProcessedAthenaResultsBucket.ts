import {Construct} from "constructs";
import {BlockPublicAccess, Bucket} from "aws-cdk-lib/aws-s3";
import {Duration, RemovalPolicy} from "aws-cdk-lib";

type AthenaDatabaseBucketProps = {
    bucketName: string
}

export class ProcessedAthenaResultsBucket extends Bucket {
    constructor(scope: Construct, id: string, props: AthenaDatabaseBucketProps) {
        const {bucketName} = props;

        super(scope, id, {
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
}
