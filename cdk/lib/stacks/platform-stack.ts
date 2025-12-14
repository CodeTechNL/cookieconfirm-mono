import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib/core";
import { Role, ServicePrincipal, User } from "aws-cdk-lib/aws-iam";
import { AuthorizationToken } from "aws-cdk-lib/aws-ecr";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Cluster, DeploymentControllerType } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";
import { PlatformDockerResource } from "../constructs/Platform/ECR/PlatformDockerResource";
import { TaskDefinitionResource } from "../constructs/Platform/TaskDefinitionResource";
import { ApplicationLoadBalancerResource } from "../constructs/Platform/ApplicationLoadBalancerResource";
import { VpcResource } from "../constructs/Platform/VpcResource";
import { FargateContainerResource } from "../constructs/Platform/FargateContainerResource";
import { RedisCacheClusterResource } from "../constructs/Platform/RedisCacheClusterResource";
import { PlatformDatabaseResource } from "../constructs/Platform/RDS/PlatformDatabaseResource";
import { SecurityGroupResource } from "../constructs/Platform/SecurityGroupResource";
import { CfnOutput, Environment, Fn } from "aws-cdk-lib";
import { PlatformAssetsResource } from "../constructs/Platform/PlatformAssetsResource";
import { PlatformStorageResource } from "../constructs/Platform/S3/PlatformStorageResource";
import { QueueResource } from "../constructs/Platform/QueueResource";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { EnvironmentResource } from "../constructs/Platform/EnvironmentResource";
import { JumpboxResource } from "../constructs/Platform/JumpboxResource";
import {DomainResource} from "../constructs/Platform/DomainSetupResource";
import {ApplicationType} from "../types/ApplicationType";
import {EnvironmentVariables} from "../patterns/EnvironmentVariables";

interface PlatformAssetsStackProps extends StackProps {
    version: string;
    env: Environment;
    idPrefix: string;
    resourcePrefix: string;
    cdk: {
        baseDockerImage: string;
    }
}

export class PlatformStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformAssetsStackProps) {
        super(scope, id, props);
        const { version, idPrefix, resourcePrefix, env } = props;

        const envPattern = new EnvironmentVariables(this, `${idPrefix}EnvironmentVariables`, {
            idPrefix, resourcePrefix, version
        })

        const { baseDockerImage } = props.cdk;

        const environment = envPattern.getEnvironmentResource();
        const config = envPattern.getEnvironmentResource().getEnvironmentVars()

        const assetsStorageBucket = new PlatformAssetsResource(this, `${idPrefix}PlatformAssetsResource`, {
            bucketName: `${resourcePrefix}-platform-assets`,
            domain: config.PLATFORM_ASSETS_URL,
            prefix: idPrefix,
            certificateArn: config.CERTIFICATE_ARN,
        });

        const applicationStorageBucket = new PlatformStorageResource(this, `${idPrefix}PlatformApplicationStorageResource`, {
            bucketName: `${resourcePrefix}-platform-storage`,
        });

        const vpcResource = new VpcResource(this, `${idPrefix}Vpc`, {
            prefix: idPrefix,
        });

        const user = new User(this, `${idPrefix}DeploymentUser`, {});

        AuthorizationToken.grantRead(user);

        const images = new PlatformDockerResource(this, `${idPrefix}ApplicationImage`, {
            buildArgs: this.getBuildArgs(true, version, baseDockerImage),
            prefix: idPrefix,
        });

        // SQS and QueueProcessingService
        const jobQueue = new Queue(this, `${idPrefix}JobQueue`, {
            queueName: `${resourcePrefix}-platform-queue`,
        });

        const alb = new ApplicationLoadBalancerResource(this, `${idPrefix}ApplicationALB`, {
            vpcResource,
            prefix: idPrefix,
            certificateArn: config.REGION_CERTIFICATE_ARN,
        });

        // Fargate Service Things
        const cluster = new Cluster(this, `${idPrefix}ApplicationCluster`, {
            clusterName: `${resourcePrefix}-application`,
            vpc: vpcResource.getVpc(),
        });

        // LOG GROUPS
        const applicationLogGroup = new LogGroup(this, `${idPrefix}ApplicationLogGroup`, {
            logGroupName: `${resourcePrefix}-application`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 30,
        });

        applicationLogGroup.grant(user, "logs:CreateLogGroup");

        const taskRole = new Role(this, `${idPrefix}FargateTaskRole`, {
            assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
            roleName: `${resourcePrefix}ApplicationFargateTaskRole`,
            description: "Role that the api task definitions use to run the api code",
        });

        assetsStorageBucket.getBucket().grantReadWrite(taskRole);
        applicationStorageBucket.grantReadWrite(taskRole);

        const applicationServiceDefinition = new TaskDefinitionResource(this, `${idPrefix}ApplicationFargateServiceDefinition`, {
            taskRole,
        });

