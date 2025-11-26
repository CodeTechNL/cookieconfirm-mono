import {Construct} from "constructs"
import {SecurityGroup, Vpc} from "aws-cdk-lib/aws-ec2";
import {ApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {DockerImageAsset, Platform} from "aws-cdk-lib/aws-ecr-assets";
import {fromRoot} from "../../../helpers";

type TaskTypes = 'application' | 'queue' | 'scheduler' | 'init';

type PlatformDockerProps = {
    buildArgs: Record<string, string>
    taskType: TaskTypes
}

export class PlatformDockerResource extends DockerImageAsset {
    constructor(scope: Construct, id: string, props: PlatformDockerProps) {

        const {buildArgs, taskType} = props;
        
        const baseProps = {
            directory: fromRoot('platform'),
            file: `./docker/${taskType}/Dockerfile`,
            buildArgs: buildArgs,
            platform: Platform.LINUX_ARM64,
        };

        super(scope, id, baseProps);
    }
}
