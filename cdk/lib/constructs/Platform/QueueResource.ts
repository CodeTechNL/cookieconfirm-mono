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
import {DockerImageAsset} from "aws-cdk-lib/aws-ecr-assets";
import {LogGroup} from "aws-cdk-lib/aws-logs";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {QueueProcessingFargateService} from "aws-cdk-lib/aws-ecs-patterns";
import {DatabaseInstance} from "aws-cdk-lib/aws-rds";

type QueueProps = {
    backgroundCluster: Cluster
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

        const {environment, backgroundCluster, image, queueLogGroup, queue, securityGroup, subnetGroupName, resources} = props;

        const baseProps = {
            assignPublicIp: false,
            circuitBreaker: {
                rollback: true
            },
            cluster: backgroundCluster,
            cpu: 256,
            deploymentController: {
                type: DeploymentControllerType.ECS
            },
            enableLogging: true,
            environment,
            image: ContainerImage.fromDockerImageAsset(image),
            logDriver: LogDriver.awsLogs({
                logGroup: queueLogGroup,
                streamPrefix: new Date().toLocaleDateString('en-ZA')
            }),
            maxScalingCapacity: 2,
            memoryLimitMiB: 512,
            queue,
            platformVersion: FargatePlatformVersion.LATEST,
            securityGroups: [securityGroup],
            taskSubnets: {
                subnetGroupName: subnetGroupName
            }
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
        db.grantConnect(this.taskDefinition.taskRole);
    }
}
