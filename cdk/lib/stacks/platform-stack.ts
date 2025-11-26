import {Stack, StackProps, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {ServerSetupStack} from "./PlatformStack/server-setup-stack";
import {FoundationStack} from "./PlatformStack/foundation-stack";
import {env} from "../helpers";

interface PlatformAssetsStackProps extends StackProps {
    env: Environment
    APP_ENV: string
}

/**
 * - Queue
 * - Lambda
 * - Event Bus
 * - Event Connection
 * - Event API Destination
 */
export class PlatformStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props)

        const {env, APP_ENV} = props;

        const foundationStack = new FoundationStack(scope, 'FoundationStack', {
            env,
            APP_ENV
        })

        const serverSetupStack = new ServerSetupStack(scope, 'ServerSetupStack', {
            stage: 'staging',
            environmentVariables: foundationStack.getEnvironmentResource(),
            env,
            APP_ENV
        })

        serverSetupStack.addDependency(foundationStack);
    }
}
