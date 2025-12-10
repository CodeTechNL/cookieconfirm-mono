import * as cdk from "aws-cdk-lib"
import {Construct} from "constructs"
import {AthenaDatabaseResource} from "../../constructs/ConsentLogs/AthenaDatabaseResource";
import {StackProps } from "aws-cdk-lib";
import {DeliveryStreamResource} from "../../constructs/ConsentLogs/Firehose/DeliveryStreamResource";

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

        athena.getBucket();

        new DeliveryStreamResource(this, `${idPrefix}DeliveryStreamResource`, {
            streamInterval: firehoseConfig.streamInterval,
            streamSize: firehoseConfig.streamSize,
            storagePathS3: athenaConfig.storagePathS3,
            bucket: athena.getBucket(),
            streamName: firehoseConfig.streamName
        })
    }
}
