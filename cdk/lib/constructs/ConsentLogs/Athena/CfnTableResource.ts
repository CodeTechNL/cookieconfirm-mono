import {Construct} from "constructs";
import {Bucket, CfnBucket} from "aws-cdk-lib/aws-s3";
import {CfnWorkGroup} from "aws-cdk-lib/aws-athena";
import {CfnDatabase, CfnTable} from "aws-cdk-lib/aws-glue";
import * as cdk from "aws-cdk-lib";

type CfnTableProps = {
    bucket: Bucket
    account: string
    databaseName: string,
    tableName: string
}

export class CfnTableResource extends Construct {

    private readonly resource: CfnTable;

    constructor(scope: Construct, id: string, props: CfnTableProps) {
        super(scope, id);

        const {account, databaseName, tableName, bucket} = props;

        this.resource = new CfnTable(this, 'ConsentRequestsTable', {
            databaseName: databaseName,
            catalogId: account,
            tableInput: {
                name: 'consent_logs',
                tableType: "EXTERNAL_TABLE",
                parameters: {
                    classification: "json",
                    "projection.enabled": "true",
                    "projection.date.type": "date",
                    "projection.date.range": "2024-01-01,NOW",
                    "projection.date.format": "yyyy-MM-dd",

                    "projection.website.type": "injected",

                    // Hive-style partitioning met key=value
                    "storage.location.template": `s3://${bucket.bucketName}/requests/website=\${website}/date=\${date}/`,
                },
                partitionKeys: [
                    { name: "website", type: "string" },
                    { name: "date", type: "string" }
                ],
                storageDescriptor: {
                    location: `s3://${bucket.bucketName}/requests/`,
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
        })

        this.resource.node.addDependency(bucket);

        new cdk.CfnOutput(this, "ConsentLogsTable", {
            value: `${this.getResource().databaseName}.${tableName}`,
        })
    }

    getResource(){
        return this.resource;
    }
}
