import {Stack, StackProps, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {EnvironmentResource} from "../../constructs/Platform/EnvironmentResource";

interface FoundationStackProps extends StackProps {
    APP_ENV: string;
}

export class FoundationStack extends Stack {

    private readonly environmentResource: EnvironmentResource;

    constructor(scope: Construct, id: string, props: FoundationStackProps) {
        super(scope, id, props);

        this.environmentResource = new EnvironmentResource(this, 'EnvironmentVariables', {
            APP_ENV: props.APP_ENV
        });
    }

    getEnvironmentResource(): EnvironmentResource{
        return this.environmentResource;
    }
}
