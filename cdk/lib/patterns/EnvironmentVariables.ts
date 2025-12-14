import { Construct } from "constructs";
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from "aws-cdk-lib/custom-resources";
import {EnvironmentResource} from "../constructs/Platform/EnvironmentResource";
import {CfnOutput} from "aws-cdk-lib";

type EnvironmentProps = {
    idPrefix: string;
    resourcePrefix: string;
    version: string;
};

export class EnvironmentVariables extends Construct {
    private readonly environmentResource: EnvironmentResource;

    constructor(scope: Construct, id: string, props: EnvironmentProps) {
        super(scope, id);

        const { idPrefix, version, resourcePrefix } = props;

        new CfnOutput(this, `${idPrefix}VersionBeforeBuild`, {
            value: version,
        });

        new CfnOutput(this, `${idPrefix}PrefixValue`, {
            value: idPrefix,
        });

        this.environmentResource = new EnvironmentResource(this, `${idPrefix}EnvironmentVariables`, {
            idPrefix,
            resourcePrefix,
            version,
        });

        this.updateVersion(version, idPrefix);


    }

    updateVersion(appVersionHash: string, idPrefix: string) {
        new AwsCustomResource(this, `${idPrefix}UpdateAppVersionHashParam`, {
            onCreate: {
                service: "SSM",
                action: "putParameter",
                parameters: {
                    Name: `/${idPrefix}/APP_VERSION_HASH`,
                    Value: appVersionHash,
                    Type: "String",
                    Overwrite: true,
                },
                // Zorgt dat er bij waarde-wijziging opnieuw wordt aangeroepen
                physicalResourceId: PhysicalResourceId.of(`APP_VERSION_HASH-${appVersionHash}`),
            },
            onUpdate: {
                service: "SSM",
                action: "putParameter",
                parameters: {
                    Name: `/${idPrefix}/APP_VERSION_HASH`,
                    Value: appVersionHash,
                    Type: "String",
                    Overwrite: true,
                },
                physicalResourceId: PhysicalResourceId.of(`APP_VERSION_HASH-${appVersionHash}`),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });
    }

    getEnvironmentResource(): EnvironmentResource {
        return this.environmentResource;
    }
}
