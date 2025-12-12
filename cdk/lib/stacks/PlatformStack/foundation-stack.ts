import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EnvironmentResource } from "../../constructs/Platform/EnvironmentResource";
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "aws-cdk-lib/custom-resources";

interface FoundationStackProps extends StackProps {
  idPrefix: string;
  resourcePrefix: string;
  version: string;
}

export class FoundationStack extends Stack {
  private readonly environmentResource: EnvironmentResource;

  constructor(scope: Construct, id: string, props: FoundationStackProps) {
    super(scope, id, props);

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
