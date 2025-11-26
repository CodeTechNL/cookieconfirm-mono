import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Role, ServicePrincipal, User } from 'aws-cdk-lib/aws-iam';
import { AuthorizationToken } from 'aws-cdk-lib/aws-ecr';
import { SecurityGroup,} from 'aws-cdk-lib/aws-ec2';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Cluster, DeploymentControllerType } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { PlatformDockerResource } from '../../constructs/Platform/ECR/PlatformDockerResource';
import { ApplicationTargetGroupResource } from '../../constructs/Platform/ApplicationTargetGroupResource';
import { TaskDefinitionResource } from '../../constructs/Platform/TaskDefinitionResource';
import { ApplicationLoadBalancerResource } from '../../constructs/Platform/ApplicationLoadBalancerResource';
import { VpcResource } from '../../constructs/Platform/VpcResource';
import { FargateContainerResource } from '../../constructs/Platform/FargateContainerResource';
import { RedisCacheClusterResource } from '../../constructs/Platform/RedisCacheClusterResource';
import { PlatformDatabaseResource } from '../../constructs/Platform/RDS/PlatformDatabaseResource';
import { SecurityGroupResource } from '../../constructs/Platform/SecurityGroupResource';
import {CfnOutput} from "aws-cdk-lib";
import {DomainResource} from "../../constructs/Platform/DomainSetupResource";
import {PlatformAssetsResource} from "../../constructs/Platform/PlatformAssetsResource";
import {PlatformStorageResource} from "../../constructs/Platform/S3/PlatformStorageResource";
import {QueueResource} from "../../constructs/Platform/QueueResource";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {EnvironmentResource} from "../../constructs/Platform/EnvironmentResource";
import {ApplicationType} from "../../types/ApplicationType";

interface PlatformProps extends StackProps {
    APP_ENV: string;
    stage: ApplicationType
    environmentVariables: EnvironmentResource
}

export class ServerSetupStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformProps) {
        super(scope, id, props);

        const environment = props.environmentVariables;

        const {stage} = props;

        const assetsStorageBucket = new PlatformAssetsResource(this, 'PlatformAssetsResource', {
            bucketName: 'platform-assets-stack-bucket',
        });

        const applicationStorageBucket = new PlatformStorageResource(this, 'PlatformApplicationStorageResource', {
            bucketName: "platform-storage-stack-bucket-cc"
        })

        const vpcResource = new VpcResource(this, 'my-vpc');

        const vpc = vpcResource.getVpc();

        const user = new User(this, 'deployment-user', {});
        AuthorizationToken.grantRead(user);

        const images = new PlatformDockerResource(this, 'applicationImage', {
            buildArgs: this.getBuildArgs(true),
        }).getImages();

        // SQS and QueueProcessingService
        const schedulerJobQueue = new Queue(this, 'job-queue', {
            queueName: 'scheduler-job-queue'
        });

        const alb = new ApplicationLoadBalancerResource(this, 'application-ALB', {
            vpc,
            subnetName: vpcResource.SUBNET_APPLICATION.name,
        });

        const loadBalancerSecurityGroup = new SecurityGroup(this, 'load-balancer-SG', {
            vpc,
            allowAllOutbound: true,
        });

        alb.addSecurityGroup(loadBalancerSecurityGroup);

        const listener = alb.addListener('alb-target-group', {
            open: true,
            port: 80,
        });

        const targetGroupHttp = new ApplicationTargetGroupResource(this, 'alb-target-group', {
            vpc: vpc,
        });

        listener.addTargetGroups('alb-listener-target-group', {
            targetGroups: [targetGroupHttp],
        });

        // Fargate Service Things
        const cluster = new Cluster(this, 'application-cluster', {
            clusterName: 'application',
            vpc,
        });

        // LOG GROUPS
        const applicationLogGroup = new LogGroup(this, 'application-log-group', {
            logGroupName: 'application',
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 30,
        });

        applicationLogGroup.grant(user, 'logs:CreateLogGroup');

