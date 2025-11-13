import {Construct} from "constructs";
import {AthenaDatabaseBucketResource} from "./S3/AthenaDatabaseBucketResource";
import {CfnDatabaseResource} from "./Athena/CfnDatabaseResource";
import {CfnTableResource} from "./Athena/CfnTableResource";
import {CfnWorkGroupResource} from "./Athena/CfnWorkGroupResource";
import {Bucket} from "aws-cdk-lib/aws-s3";

type AthenaDatabaseResourceProps = {
    account: string
    databaseName: string,
    tableName: string
    bucketName: string
    workGroupName: string
}

export class AthenaDatabaseResource extends Construct {
    private readonly bucket: Bucket;

    constructor(scope: Construct, id: string, props: AthenaDatabaseResourceProps) {
        super(scope, id);

        const {account, databaseName, tableName,bucketName, workGroupName} = props;

        this.bucket = new AthenaDatabaseBucketResource(this, 'AthenaDatabaseBucketResource', {
            bucketName: bucketName
        }).getResource()

        new CfnDatabaseResource(this, 'AthenaDatabaseResource', {
            account,
            databaseName: databaseName
        })

        new CfnTableResource(this, 'AthenaTableResource', {
            account,
            bucket: this.getBucket(),
            databaseName: databaseName,
            tableName: tableName
        })

        new CfnWorkGroupResource(this, 'AthenaWorkGroupResource', {
            bucket: this.getBucket(),
            workGroupName
        })
    }

    public  getBucket(){
        return this.bucket;
    }
}
