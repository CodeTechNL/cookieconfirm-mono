import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {ConsentDeliveryStream} from "../constructs/Firehose/ConsentDeliveryStream";
import {FirehoseRole} from "../constructs/Roles/FirehoseRole";


type DeliveryStreamProps = {
    bucket: Bucket
    streamName: string
    storagePathS3: string
    streamInterval: number
    streamSize: number
    idPrefix: string
}

export class DeliveryStream extends Construct {
    constructor(scope: Construct, id: string, props: DeliveryStreamProps) {
        super(scope, id);

        const {bucket, streamName, storagePathS3, streamInterval,streamSize, idPrefix} = props;

        const firehoseRole = new FirehoseRole(this, `${idPrefix}FirehoseRole`);

        bucket.grantWrite(firehoseRole);
        bucket.grantRead(firehoseRole);

        new ConsentDeliveryStream(this, `${idPrefix}ConsentDeliveryStream`, {
            bucket,
            firehoseRole,
            storagePathS3,
            streamInterval,
            streamName,
            streamSize
        })
    }
}