        const applicationSecurityGroup = new SecurityGroupResource(this, `${idPrefix}ApplicationSgResource`, {
            vpcResource,
            loadBalancerSecurityGroup: alb.getLoadBalancerSecurityGroup(),
            prefix: idPrefix,
        });

        const queueTasksSecurityGroup = new SecurityGroup(this, `${idPrefix}BackgroundTaskSG`, {
            vpc: vpcResource.getVpc(),
            description: "SecurityGroup into which scheduler ECS tasks will be deployed",
            allowAllOutbound: true,
        });

        const db = new PlatformDatabaseResource(this, `${idPrefix}PlatformDatabaseResource`, {
            prefix: idPrefix,
            allowGroups: [applicationSecurityGroup.getSecurityGroup(), queueTasksSecurityGroup],
            databaseName: `${resourcePrefix}-database`,
            vpcResource,
            APP_ENV: config.APP_ENV,
        });

        const redisResource = new RedisCacheClusterResource(this, `${idPrefix}RedisCluster`, {
            allowConnections: [applicationSecurityGroup.getSecurityGroup(), queueTasksSecurityGroup],
            vpc: vpcResource.getVpc(),
        });

        const redis = redisResource.getRedis();

        environment
            .append("DB_HOST", db.getDatabase().dbInstanceEndpointAddress)
            .append("DB_READ_HOST", db.getDatabase().dbInstanceEndpointAddress)
            .append("DB_WRITE_HOST", db.getDatabase().dbInstanceEndpointAddress)
            .append("DB_PORT", db.getDatabase().dbInstanceEndpointPort)
            .append("AWS_BUCKET", applicationStorageBucket.bucketName)
            .append("AWS_BUCKET_ASSETS", assetsStorageBucket.getBucket().bucketName)
            .append("REDIS_HOST", redis.attrRedisEndpointAddress)
            .append("REDIS_PORT", `${redis.port}`)
            .append("SQS_PREFIX", `https://sqs.${props!.env!.region}.amazonaws.com/${this.account}`)
            .append("SQS_QUEUE", jobQueue.queueName);

        new CfnOutput(this, `${idPrefix}AppHashInfo`, {
            value: config.APP_VERSION_HASH,
            description: "App Version",
        });

        new CfnOutput(this, `${idPrefix}SchedulerJobQueueOutput`, {
            value: jobQueue.queueUrl,
            description: "SQS Queue URL",
        });

        const initMigrateContainer = applicationServiceDefinition.addInitContainer(
            images.getDeploymentImage(),
            config,
            applicationLogGroup,
        );
        applicationServiceDefinition.addApplicationContainer(
            images.getWebserverImage(),
            config,
            applicationLogGroup,
            initMigrateContainer,
        );

        // Webserver
        new FargateContainerResource(this, `${idPrefix}ApplicationFargateService`, {
            applicationLogGroup: applicationLogGroup,
            httpTargetGroup: alb.getHttpTargetGroup(),
            image: images.getWebserverImage(),
            cluster,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            subnetApplicationName: vpcResource.SUBNET_APPLICATION.name,
            taskDefinition: applicationServiceDefinition.getTasDefinition(),
        });

        vpcResource.addHttpsConnection(queueTasksSecurityGroup, applicationSecurityGroup.getSecurityGroup());

        const queueWorkerLogGroup = new LogGroup(this, `${idPrefix}QueueWorkerLogGroup`, {
            logGroupName: `${idPrefix}-queue-worker`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 7,
        });

        jobQueue.grantSendMessages(applicationServiceDefinition.getTasDefinition().obtainExecutionRole());

        new QueueResource(this, `${idPrefix}QueuedJobs`, {
            vpcResource,
            deploymentController: DeploymentControllerType.ECS,
            environment: config,
            image: images.getQueueImage(),
            queue: jobQueue,
            queueLogGroup: queueWorkerLogGroup,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            resources: {
                db: db.getDatabase(),
            },
        });

        new JumpboxResource(this, `${idPrefix}JumpBoxResource`, {
            vpc: vpcResource.getVpc(),
            rdsSecurityGroup: db.getSecurityGroup(),
        });

        new DomainResource(this, `${idPrefix}DomainSetupResource`, {
            loadBalancer: alb.getLoadBalancer(),
            cloudfrontDistribution: assetsStorageBucket.getDistribution(),
            stage: config.APP_ENV as ApplicationType,
            region: env.region!,
            idPrefix,
            environmentResource: environment
        });
    }

    getBuildArgs(withArgs: boolean = false, version: string, baseDockerImage: string): any {
        let defaults = {
            BUILD_VERSION: version,
            BASE_IMAGE_URI: baseDockerImage,
        };

        if (withArgs) {
            return {
                ...defaults,
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_REGION: process.env.AWS_REGION,
            };
        }

        return defaults;
    }
}
