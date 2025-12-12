import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { CfnWorkGroup } from "aws-cdk-lib/aws-athena";

type CfnWorkGroupProps = {
    bucket: Bucket;
    workGroupName: string;
};

export class AthenaWorkGroup extends CfnWorkGroup {
    constructor(scope: Construct, id: string, props: CfnWorkGroupProps) {
        const { workGroupName, bucket } = props;

        super(scope, id, {
            name: workGroupName,
            workGroupConfiguration: {
                resultConfiguration: {
                    outputLocation: `s3://${bucket.bucketName}/athena-results/`,
                    encryptionConfiguration: {
                        encryptionOption: "SSE_S3",
                    },
                },
                publishCloudWatchMetricsEnabled: true,
                enforceWorkGroupConfiguration: true,
            },
            state: "ENABLED",
            description: "WorkGroup for querying Lambda request logs",
            recursiveDeleteOption: true,
        });
    }
}
