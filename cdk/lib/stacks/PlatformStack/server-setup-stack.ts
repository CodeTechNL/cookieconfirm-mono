import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Role, ServicePrincipal, User } from 'aws-cdk-lib/aws-iam';
import { AuthorizationToken } from 'aws-cdk-lib/aws-ecr';
import { SecurityGroup, } from 'aws-cdk-lib/aws-ec2';
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
import { CfnOutput, Environment, Fn } from 'aws-cdk-lib';
import { DomainResource } from '../../constructs/Platform/DomainSetupResource';
import { PlatformAssetsResource } from '../../constructs/Platform/PlatformAssetsResource';
import { PlatformStorageResource } from '../../constructs/Platform/S3/PlatformStorageResource';
import { QueueResource } from '../../constructs/Platform/QueueResource';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { EnvironmentResource } from '../../constructs/Platform/EnvironmentResource';
import { ApplicationType } from '../../types/ApplicationType';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { ApplicationProtocol, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

interface PlatformProps extends StackProps {
    certificateArn: string;
    baseDockerImage: string;
    version: string
    stage: ApplicationType
    environmentVariables: EnvironmentResource,
    prefix: string
    resourcePrefix: string
    env: Environment
}

export class ServerSetupStack extends Stack {
    constructor(scope: Construct, id: string, props: PlatformProps) {
        super(scope, id, props);

        const environment = props.environmentVariables;

        const { stage, prefix, resourcePrefix, version, baseDockerImage, certificateArn } = props;
        const region = props.env!.region as string;

        const assetsStorageBucket = new PlatformAssetsResource(this, `${prefix}PlatformAssetsResource`, {
            bucketName: `${resourcePrefix}-platform-assets`,
            domain: `${environment.getEnvironmentVars().CLOUDFRONT_ASSETS_DOMAIN}`,
            prefix,
            certificateArn: environment.getEnvironmentVars().DOMAIN_CERTIFICATE
        });

        const applicationStorageBucket = new PlatformStorageResource(this, `${prefix}PlatformApplicationStorageResource`, {
            bucketName: `${resourcePrefix}-platform-storage`,
        })

        const vpcResource = new VpcResource(this, `${prefix}Vpc`, {
            prefix
        });

        const user = new User(this, `${prefix}DeploymentUser`, {});

        AuthorizationToken.grantRead(user);

        const images = new PlatformDockerResource(this, `${prefix}ApplicationImage`, {
            buildArgs: this.getBuildArgs(true, version, baseDockerImage),
            prefix,
        });

        // SQS and QueueProcessingService
        const jobQueue = new Queue(this, `${prefix}JobQueue`, {
            queueName: `${resourcePrefix}-platform-queue`
        });

        const alb = new ApplicationLoadBalancerResource(this, `${prefix}ApplicationALB`, {
            vpcResource,
            prefix,
            certificateArn
        });



        // Fargate Service Things
        const cluster = new Cluster(this, `${prefix}ApplicationCluster`, {
            clusterName: `${resourcePrefix}-application`,
            vpc: vpcResource.getVpc(),
        });

        // LOG GROUPS
        const applicationLogGroup = new LogGroup(this, `${prefix}ApplicationLogGroup`, {
            logGroupName: `${resourcePrefix}-application`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 30,
        });

        applicationLogGroup.grant(user, 'logs:CreateLogGroup');

        const taskRole = new Role(this, `${prefix}FargateTaskRole`, {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: `${resourcePrefix}ApplicationFargateTaskRole`,
            description: 'Role that the api task definitions use to run the api code',
        });

        assetsStorageBucket.getBucket().grantReadWrite(taskRole);
        applicationStorageBucket.grantReadWrite(taskRole);

        const applicationServiceDefinition = new TaskDefinitionResource(this, `${prefix}ApplicationFargateServiceDefinition`, {
                taskRole: taskRole,
            },
        );

        const applicationSecurityGroup = new SecurityGroupResource(this, `${prefix}ApplicationSgResource`, {
            vpcResource,
            loadBalancerSecurityGroup: alb.getLoadBalancerSecurityGroup(),
            prefix
        });

        const queueTasksSecurityGroup = new SecurityGroup(this, `${prefix}BackgroundTaskSG`, {
            vpc: vpcResource.getVpc(),
            description: 'SecurityGroup into which scheduler ECS tasks will be deployed',
            allowAllOutbound: true,
        });

        const db = new PlatformDatabaseResource(this, `${prefix}PlatformDatabaseResource`, {
            prefix,
            allowGroups: [applicationSecurityGroup.getSecurityGroup(), queueTasksSecurityGroup],
            databaseName: `${resourcePrefix}-database`,
            vpcResource,
            APP_ENV: stage
        });

        const redisResource = new RedisCacheClusterResource(this, `${prefix}RedisCluster`, {
            allowConnections: [applicationSecurityGroup.getSecurityGroup(), queueTasksSecurityGroup],
            vpc: vpcResource.getVpc(),
        });

        const redis = redisResource.getRedis();

        environment.append('DB_HOST', db.getDatabase().dbInstanceEndpointAddress)
            .append('DB_READ_HOST', db.getDatabase().dbInstanceEndpointAddress)
            .append('DB_WRITE_HOST', db.getDatabase().dbInstanceEndpointAddress)
            .append('DB_PORT', db.getDatabase().dbInstanceEndpointPort)
            .append('AWS_BUCKET', applicationStorageBucket.bucketName)
            .append('AWS_BUCKET_ASSETS', assetsStorageBucket.getBucket().bucketName)
            .append('REDIS_HOST', redis.attrRedisEndpointAddress)
            .append('REDIS_PORT', `${redis.port}`)
            .append('SQS_PREFIX', `https://sqs.${props!.env!.region}.amazonaws.com/${this.account}`)
            .append('SQS_QUEUE', jobQueue.queueName);

        new CfnOutput(this, `${prefix}AppHashInfo`, {
            value: environment.getEnvironmentVars().APP_VERSION_HASH,
            description: 'App Version'
        })

        new CfnOutput(this, `${prefix}SchedulerJobQueueOutput`, {
            value: jobQueue.queueUrl,
            description: 'SQS Queue URL'
        })

        const initMigrateContainer = applicationServiceDefinition.addInitContainer(
            images.getDeploymentImage(),
            environment.getEnvironmentVars(),
            applicationLogGroup
        );
        applicationServiceDefinition.addApplicationContainer(
            images.getWebserverImage(),
            environment.getEnvironmentVars(),
            applicationLogGroup,
            initMigrateContainer
        );

        // Webserver
        new FargateContainerResource(this, `${prefix}ApplicationFargateService`, {
            applicationLogGroup: applicationLogGroup,
            httpTargetGroup: alb.getHttpTargetGroup(),
            image: images.getWebserverImage(),
            cluster,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            subnetApplicationName: vpcResource.SUBNET_APPLICATION.name,
            taskDefinition: applicationServiceDefinition.getTasDefinition(),
        });

        vpcResource.addHttpsConnection(queueTasksSecurityGroup, applicationSecurityGroup.getSecurityGroup());

        const queueWorkerLogGroup = new LogGroup(this, `${prefix}QueueWorkerLogGroup`, {
            logGroupName: `${prefix}-queue-worker`,
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 7
        });

        jobQueue.grantSendMessages(applicationServiceDefinition.getTasDefinition().obtainExecutionRole())

        new QueueResource(this, `${prefix}QueuedJobs`, {
            vpcResource,
            deploymentController: DeploymentControllerType.ECS,
            environment: environment.getEnvironmentVars(),
            image: images.getQueueImage(),
            queue: jobQueue,
            queueLogGroup: queueWorkerLogGroup,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            resources: {
                db: db.getDatabase()
            }
        })

        new DomainResource(this, `${prefix}DomainSetupResource`, {
            loadBalancer: alb.getLoadBalancer(),
            cloudfrontDistribution: assetsStorageBucket.getDistribution(),
            stage,
            region,
            prefix
        })
    }

    getBuildArgs(withArgs: boolean = false, version: string, baseDockerImage: string): any {

        let defaults = {
            BUILD_VERSION: version,
            BASE_IMAGE_URI: baseDockerImage,
        };

        if(withArgs) {
            return {
                ...defaults,
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_REGION: process.env.AWS_REGION,
            }
        }

        return defaults;
    }
}
