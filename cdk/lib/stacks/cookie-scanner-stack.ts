import {Stack, StackProps, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {ServerSetupStack} from "./PlatformStack/server-setup-stack";
import {FoundationStack} from "./PlatformStack/foundation-stack";
import {env, toPascalCase} from "../helpers";
import {ApplicationType} from "../types/ApplicationType";
import {CookieScannerSetupStack} from "./CookieScanner/cookie-scanner-setup-stack";

interface PlatformAssetsStackProps extends StackProps {
    env: Environment
    cdk: {
        name: string
        stage: ApplicationType
    },
}

export class CookieScannerStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props)

        const {name, stage} = props.cdk;
        const {env} = props;

        const idPrefix = toPascalCase(name) + toPascalCase(stage);

        const foundationStack = new FoundationStack(scope, `${id}FoundationStack`, {
            env,
            prefix: idPrefix,
            version: 'sample'
        })

        const cookieScannerSetupStack = new CookieScannerSetupStack(scope, `CookieScannerSetupStack`, {
            env,
            environmentVariables: foundationStack.getEnvironmentResource()
        })

        cookieScannerSetupStack.addDependency(foundationStack);
    }
}
