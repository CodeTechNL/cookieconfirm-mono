import {Stack, StackProps, Environment} from "aws-cdk-lib"
import {Construct} from "constructs"
import {ServerSetupStack} from "./PlatformStack/server-setup-stack";
import {FoundationStack} from "./PlatformStack/foundation-stack";
import {env, toPascalCase} from "../helpers";
import {ApplicationType} from "../types/ApplicationType";

interface PlatformAssetsStackProps extends StackProps {
    version: string
    env: Environment
    cdk: {
        name: string
        stage: ApplicationType
        baseDockerImage: string
        certificateArn: string
    },
}

export class PlatformStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props)

        const {name, stage, baseDockerImage, certificateArn} = props.cdk;
        const {env, version} = props;

        const idPrefix = toPascalCase(name) + toPascalCase(stage);
        const resourcePrefix = `${name}-${stage}`;

        const foundationStack = new FoundationStack(scope, `FoundationStack`, {
            env,
            prefix: idPrefix,
            version
        })

        const serverSetupStack = new ServerSetupStack(scope, `ServerSetupStack`, {
            certificateArn,
            baseDockerImage,
            version,
            stage,
            prefix: idPrefix,
            resourcePrefix,
            env,
            environmentVariables: foundationStack.getEnvironmentResource()
        })

        serverSetupStack.addDependency(foundationStack);
    }
}
