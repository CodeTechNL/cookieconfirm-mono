import { Construct } from "constructs";
import { DockerImageAsset, Platform } from "aws-cdk-lib/aws-ecr-assets";
import { fromRoot } from "../../../helpers";

type PlatformDockerProps = {
    buildArgs: Record<string, string>;
    prefix: string;
};

type TaskType = "init" | "webserver" | "queue" | "scheduler";

export class PlatformDockerResource extends Construct {
    public readonly images: Record<TaskType, DockerImageAsset>;

    constructor(scope: Construct, id: string, props: PlatformDockerProps) {
        super(scope, id);

        const { buildArgs, prefix } = props;

        this.images = {} as Record<TaskType, DockerImageAsset>;

        (["webserver", "queue", "init"] as const).forEach((taskType) => {
            this.images[taskType] = new DockerImageAsset(this, `${prefix}${taskType}Image`, {
                directory: fromRoot("platform"),
                file: `./docker/webserver.Dockerfile`,
                buildArgs,
                platform: Platform.LINUX_ARM64,
                target: taskType,
            });
        });
    }

    getQueueImage() {
        return this.images["queue"];
    }

    getWebserverImage() {
        return this.images["webserver"];
    }

    getDeploymentImage() {
        return this.images["init"];
    }
}
