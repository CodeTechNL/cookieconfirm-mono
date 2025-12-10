import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {CfnTable} from "aws-cdk-lib/aws-glue";
import {} from "aws-cdk-lib/aws-athena";

type CfnTableProps = {
    bucket: Bucket
    account: string
    databaseName: string,
    tableName: string
    storagePathS3: string
}

export class AthenaTable extends CfnTable {
    constructor(scope: Construct, id: string, props: CfnTableProps) {

        const {account, databaseName, tableName, bucket, storagePathS3} = props;

        super(scope, id, {
            databaseName: databaseName,
            catalogId: account,
            tableInput: {
                name: tableName,
                tableType: "EXTERNAL_TABLE",
                parameters: {
                    classification: "json",
                    "projection.enabled": "true",
                    "projection.date.type": "date",
                    "projection.date.range": "2024-01-01,NOW",
                    "projection.date.format": "yyyy-MM-dd",
                    // Hive-style partitioning met key=value
                    "storage.location.template": `s3://${bucket.bucketName}/${storagePathS3}/date=\${date}/`,
                },
                partitionKeys: [
                    { name: "date", type: "string" }
                ],
                storageDescriptor: {
                    location: `s3://${bucket.bucketName}/${storagePathS3}/`,
                    inputFormat: "org.apache.hadoop.mapred.TextInputFormat",
                    outputFormat:
                        "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
                    serdeInfo: {
                        serializationLibrary: "org.openx.data.jsonserde.JsonSerDe",
                        parameters: {
                            "ignore.malformed.json": "true",
                        },
                    },
                    columns: [
                        { name: "uuid", type: "string" },
                        { name: "website", type: "string" },
                        { name: "ip_address", type: "string" },
                        { name: "country", type: "string" },
                        { name: "page_url", type: "string" },
                        { name: "user_agent", type: "string" },
                        { name: "updated_at", type: "string" },
                        { name: "consent_method", type: "string" },
                        { name: "accepted_functional", type: "boolean" },
                        { name: "accepted_marketing", type: "boolean" },
                        { name: "accepted_analytics", type: "boolean" },
                    ],
                },
            },
        });

        this.node.addDependency(bucket);
    }
}
