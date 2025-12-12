import { Construct } from "constructs";
import {
    Compatibility,
    ContainerDefinition,
    ContainerDefinitionOptions,
    ContainerDependencyCondition,
    ContainerImage,
    CpuArchitecture,
    LogDriver,
    Protocol as EcsProtocol,
    OperatingSystemFamily,
    TaskDefinition,
} from "aws-cdk-lib/aws-ecs";
import { Role } from "aws-cdk-lib/aws-iam";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { DefaultEnvironmentVariablesInterface } from "../../interfaces/DefaultEnvironmentVariablesInterface";
import { LogGroup } from "aws-cdk-lib/aws-logs";

type TaskDefinitionProps = {
    taskRole: Role;
};

export class TaskDefinitionResource extends Construct {
    private readonly taskDefinition: TaskDefinition;

    constructor(scope: Construct, id: string, props: TaskDefinitionProps) {
        super(scope, id);

        const { taskRole } = props;

        this.taskDefinition = new TaskDefinition(scope, id + "-resource", {
            compatibility: Compatibility.EC2_AND_FARGATE,
            cpu: "256",
            family: "api-task-family",
            memoryMiB: "512",
            taskRole,
            runtimePlatform: {
                cpuArchitecture: CpuArchitecture.ARM64,
                operatingSystemFamily: OperatingSystemFamily.LINUX,
            },
        });
    }

    addInitContainer(image: DockerImageAsset, environment: DefaultEnvironmentVariablesInterface, logGroup: LogGroup) {
        return this.taskDefinition.addContainer("init-migrate", {
            essential: false,
            image: ContainerImage.fromDockerImageAsset(image),
            environment,
            logging: LogDriver.awsLogs({
                logGroup,
                streamPrefix: "init-migrate",
            }),
        });
    }

    addApplicationContainer(
        image: DockerImageAsset,
        environment: DefaultEnvironmentVariablesInterface,
        applicationLogGroup: LogGroup,
        initContainer: ContainerDefinition,
    ) {
        const applicationContainer = this.taskDefinition.addContainer("app-container", {
            cpu: 256,
            environment,
            essential: true,
            image: ContainerImage.fromDockerImageAsset(image),
            logging: LogDriver.awsLogs({
                logGroup: applicationLogGroup,
                streamPrefix: new Date().toLocaleDateString("nl-NL"),
            }),
            memoryLimitMiB: 512,
        });

        // App-container pas starten NA succesvolle init-migrate
        applicationContainer.addContainerDependencies({
            container: initContainer,
            condition: ContainerDependencyCondition.SUCCESS,
        });

        applicationContainer.addPortMappings({
            containerPort: 80,
            hostPort: 80,
            protocol: EcsProtocol.TCP,
        });

        return applicationContainer;
    }

    getTasDefinition() {
        return this.taskDefinition;
    }
}
