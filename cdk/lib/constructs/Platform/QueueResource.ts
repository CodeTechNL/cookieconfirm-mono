import {Construct} from "constructs"
import {
    Cluster,
    Compatibility, ContainerImage,
    CpuArchitecture,
    DeploymentControllerType, FargatePlatformVersion, LogDriver,
    OperatingSystemFamily,
    TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import {Policy, Role} from "aws-cdk-lib/aws-iam";
import {GatewayVpcEndpointAwsService, SecurityGroup, SubnetConfiguration, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {DockerImageAsset, Platform} from "aws-cdk-lib/aws-ecr-assets";
import {LogGroup} from "aws-cdk-lib/aws-logs";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {QueueProcessingFargateService} from "aws-cdk-lib/aws-ecs-patterns";
import {DatabaseInstance} from "aws-cdk-lib/aws-rds";

type QueueProps = {
    queueCluster: Cluster
    deploymentController: DeploymentControllerType,
    environment: Record<string, string>
    queueLogGroup: LogGroup
    queue: Queue
    subnetGroupName: string
    image: DockerImageAsset
    securityGroup: SecurityGroup,
    resources: {
        sqsPolicy: Policy,
        db: DatabaseInstance
    }
}

export class QueueResource extends QueueProcessingFargateService {
    constructor(scope: Construct, id: string, props: QueueProps) {

        const {environment, queueCluster, image, queueLogGroup, queue, securityGroup, subnetGroupName, resources} = props;

        // new QueueProcessingFargateService(scope, 's', {
        //     scalingSteps: [
        //         // 0?49 berichten in de queue -> 1 taak minder
        //         { lower: 0, upper: 49, change: -1 },
        //
        //         // 50?99 berichten -> +1 taak
        //         { lower: 50, upper: 99, change: +1 },
        //
        //         // 100?149 berichten -> +2 taken
        //         { lower: 100, upper: 149, change: +2 },
        //
        //         // 150?199 berichten -> +3 taken
        //         { lower: 150, upper: 199, change: +3 },
        //
        //         // 200?249 berichten -> +4 taken
        //         { lower: 200, upper: 249, change: +4 },
        //
        //         // 250+ berichten -> +5 taken
        //         { lower: 250, change: +5 },
        //     ],
        // })
        const baseProps = {
            assignPublicIp: false,
            circuitBreaker: {
                rollback: true
            },
            cluster: queueCluster,
            cpu: 256,
            deploymentController: {
                type: DeploymentControllerType.ECS,
            },
            enableLogging: true,
            environment,
            image: ContainerImage.fromDockerImageAsset(image),
            runtimePlatform: {
                cpuArchitecture: CpuArchitecture.ARM64,
                operatingSystemFamily: OperatingSystemFamily.LINUX,
            },
            logDriver: LogDriver.awsLogs({
                logGroup: queueLogGroup,
                streamPrefix: new Date().toLocaleDateString('en-ZA')
            }),
            memoryLimitMiB: 512,
            queue,

            platformVersion: FargatePlatformVersion.LATEST,
            securityGroups: [securityGroup],
            taskSubnets: {
                subnetGroupName: subnetGroupName
            },
            scalingSteps: [
                // 0 berichten -> probeer 1 task af te schalen
                { lower: 0, upper: 1, change: -1 },

                // 1?50 berichten  -> +1 task
                { lower: 1, upper: 51, change: +1 },

                // 51?100 berichten -> +2 tasks
                { lower: 51, upper: 101, change: +2 },

                // 101?150 berichten -> +3 tasks
                { lower: 101, upper: 151, change: +3 },

                // 151?200 berichten -> +4 tasks
                { lower: 151, upper: 201, change: +4 },

                // 201+ berichten -> +5 tasks
                { lower: 201, change: +5 },
            ],
            minScalingCapacity: 0,
            maxScalingCapacity: 5,
            disableCpuBasedScaling: true,
        }

        super(scope, id, baseProps);

        this.setPermissions(image, queue, queueLogGroup, resources.sqsPolicy, resources.db)
    }

    setPermissions(queueWorkerImage:DockerImageAsset, schedulerJobQueue: Queue, queueWorkerLogGroup: LogGroup, sqsPolicy: Policy, db: DatabaseInstance){
        queueWorkerImage.repository.grantPull(this.taskDefinition.obtainExecutionRole());
        this.taskDefinition.taskRole.attachInlinePolicy(sqsPolicy);
        schedulerJobQueue.grantSendMessages(this.taskDefinition.obtainExecutionRole());
        schedulerJobQueue.grantPurge(this.taskDefinition.obtainExecutionRole());
        schedulerJobQueue.grantConsumeMessages(this.taskDefinition.obtainExecutionRole());

        queueWorkerLogGroup.grant(this.taskDefinition.obtainExecutionRole(), 'logs:CreateLogStream');
        queueWorkerLogGroup.grant(this.taskDefinition.obtainExecutionRole(), 'logs:PutLogEvents');
    }
}
