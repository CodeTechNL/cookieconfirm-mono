import * as cdk from "aws-cdk-lib"
import {Construct} from "constructs"
import {LambdaResource} from "../constructs/LambdaResource";
import {FunctionUrlAuthType, HttpMethod} from "aws-cdk-lib/aws-lambda"
import {S3AthenaBucketResource} from "../constructs/S3AthenaBucketResource";
import {CfnDatabase, CfnTable} from "aws-cdk-lib/aws-glue"
import {CfnWorkGroup} from  "aws-cdk-lib/aws-athena"



export class ConsentStoreStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const athenaBucket = new S3AthenaBucketResource(this, 'ConsentStorageBucket', {
            bucketName: 'athena-consent-store',
        })

        const lambdaFunction = new LambdaResource(this, 'ConsentStoreStack', {
            app:  'consent-store'
        })

        const functionUrl = lambdaFunction.lambdaFunction.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
            cors: {
                allowedOrigins: ['*'],
                allowedMethods: [
                    HttpMethod.POST,
                    HttpMethod.GET
                ]
            }
        })

        // URL tonen in output
        new cdk.CfnOutput(this, "LambdaFunctionUrl", {
            value: functionUrl.url
        })

        athenaBucket.bucket.grantPut(lambdaFunction.lambdaFunction)

        const databaseName = "requests_db"


        new CfnDatabase(this, 'ConsentRequestsDatabase', {
            catalogId: this.account,
            databaseInput: {
                name: databaseName,
            }
        })

        const tableName = "requests_json"


        const table = new CfnTable(this, 'ConsentRequestsTable', {
            databaseName,
            catalogId: this.account,
            tableInput: {
                tableType: "EXTERNAL_TABLE",
                parameters: {
                    classification: "json",
                    "projection.enabled": "true",
                    "projection.dt.type": "date",
                    "projection.dt.range": "2024-01-01,NOW",
                    "projection.dt.format": "yyyy-MM-dd",
                    "projection.hr.type": "integer",
                    "projection.hr.range": "0,23",
                    // Hive-style partitioning met key=value
                    "storage.location.template": `s3://${athenaBucket.bucket.bucketName}/requests/dt=\${dt}/hr=\${hr}/`,
                },
                partitionKeys: [
                    { name: "dt", type: "string" },
                    { name: "hr", type: "string" },
                ],
                storageDescriptor: {
                    location: `s3://${athenaBucket.bucket.bucketName}/requests/`,
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
                        { name: "ts", type: "string" },
                        { name: "method", type: "string" },
                        { name: "path", type: "string" },
                        { name: "ip", type: "string" },
                        { name: "request_id", type: "string" },
                        { name: "headers", type: "string" }, // JSON string
                        { name: "query", type: "string" },   // JSON string
                        { name: "body", type: "string" },    // JSON string of null
                        { name: "is_base64", type: "boolean" },
                    ],
                },
            },

        })

        table.node.addDependency(athenaBucket)

        // --- Athena WorkGroup met result-location
        new CfnWorkGroup(this, "RequestsWorkGroup", {
            name: "requests_wg",
            workGroupConfiguration: {
                resultConfiguration: {
                    outputLocation: `s3://${athenaBucket.bucket.bucketName}/athena-results/`,
                },
                publishCloudWatchMetricsEnabled: true,
                enforceWorkGroupConfiguration: false,
            },
            state: "ENABLED",
            description: "WorkGroup for querying Lambda request logs",
        })

        new cdk.CfnOutput(this, "AthenaTable", {
            value: `${databaseName}.${tableName}`,
        })
        new cdk.CfnOutput(this, "S3LogsPrefix", {
            value: `s3://${athenaBucket.bucket.bucketName}/requests/`,
        })

    }
}
