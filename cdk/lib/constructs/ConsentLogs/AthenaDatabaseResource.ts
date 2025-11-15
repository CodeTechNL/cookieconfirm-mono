import {Construct} from "constructs";
import {AthenaDatabaseBucketRawResource} from "./S3/AthenaDatabaseBucketRawResource";
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
    storagePathS3: string
}

export class AthenaDatabaseResource extends Construct {
    private readonly bucket: Bucket;

    constructor(scope: Construct, id: string, props: AthenaDatabaseResourceProps) {
        super(scope, id);

        const {account, databaseName, tableName,bucketName, workGroupName,storagePathS3} = props;

        this.bucket = new AthenaDatabaseBucketRawResource(this, 'AthenaDatabaseBucketResource', {
            bucketName
        }).getResource()

        new CfnDatabaseResource(this, 'AthenaDatabaseResource', {
            account,
            databaseName: databaseName
        })

        new CfnTableResource(this, 'AthenaTableResource', {
            storagePathS3,
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
