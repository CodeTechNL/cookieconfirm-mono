import {Stack, StackProps, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {ServerSetupStack} from "./PlatformStack/server-setup-stack";
import {PlatformAssetsStack} from "./PlatformStack/platform-assets-stack";
import {DomainSetupStack} from "./PlatformStack/domain-setup-stack";

interface PlatformAssetsStackProps extends StackProps {
    domain: string
    subdomain: string
    env: Environment
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

        const {domain, subdomain, env} = props;

        const platformAssetsStack = new PlatformAssetsStack(scope, 'PlatformAssetsStack', {
            env,
        });

        const serverSetupStack = new ServerSetupStack(scope, 'ServerSetupStack', {
            APP_ENV: 'staging',
            bucket: platformAssetsStack.getBucket(),
            env
        })

        const domainSetupStack = new DomainSetupStack(scope, 'DomainSetupStack', {
            env,
            loadBalancer: serverSetupStack.getApplicationLoadBalancer(),
            domain,
            subdomain
        })

        serverSetupStack.addDependency(platformAssetsStack)
        domainSetupStack.addDependency(serverSetupStack);
    }
}
