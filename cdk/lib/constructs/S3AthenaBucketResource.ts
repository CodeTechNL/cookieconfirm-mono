import {Construct} from "constructs";
import {BlockPublicAccess, Bucket, BucketEncryption} from "aws-cdk-lib/aws-s3";
import {CfnOutput, RemovalPolicy} from "aws-cdk-lib";
import {Duration} from "aws-cdk-lib";


type S3BucketProps = {
    bucketName: string
}
export class S3AthenaBucketResource extends Construct {

    public readonly bucket: Bucket;

    constructor(scope: Construct, id: string, props: S3BucketProps) {
        super(scope, id);

        this.bucket = new Bucket(this, id, {
            bucketName: props.bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            removalPolicy: RemovalPolicy.RETAIN,
            lifecycleRules: [
                { // optioneel: oude ruwe logs opruimen
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


        new CfnOutput(this, 'BucketName', {
            value: this.bucket.bucketName,
            description: 'My S3 Bucket',
        })
    }
}