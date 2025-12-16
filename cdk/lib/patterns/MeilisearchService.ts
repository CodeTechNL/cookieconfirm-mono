import { Construct } from "constructs";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import {AnyPrincipal} from "aws-cdk-lib/aws-iam";
import {CfnOutput} from "aws-cdk-lib";
import {SecurityGroup, Vpc} from "aws-cdk-lib/aws-ec2";
import {MeilisearchFileSystem} from "../constructs/EfsFilesystem/MeilisearchFileSystem";
import {MeilisearchFunction} from "../constructs/Lambda/MeilisearchFunction";
import {UpsertSsmParameter} from "../constructs/Ssm/UpsertSsmParameter";
import {EnvironmentVars} from "../enums/StaticEnvironmentVariables";

type MeilisearchServiceProps = {
    idPrefix: string;
    resourcePrefix: string;
    vpc: Vpc
    environmentVariables: EnvironmentVars
};

export class MeilisearchService extends Construct {
    private readonly functionUrl: string;

    constructor(scope: Construct, id: string, props: MeilisearchServiceProps) {
        super(scope, id);
        const {idPrefix, vpc, resourcePrefix, environmentVariables } = props;

        const fs = new MeilisearchFileSystem(this, `${idPrefix}MeiliFs`, {
            resourcePrefix, vpc
        })

        const ap = fs.addMeilisearchAccessPoint(resourcePrefix);
        const lambdaSg = new SecurityGroup(this, "MeiliLambdaSg", { vpc });

        // sg van je EFS (maak die zelf aan of haal uit je construct)
        const efsSg = new SecurityGroup(this, "MeiliEfsSg", { vpc });


        const fn = new MeilisearchFunction(this, `${idPrefix}MeiliLambda`, {
            vpc,
            ap,
            password: environmentVariables.MEILISEARCH_KEY,
            securityGroups: [efsSg]
        });

        new CfnOutput(this, `${idPrefix}MeilisearchPassword`, { value: environmentVariables.MEILISEARCH_KEY });

        // Allow NFS from Lambda to EFS
        fs.connections.allowDefaultPortFrom(fn);

        // Function URL (replace API Gateway)
        const fnUrl = fn.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE, // or AWS_IAM
        });

        // Public invoke (only needed for NONE)
        fn.addPermission(`${idPrefix}PublicInvokeFunctionUrl`, {
            principal: new AnyPrincipal(),
            action: "lambda:InvokeFunctionUrl",
            functionUrlAuthType: FunctionUrlAuthType.NONE,
        });

        this.functionUrl = fnUrl.url;

        new CfnOutput(this, `${idPrefix}MeilisearchUrl`, { value: fnUrl.url });

        new UpsertSsmParameter(this, {
            parameterName: "MEILISEARCH_HOST",
            idPrefix,
            stringValue: this.functionUrl
        })
    }
}
