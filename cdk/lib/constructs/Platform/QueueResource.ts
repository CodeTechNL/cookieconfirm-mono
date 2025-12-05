import {Construct} from "constructs"
import {
    Cluster,
    Compatibility, ContainerImage,
    CpuArchitecture,
    DeploymentControllerType, FargatePlatformVersion, LogDriver,
    OperatingSystemFamily,
    TaskDefinition
} from 'aws-cdk-lib/aws-ecs';
import {Effect, Policy, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import {GatewayVpcEndpointAwsService, SecurityGroup, SubnetConfiguration, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {DockerImageAsset, Platform} from "aws-cdk-lib/aws-ecr-assets";
import {LogGroup} from "aws-cdk-lib/aws-logs";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {QueueProcessingFargateService} from "aws-cdk-lib/aws-ecs-patterns";
import {DatabaseInstance, IDatabaseInstance} from "aws-cdk-lib/aws-rds";
import {VpcResource} from "./VpcResource";

type QueueProps = {
    vpcResource: VpcResource;
    deploymentController: DeploymentControllerType,
    environment: Record<string, string>
    queueLogGroup: LogGroup
    queue: Queue
    image: DockerImageAsset
    securityGroup: SecurityGroup,
    resources: {
        db: IDatabaseInstance
    }
}

export class QueueResource extends QueueProcessingFargateService {
    constructor(scope: Construct, id: string, props: QueueProps) {

        const {vpcResource, environment, image, queueLogGroup, queue, securityGroup, resources} = props;

        const queueCluster = new Cluster(scope, 'queue-cluster', {
            clusterName: 'background-tasks',
            vpc: vpcResource.getVpc(),
        });

        const sqsPolicy = new Policy(scope, 'fargate-task-sqs-policy', {
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: ['sqs:*'],
                    resources: [queue.queueArn],
                }),
            ]
        });

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
                subnetGroupName: vpcResource.SUBNET_APPLICATION.name
            },
            scalingSteps: [
                { lower: 0, upper: 1, change: -1 },

                { lower: 1, upper: 51, change: +1 },

                { lower: 51, upper: 101, change: +2 },

                { lower: 101, upper: 151, change: +3 },

                { lower: 151, upper: 201, change: +4 },

                { lower: 201, change: +5 },
            ],
            minScalingCapacity: 0,
            maxScalingCapacity: 5,
            disableCpuBasedScaling: true,
        }

        super(scope, id, baseProps);

        this.setPermissions(image, queue, queueLogGroup, sqsPolicy, resources.db)
    }

    setPermissions(queueWorkerImage:DockerImageAsset, schedulerJobQueue: Queue, queueWorkerLogGroup: LogGroup, sqsPolicy: Policy, db: IDatabaseInstance){
        queueWorkerImage.repository.grantPull(this.taskDefinition.obtainExecutionRole());
        this.taskDefinition.taskRole.attachInlinePolicy(sqsPolicy);
        schedulerJobQueue.grantSendMessages(this.taskDefinition.obtainExecutionRole());
        schedulerJobQueue.grantPurge(this.taskDefinition.obtainExecutionRole());
        schedulerJobQueue.grantConsumeMessages(this.taskDefinition.obtainExecutionRole());

        queueWorkerLogGroup.grant(this.taskDefinition.obtainExecutionRole(), 'logs:CreateLogStream');
        queueWorkerLogGroup.grant(this.taskDefinition.obtainExecutionRole(), 'logs:PutLogEvents');
    }
}
