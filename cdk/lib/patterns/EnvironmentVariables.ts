import { Construct } from "constructs";
import {EnvironmentResource} from "../constructs/Platform/EnvironmentResource";
import {CfnOutput, Environment} from "aws-cdk-lib";

type EnvironmentProps = {
    idPrefix: string;
    resourcePrefix: string;
    version?: string
    env: Environment
};

export class EnvironmentVariables extends Construct {
    private readonly environmentResource: EnvironmentResource;

    constructor(scope: Construct, id: string, props: EnvironmentProps) {
        super(scope, id);

        const { idPrefix, resourcePrefix, version, env } = props;

        new CfnOutput(this, `${idPrefix}PrefixValue`, {
            value: idPrefix,
        });

        this.environmentResource = new EnvironmentResource(this, `${idPrefix}EnvironmentVariables`, {
            env,
            idPrefix,
            resourcePrefix,
            version,
        });
    }

    getEnvironmentResource(): EnvironmentResource {
        return this.environmentResource;
    }
}
