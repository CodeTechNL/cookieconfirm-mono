import { Construct } from 'constructs';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { fromRoot } from '../../../helpers';

type PlatformDockerProps = {
    buildArgs: Record<string, string>;
};

type TaskType = 'application' | 'queue' | 'init';

export class PlatformDockerResource extends Construct {
    public readonly images: Record<TaskType, DockerImageAsset>;

    constructor(scope: Construct, id: string, props: PlatformDockerProps) {
        super(scope, id);

        const { buildArgs } = props;

        this.images = {} as Record<TaskType, DockerImageAsset>;

        (['application', 'queue', 'init'] as const).forEach((taskType) => {
            this.images[taskType] = new DockerImageAsset(this, `${taskType}Image`, {
                directory: fromRoot('platform'),
                file: `./docker/${taskType}/Dockerfile`,
                buildArgs,
                platform: Platform.LINUX_ARM64,
            });
        });
    }

    getImages(){
        return this.images;
    }
}
