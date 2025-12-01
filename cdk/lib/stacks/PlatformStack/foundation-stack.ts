import {CfnOutput, Stack, StackProps} from "aws-cdk-lib"
import {Construct} from "constructs"
import {EnvironmentResource} from "../../constructs/Platform/EnvironmentResource";
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from "aws-cdk-lib/custom-resources";

interface FoundationStackProps extends StackProps {
    prefix: string
    version: string
}

export class FoundationStack extends Stack {

    private readonly environmentResource: EnvironmentResource;

    constructor(scope: Construct, id: string, props: FoundationStackProps) {
        super(scope, id, props);

        const {prefix, version} = props;

        new CfnOutput(this, `${prefix}VersionBeforeBuild`, {
            value: version
        })

        new CfnOutput(this, `${prefix}PrefixValue`, {
            value: prefix
        })

        this.environmentResource = new EnvironmentResource(this, `${prefix}EnvironmentVariables`, {
            prefix,
            version
        });

        this.updateVersion(version)

    }

    updateVersion(appVersionHash: string){
        new AwsCustomResource(this, 'UpdateAppVersionHashParam', {
            onCreate: {
                service: 'SSM',
                action: 'putParameter',
                parameters: {
                    Name: '/CookieConfirmStaging/APP_VERSION_HASH',
                    Value: appVersionHash,
                    Type: 'String',
                    Overwrite: true,
                },
                // Zorgt dat er bij waarde-wijziging opnieuw wordt aangeroepen
                physicalResourceId: PhysicalResourceId.of(
                    `APP_VERSION_HASH-${appVersionHash}`,
                ),
            },
            onUpdate: {
                service: 'SSM',
                action: 'putParameter',
                parameters: {
                    Name: '/CookieConfirmStaging/APP_VERSION_HASH',
                    Value: appVersionHash,
                    Type: 'String',
                    Overwrite: true,
                },
                physicalResourceId: PhysicalResourceId.of(
                    `APP_VERSION_HASH-${appVersionHash}`,
                ),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
                resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
        });
    }

    getEnvironmentResource(): EnvironmentResource{
        return this.environmentResource;
    }
}
