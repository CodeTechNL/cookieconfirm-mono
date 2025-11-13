import * as cdk from "aws-cdk-lib"
import {Construct} from "constructs"
import {AthenaDatabaseResource} from "../../constructs/ConsentLogs/AthenaDatabaseResource";
import {StackProps } from "aws-cdk-lib";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {DeliveryStreamResource} from "../../constructs/ConsentLogs/Firehose/DeliveryStreamResource";

interface ConsentBannerStackProps extends StackProps {
    services: {
        firehose: {
            streamName: string
        },
        athena: {
            bucket: string
            table: string
            database: string
            workGroup: string
        }
    }
}

export class ConsentBannerStack extends cdk.Stack {
    private readonly bucket: Bucket;
    constructor(scope: Construct, id: string, props: ConsentBannerStackProps) {
        super(scope, id, props)

        const athenaConfig = props.services.athena;
        const firehoseConfig = props.services.firehose;

        const athena = new AthenaDatabaseResource(this, 'AthenaDatabaseResource', {
            account: this.account,
            workGroupName: athenaConfig.workGroup,
            bucketName: athenaConfig.bucket,
            databaseName: athenaConfig.database,
            tableName: athenaConfig.table
        })

        this.bucket = athena.getBucket();

        new DeliveryStreamResource(this, 'DeliveryStreamResource', {
            bucket: athena.getBucket(),
            streamName: firehoseConfig.streamName
        })
    }

    getAthenaBucket() {
        return this.bucket;
    }
}
