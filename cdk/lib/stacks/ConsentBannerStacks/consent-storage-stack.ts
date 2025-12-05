import * as cdk from "aws-cdk-lib"
import {Construct} from "constructs"
import {AthenaDatabaseResource} from "../../constructs/ConsentLogs/AthenaDatabaseResource";
import {StackProps } from "aws-cdk-lib";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {DeliveryStreamResource} from "../../constructs/ConsentLogs/Firehose/DeliveryStreamResource";
import {
    AthenaDatabaseBucketProcessedResource
} from "../../constructs/ConsentLogs/S3/AthenaDatabaseBucketProcessedResource";

interface ConsentBannerStackProps extends StackProps {
    idPrefix: string,
    services: {
        firehose: {
            streamName: string
            streamInterval: number,
            streamSize: number,
        },
        athena: {
            rawBucket: string
            table: string
            database: string
            workGroup: string
            storagePathS3: string
        }
    }
}

export class ConsentStorageStack extends cdk.Stack {
    private readonly bucket: Bucket;
    constructor(scope: Construct, id: string, props: ConsentBannerStackProps) {
        super(scope, id, props)

        const {idPrefix} = props;
        const athenaConfig = props.services.athena;
        const firehoseConfig = props.services.firehose;

        const athena = new AthenaDatabaseResource(this, `${idPrefix}AthenaDatabaseResource`, {
            storagePathS3: athenaConfig.storagePathS3,
            account: this.account,
            workGroupName: athenaConfig.workGroup,
            bucketName: athenaConfig.rawBucket,
            databaseName: athenaConfig.database,
            tableName: athenaConfig.table
        })

        this.bucket = athena.getBucket();

        new DeliveryStreamResource(this, `${idPrefix}DeliveryStreamResource`, {
            streamInterval: firehoseConfig.streamInterval,
            streamSize: firehoseConfig.streamSize,
            storagePathS3: athenaConfig.storagePathS3,
            bucket: athena.getBucket(),
            streamName: firehoseConfig.streamName
        })
    }
}
