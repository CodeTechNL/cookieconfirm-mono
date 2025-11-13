import {Construct} from "constructs";
import {Bucket, CfnBucket} from "aws-cdk-lib/aws-s3";
import {CfnWorkGroup} from "aws-cdk-lib/aws-athena";
import {CfnDatabase, CfnTable} from "aws-cdk-lib/aws-glue";

type CfnWorkGroupProps = {
    bucket: Bucket
    workGroupName: string
}

export class CfnWorkGroupResource extends Construct {
    public table: CfnTable;
    public bucket: Bucket;
    public workgroup: CfnWorkGroup;
    public database: CfnDatabase;

    constructor(scope: Construct, id: string, props: CfnWorkGroupProps) {
        super(scope, id);

        const { workGroupName, bucket} = props;

        this.workgroup = new CfnWorkGroup(this, "RequestsWorkGroup", {
            name: workGroupName,
            workGroupConfiguration: {
                resultConfiguration: {
                    outputLocation: `s3://${bucket.bucketName}/athena-results/`,
                    encryptionConfiguration: {
                        encryptionOption: 'SSE_S3',
                    },
                },
                publishCloudWatchMetricsEnabled: true,
                enforceWorkGroupConfiguration: true,

            },
            state: "ENABLED",
            description: "WorkGroup for querying Lambda request logs",
            recursiveDeleteOption: true,
        })
    }
}
