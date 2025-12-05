import {Stack, StackProps, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {FoundationStack} from "./PlatformStack/foundation-stack";
import {CookieScannerSetupStack} from "./CookieScanner/cookie-scanner-setup-stack";
import {EnvironmentResource} from "../constructs/Platform/EnvironmentResource";

interface PlatformAssetsStackProps extends StackProps {
    env: Environment
    idPrefix: string
    environmentVariables: EnvironmentResource
}

export class CookieScannerStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props)

        const {idPrefix, env, environmentVariables} = props;

        new CookieScannerSetupStack(scope, `CookieScannerSetupStack`, {
            stackName: `${idPrefix}CookieScannerSetupStack`,
            idPrefix,
            env,
            environmentVariables: environmentVariables
        })
    }
}
