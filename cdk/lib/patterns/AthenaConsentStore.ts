import { Construct } from "constructs";
import { AthenaDatabaseConsentLogsBucket } from "../constructs/S3/AthenaDatabaseConsentLogsBucket";
import { AthenaDatabase } from "../constructs/Athena/AthenaDatabase";
import { AthenaTable } from "../constructs/Athena/AthenaTable";
import { AthenaWorkGroup } from "../constructs/Athena/AthenaWorkGroup";
import { Bucket } from "aws-cdk-lib/aws-s3";

type AthenaDatabaseResourceProps = {
  account: string;
  databaseName: string;
  tableName: string;
  bucketName: string;
  workGroupName: string;
  storagePathS3: string;
  idPrefix: string;
};

export class AthenaConsentStore extends Construct {
  private readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: AthenaDatabaseResourceProps) {
    super(scope, id);

    const { account, databaseName, tableName, bucketName, workGroupName, storagePathS3, idPrefix } = props;

    this.bucket = new AthenaDatabaseConsentLogsBucket(this, `${idPrefix}AthenaDatabaseBucket`, {
      bucketName,
    });

    new AthenaDatabase(this, `${idPrefix}AthenaDatabase`, {
      account,
      databaseName: databaseName,
    });

    new AthenaTable(this, `${idPrefix}AthenaTable`, {
      storagePathS3,
      account,
      bucket: this.bucket,
      databaseName,
      tableName,
    });

    new AthenaWorkGroup(this, `${idPrefix}AthenaWorkGroup`, {
      bucket: this.bucket,
      workGroupName,
    });
  }

  public getAthenaBucket() {
    return this.bucket;
  }
}
