import {Duration} from "aws-cdk-lib"
import {Queue, QueueEncryption} from "aws-cdk-lib/aws-sqs"
import {Construct} from "constructs"


type CookieScanRequestProps = {
    queueName: string
}

export class CookieScanRequestSqsResource extends Queue {
    constructor(scope: Construct, id: string, props: CookieScanRequestProps) {
        const {queueName} = props;

        const baseProps = {
            queueName,
            enforceSSL: true,
            retentionPeriod: Duration.days(5),
            visibilityTimeout: Duration.minutes(15),
            maxMessageSizeBytes: 1048576,
            encryption: QueueEncryption.SQS_MANAGED
        };

        super(scope, id, baseProps);
    }
}
