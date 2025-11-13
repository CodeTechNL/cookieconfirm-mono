import {Construct} from "constructs";
import {CfnDeliveryStream} from "aws-cdk-lib/aws-kinesisfirehose";
import {Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {Bucket} from "aws-cdk-lib/aws-s3";


type DeliveryStreamProps = {
    bucket: Bucket
    streamName: string
}

export class DeliveryStreamResource extends Construct {
    private readonly resource: CfnDeliveryStream;

    constructor(scope: Construct, id: string, props: DeliveryStreamProps) {
        super(scope, id);

        const {bucket, streamName} = props;

        const firehoseRole = new Role(this, 'FirehoseRole', {
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
        });

        bucket.grantWrite(firehoseRole);
        bucket.grantRead(firehoseRole);

        this.resource = new CfnDeliveryStream(this, 'ConsentDeliveryStream', {
            deliveryStreamName: streamName,
            deliveryStreamType: 'DirectPut',
            extendedS3DestinationConfiguration: {
                bucketArn: bucket.bucketArn,
                roleArn: firehoseRole.roleArn,
                bufferingHints: { intervalInSeconds: 60, sizeInMBs: 5 },
                compressionFormat: 'GZIP',
                prefix: 'consent-logs/date=!{timestamp:dd-MM-yyyy}/',
                errorOutputPrefix: 'errors/!{firehose:error-output-type}/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/'
            }
        });

    }

    public getResource(): CfnDeliveryStream {
        return this.resource;
    }
}
