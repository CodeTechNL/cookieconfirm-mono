import { Construct } from "constructs";
import {
    Compatibility,
    ContainerDefinition,
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
import { LogGroup } from "aws-cdk-lib/aws-logs";
import {EnvironmentVars} from "../../enums/StaticEnvironmentVariables";

type TaskDefinitionProps = {
    taskRole: Role;
    resourcePrefix: string;
};

export class TaskDefinitionResource extends Construct {
    private readonly taskDefinition: TaskDefinition;
    private readonly resourcePrefix: string;

    constructor(scope: Construct, id: string, props: TaskDefinitionProps) {
        super(scope, id);

        const { taskRole, resourcePrefix } = props;

        this.resourcePrefix = resourcePrefix;

        this.taskDefinition = new TaskDefinition(scope, id + "-resource", {
            compatibility: Compatibility.EC2_AND_FARGATE,
            cpu: "256",
            family: `${this.resourcePrefix}-api-task-family`,
            memoryMiB: "512",
            taskRole,
            runtimePlatform: {
                cpuArchitecture: CpuArchitecture.ARM64,
                operatingSystemFamily: OperatingSystemFamily.LINUX,
            },
        });
    }

    addInitContainer(image: DockerImageAsset, environment: EnvironmentVars, logGroup: LogGroup) {
        return this.taskDefinition.addContainer(`${this.resourcePrefix}-init-migrate`, {
            essential: false,
            image: ContainerImage.fromDockerImageAsset(image),
            environment,
            logging: LogDriver.awsLogs({
                logGroup,
                streamPrefix: `${this.resourcePrefix}-init-migrate`,
            }),
        });
    }

    addApplicationContainer(
        image: DockerImageAsset,
        environment: EnvironmentVars,
        applicationLogGroup: LogGroup,
        initContainer: ContainerDefinition,
    ) {
        const applicationContainer = this.taskDefinition.addContainer(`${this.resourcePrefix}-app-container`, {
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
