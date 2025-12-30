import {Construct} from "constructs";
import {FunctionUrlAuthType, HttpMethod, Runtime} from "aws-cdk-lib/aws-lambda";

import {Bucket} from "aws-cdk-lib/aws-s3";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {NodejsFunction, OutputFormat} from "aws-cdk-lib/aws-lambda-nodejs";
import {fromRoot} from "../../helpers";
import {Duration, Fn} from "aws-cdk-lib";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";

type LambdaConsentStoreProps = {
    awsAccount: string;
    bucketName: string;
    streamName: string;
};

export class LambdaConsentStoreResource extends Construct {
    private readonly ingestUrl: string;
    private consentStoreUrl: string;

    constructor(scope: Construct, id: string, props: LambdaConsentStoreProps) {
        super(scope, id);

        const {awsAccount, bucketName, streamName} = props;
        const bucket = Bucket.fromBucketName(this, "ExistingAthenaBucket", bucketName);

        const group = new LogGroup(this, "Group", {
            retention: RetentionDays.TWO_WEEKS,
        });

        const ingestFn = new NodejsFunction(this, "IngestFn", {
            runtime: Runtime.NODEJS_20_X,
            handler: "handler",
            entry: fromRoot("lambda", "consent-store", "firehose.ts"),
            environment: {
                CONSENT_LOG_BUCKET: bucketName,
                DELIVERY_STREAM_NAME: streamName,
            },
            memorySize: 128,
            logGroup: group,
            timeout: Duration.seconds(5),
            bundling: {
                minify: true,
                target: "es2022",
                format: OutputFormat.ESM,
                externalModules: ["@aws-sdk/client-firehose"],
            },
        });

        const streamArn = `arn:aws:firehose:eu-west-3:${awsAccount}:deliverystream/${streamName}`;

        ingestFn.addToRolePolicy(
            new PolicyStatement({
                actions: ["firehose:PutRecord", "firehose:PutRecordBatch", "firehose:DescribeDeliveryStream"],
                resources: [streamArn],
            }),
        );

        const ingestUrl = ingestFn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedMethods: [HttpMethod.ALL],
                allowedOrigins: ["*"],
                allowedHeaders: ["*"],
            },
        });

        bucket.grantPut(ingestFn);

        this.ingestUrl = Fn.select(2, Fn.split("/", ingestUrl.url));
        this.consentStoreUrl = ingestUrl.url;
    }

    public getIngestUrl(): string {
        return this.ingestUrl;
    }

    public getConsentStoreUrl(): string {
        return this.consentStoreUrl;
    }
}