        const taskRole = new Role(this, 'fargate-task-role', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: 'application-fargate-task-role',
            description: 'Role that the api task definitions use to run the api code',
        });

        assetsStorageBucket.getBucket().grantReadWrite(taskRole);
        applicationStorageBucket.grantReadWrite(taskRole);

        const applicationServiceDefinition = new TaskDefinitionResource(
            this,
            'application-fargate-service-definition',
            {
                taskRole: taskRole,
            },
        );

        const applicationSecurityGroup = new SecurityGroupResource(this, 'application-SG', {
            vpc,
            description: 'SecurityGroup into which application ECS tasks will be deployed',
            connections: vpcResource.getApplicationVpcEndpoints(),
            loadBalancerSecurityGroup,
        });

        const backgroundTasksSecurityGroup = new SecurityGroup(this, 'background-task-SG', {
            vpc,
            description: 'SecurityGroup into which scheduler ECS tasks will be deployed',
            allowAllOutbound: true,
        });

        const db = new PlatformDatabaseResource(this, 'Platform-DatabaseResource', {
            allowGroups: [applicationSecurityGroup.getSecurityGroup(), backgroundTasksSecurityGroup],
            databaseName: 'cookie-confirm-sample',
            isolatedSubnetName: vpcResource.SUBNET_ISOLATED.name,
            vpc,
            APP_ENV: props.APP_ENV,
        });

        const redisResource = new RedisCacheClusterResource(this, 'redis-cluster', {
            allowConnections: [applicationSecurityGroup.getSecurityGroup(), backgroundTasksSecurityGroup],
            vpc,
        });

        const redis = redisResource.getRedis();

        environment.append('DB_HOST', db.getDatabase().dbInstanceEndpointAddress)
            .append('DB_READ_HOST', db.getDatabase().dbInstanceEndpointAddress)
            .append('DB_WRITE_HOST', db.getDatabase().dbInstanceEndpointAddress)
            .append('DB_PORT', db.getDatabase().dbInstanceEndpointPort)
            .append('AWS_BUCKET', applicationStorageBucket.bucketName)
            .append('REDIS_HOST', redis.attrRedisEndpointAddress)
            .append('REDIS_PORT', `${redis.port}`)
            .append('SQS_PREFIX', `https://sqs.${props!.env!.region}.amazonaws.com/${this.account}`)
            .append('SQS_QUEUE', schedulerJobQueue.queueName);

        new CfnOutput(this, 'scheduler-job-queue-output', {
            value: schedulerJobQueue.queueUrl,
            description: 'SQS Queue URL'
        })

        const initMigrateContainer = applicationServiceDefinition.addInitContainer(images.init, environment.getEnvironmentVars(), applicationLogGroup);
        applicationServiceDefinition.addApplicationContainer(images.application, environment.getEnvironmentVars(), applicationLogGroup, initMigrateContainer);

        new FargateContainerResource(this, 'application-fargate-service', {
            applicationLogGroup: applicationLogGroup,
            httpTargetGroup: targetGroupHttp,
            image: images.application,
            cluster,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            subnetApplicationName: vpcResource.SUBNET_APPLICATION.name,
            taskDefinition: applicationServiceDefinition.getTasDefinition(),
        });

        vpcResource.addHttpsConnection(backgroundTasksSecurityGroup, applicationSecurityGroup.getSecurityGroup());

        const queueWorkerLogGroup = new LogGroup(this, 'queue-worker-log-group', {
            logGroupName: 'queue-worker',
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 7
        });

        schedulerJobQueue.grantSendMessages(applicationServiceDefinition.getTasDefinition().obtainExecutionRole())

        new QueueResource(this, 'queued-jobs', {
            vpcResource,
            deploymentController: DeploymentControllerType.ECS,
            environment: environment.getEnvironmentVars(),
            image: images.queue,
            queue: schedulerJobQueue,
            queueLogGroup: queueWorkerLogGroup,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            resources: {
                db: db.getDatabase()
            }
        })

        new DomainResource(this, 'DomainSetupResource', {
            loadBalancer: alb,
            stage: stage
        })
    }

    getBuildArgs(withArgs: boolean = false): any {
        return !withArgs
            ? {}
            : {
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_REGION: process.env.AWS_REGION,
            };
    }
}
