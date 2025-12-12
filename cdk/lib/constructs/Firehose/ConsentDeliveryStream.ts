import { Construct } from "constructs";
import { CfnDeliveryStream } from "aws-cdk-lib/aws-kinesisfirehose";
import { Role } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";

type DeliveryStreamProps = {
  bucket: Bucket;
  streamName: string;
  storagePathS3: string;
  streamInterval: number;
  streamSize: number;
  firehoseRole: Role;
};

export class ConsentDeliveryStream extends CfnDeliveryStream {
  constructor(scope: Construct, id: string, props: DeliveryStreamProps) {
    const { bucket, streamName, storagePathS3, streamInterval, streamSize, firehoseRole } = props;

    super(scope, id, {
      deliveryStreamName: streamName,
      deliveryStreamType: "DirectPut",
      extendedS3DestinationConfiguration: {
        bucketArn: bucket.bucketArn,
        roleArn: firehoseRole.roleArn,
        bufferingHints: {
          intervalInSeconds: streamInterval,
          sizeInMBs: streamSize,
        },
        compressionFormat: "GZIP",
        prefix: `${storagePathS3}/date=!{timestamp:yyyy-MM-dd}/`,
        errorOutputPrefix: "errors/!{firehose:error-output-type}/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/",
      },
    });
  }
}
