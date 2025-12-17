import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {Construct} from "constructs";
import {EnvKey, SsmEnvVars} from "../../enums/StaticEnvironmentVariables";

export class GetSsmParameter {

    static get(
        scope: Construct,
        idPrefix: string,
        name: EnvKey,
    ): string {
        return StringParameter.valueFromLookup(scope, `/${idPrefix}/${name}`);
    }
}