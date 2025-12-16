import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {Construct} from "constructs";
import {AppendableVars, EnvKey} from "../../enums/StaticEnvironmentVariables";

type StringParameterProps = {
    parameterName: AppendableVars|EnvKey;
    stringValue: string;
    idPrefix: string
}

export class UpsertSsmParameter extends StringParameter {
    constructor(scope: Construct, props: StringParameterProps) {
        const {idPrefix, parameterName, stringValue} = props;

        super(scope, `${idPrefix}-${parameterName}`, {
            parameterName: `/${idPrefix}/${parameterName}`,
            stringValue
        });
    }
}