import { DockerBuildSecret, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib/core';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal, User } from 'aws-cdk-lib/aws-iam';
import { AuthorizationToken } from 'aws-cdk-lib/aws-ecr';
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';
import {
    GatewayVpcEndpointAwsService,
    InstanceClass,
    InstanceSize,
    InstanceType,
    InterfaceVpcEndpointAwsService,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import {
    Cluster,
    Compatibility,
    ContainerImage,
    DeploymentControllerType,
    FargatePlatformVersion,
    FargateService,
    TaskDefinition,
    Protocol as EcsProtocol,
    LogDriver,
    OperatingSystemFamily,
    CpuArchitecture,
    Secret,
    ContainerDependencyCondition,
} from 'aws-cdk-lib/aws-ecs';
import {
    ApplicationLoadBalancer,
    ApplicationProtocol,
    ApplicationTargetGroup,
    Protocol,
    TargetType,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Accelerator, HealthCheckProtocol } from 'aws-cdk-lib/aws-globalaccelerator';
import { ApplicationLoadBalancerEndpoint } from 'aws-cdk-lib/aws-globalaccelerator-endpoints';
import { Construct } from 'constructs';
import { fromRoot } from '../../helpers';
import { DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion } from 'aws-cdk-lib/aws-rds';
import { CfnCacheCluster, CfnSubnetGroup } from 'aws-cdk-lib/aws-elasticache';
import { PlatformDockerResource } from '../../constructs/Platform/ECR/PlatformDockerResource';
import { ApplicationTargetGroupResource } from '../../constructs/Platform/ApplicationTargetGroupResource';
import { TaskDefinitionResource } from '../../constructs/Platform/TaskDefinitionResource';
import { ApplicationLoadBalancerResource } from '../../constructs/Platform/ApplicationLoadBalancerResource';
import { VpcResource } from '../../constructs/Platform/VpcResource';
import { FargateContainerResource } from '../../constructs/Platform/FargateContainerResource';
import { QueueResource } from '../../constructs/Platform/QueueResource';
import { QueueProcessingFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { RedisCacheClusterResource } from '../../constructs/Platform/RedisCacheClusterResource';
import { PlatformDatabaseResource } from '../../constructs/Platform/RDS/PlatformDatabaseResource';
import { SecurityGroupResource } from '../../constructs/Platform/SecurityGroupResource';
import {Bucket} from "aws-cdk-lib/aws-s3";
import {CfnOutput} from "aws-cdk-lib";

interface PlatformProps extends StackProps {
    APP_ENV: string;
    bucket: Bucket
}

export class ServerSetupStack extends Stack {
    private applicationLoadBalancer: ApplicationLoadBalancerResource;
    constructor(scope: Construct, id: string, props: PlatformProps) {
        super(scope, id, props);

        // VPC
        const SUBNET_APPLICATION = {
            name: 'Application',
            subnetType: SubnetType.PUBLIC,
        };

        const SUBNET_ISOLATED = {
            name: 'RDS-Redis',
            subnetType: SubnetType.PRIVATE_ISOLATED,
        };

        const vpc = new VpcResource(this, 'my-vpc', {
            subnetConfiguration: [SUBNET_APPLICATION, SUBNET_ISOLATED],
        });

        const user = new User(this, 'deployment-user', {});
        AuthorizationToken.grantRead(user);

        const images = {
            application: new PlatformDockerResource(this, 'applicationImage', {
                buildArgs: this.getBuildArgs(true),
                taskType: 'application',
            }),
            init: new PlatformDockerResource(this, 'deploymentImage', {
                buildArgs: this.getBuildArgs(true),
                taskType: 'init',
            }),
            queue: new PlatformDockerResource(this, 'queueImage', {
                buildArgs: this.getBuildArgs(true),
                taskType: 'queue'
            }),
            // scheduler: new PlatformDockerResource(this, 'schedulerImage', {
            //     buildArgs: this.getBuildArgs(true),
            //     taskType: 'scheduler'
            // })
        };

        // SQS and QueueProcessingService
        const schedulerJobQueue = new Queue(this, 'job-queue', {
            queueName: 'scheduler-job-queue'
        });

        const queueCluster = new Cluster(this, 'queue-cluster', {
            clusterName: 'background-tasks',
            vpc,
        });

        // VPC - Private Links
        const ecr = vpc.addInterfaceEndpoint('ecr-gateway', {
            service: InterfaceVpcEndpointAwsService.ECR,
        });

        vpc.addInterfaceEndpoint('ecr-docker-gateway', {
            service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
        });

        const ecs = vpc.addInterfaceEndpoint('ecs-gateway', {
            service: InterfaceVpcEndpointAwsService.ECS,
        });

        const ecsAgent = vpc.addInterfaceEndpoint('ecs-agent-gateway', {
            service: InterfaceVpcEndpointAwsService.ECS_AGENT,
        });

        const ecsTelemetry = vpc.addInterfaceEndpoint('ecs-telemetry-gateway', {
            service: InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
        });

        const sqsEndpoint = vpc.addInterfaceEndpoint('sqs-gateway', {
            service: InterfaceVpcEndpointAwsService.SQS,
        });

        const sm = vpc.addInterfaceEndpoint('secrets-manager', {
            service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        });

        const cw = vpc.addInterfaceEndpoint('cloudwatch', {
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        });

        const alb = new ApplicationLoadBalancerResource(this, 'application-ALB', {
            vpc,
            subnetName: SUBNET_APPLICATION.name,
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

        props.bucket.grantReadWrite(taskRole);

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
            connections: [ecr, ecs, ecsAgent, ecsTelemetry, sm, cw],
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
            isolatedSubnetName: SUBNET_ISOLATED.name,
            vpc,
            APP_ENV: props.APP_ENV,
        });

        const redisResource = new RedisCacheClusterResource(this, 'redis-cluster', {
            allowConnections: [applicationSecurityGroup.getSecurityGroup(), backgroundTasksSecurityGroup],
            vpc,
        });

        const redis = redisResource.getRedis();

        const ssmEnvironment = this.getEnvObject(props.APP_ENV);

        const environment = {
            ...ssmEnvironment,
            DB_HOST: db.getDatabase().dbInstanceEndpointAddress,
            DB_READ_HOST: db.getDatabase().dbInstanceEndpointAddress,
            DB_WRITE_HOST: db.getDatabase().dbInstanceEndpointAddress,
            DB_PORT: db.getDatabase().dbInstanceEndpointPort,
            AWS_BUCKET: props.bucket.bucketName,
            REDIS_HOST: redis.attrRedisEndpointAddress,
            REDIS_PORT: `${redis.port}`,
            SQS_PREFIX: `https://sqs.${props!.env!.region}.amazonaws.com/${this.account}`,
            SQS_QUEUE: schedulerJobQueue.queueName
        };

        new CfnOutput(this, 'scheduler-job-queue-output', {
            value: schedulerJobQueue.queueUrl,
            description: 'SQS Queue URL'
        })

        /**
         * INIT CONTAINER: draait php artisan migrate --force
         * - gebruikt deploy-image
         * - non-essential
         * - app-container hangt ervan af met condition SUCCESS
         */
        const initMigrateContainer = applicationServiceDefinition.addContainer('init-migrate', {
            essential: false, // mag stoppen zonder de hele task te beëindigen
            image: ContainerImage.fromDockerImageAsset(images.init),
            environment,
            logging: LogDriver.awsLogs({
                logGroup: applicationLogGroup,
                streamPrefix: 'init-migrate',
            }),
            entryPoint: ['sh', '-c'],
            command: ['php artisan migrate --force'],
        });

        // APPLICATION CONTAINER
        const applicationContainer = applicationServiceDefinition.addContainer('app-container', {
            cpu: 256,
            environment,
            essential: true,
            image: ContainerImage.fromDockerImageAsset(images.application),
            logging: LogDriver.awsLogs({
                logGroup: applicationLogGroup,
                streamPrefix: new Date().toLocaleDateString('nl-NL'),
            }),
            memoryLimitMiB: 512,
        });

        // App-container pas starten NA succesvolle init-migrate
        applicationContainer.addContainerDependencies({
            container: initMigrateContainer,
            condition: ContainerDependencyCondition.SUCCESS,
        });

        applicationContainer.addPortMappings({
            containerPort: 80,
            hostPort: 80,
            protocol: EcsProtocol.TCP,
        });

        new FargateContainerResource(this, 'application-fargate-service', {
            applicationLogGroup: applicationLogGroup,
            httpTargetGroup: targetGroupHttp,
            image: images.application,
            cluster,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            subnetApplicationName: SUBNET_APPLICATION.name,
            taskDefinition: applicationServiceDefinition,
        });

        // SQS Permissions
        sqsEndpoint.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        sqsEndpoint.connections.allowFrom(applicationSecurityGroup.getSecurityGroup(), Port.tcp(443));

        // Global Accelerator
        const accelerator = new Accelerator(this, 'global-accelerator');

        const acceleratorListener = accelerator.addListener('global-accelerator-listener', {
            portRanges: [{ fromPort: 80 }, { fromPort: 443 }],
        });

        const endpointGroup = acceleratorListener.addEndpointGroup('global-accelerator-listener-alb-group', {
            endpoints: [
                new ApplicationLoadBalancerEndpoint(alb, {
                    preserveClientIp: true,
                }),
            ],
            healthCheckInterval: Duration.seconds(30),
            healthCheckPath: '/up',
            healthCheckProtocol: HealthCheckProtocol.HTTP,
        });

        const acceleratorSecurityGroup = endpointGroup.connectionsPeer('GlobalAcceleratorSG', vpc);

        alb.connections.allowFrom(acceleratorSecurityGroup, Port.tcp(443));

        this.applicationLoadBalancer = alb;

        const queueWorkerLogGroup = new LogGroup(this, 'queue-worker-log-group', {
            logGroupName: 'queue-worker',
            removalPolicy: RemovalPolicy.DESTROY,
            retention: 7
        });


        schedulerJobQueue.grantSendMessages(applicationServiceDefinition.obtainExecutionRole())

        const sqsPolicy = new Policy(this, 'fargate-task-sqs-policy', {
            statements: [
                new PolicyStatement({
                    effect: Effect.ALLOW,
                    actions: ['sqs:*'],
                    resources: [schedulerJobQueue.queueArn],
                }),
            ]
        });

        new QueueResource(this, 'queued-jobs', {
            queueCluster: queueCluster,
            deploymentController: DeploymentControllerType.ECS,
            environment,
            image: images.queue,
            queue: schedulerJobQueue,
            queueLogGroup: queueWorkerLogGroup,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            subnetGroupName: SUBNET_APPLICATION.name,
            resources: {
                sqsPolicy,
                db: db.getDatabase()
            }
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

    getEnvObject(env: string): Record<string, string> {
        const props = [
            'APP_KEY',
            'APP_ENV',
            'APP_URL',
            'DB_PASSWORD',
            'DB_USERNAME',
            'ASSET_URL',
            'FILAMENT_FILESYSTEM_DISK',
            'FILESYSTEM_DISK',
            'BUGSNAG_API_KEY',
            'MAIL_FROM_ADDRESS',
            'MAILGUN_DOMAIN',
            'MAILGUN_SECRET',
            'MAILGUN_ENDPOINT',
            'PHP_CLI_SERVER_WORKERS',
            'BCRYPT_ROUNDS',
            'BROADCAST_CONNECTION',
            'MEMCACHED_HOST',
            'MEILISEARCH_HOST',
            'MEILISEARCH_KEY',
            'APP_COMPANY_NAME',
            'NIGHTWATCH_TOKEN',
            'AWS_CDN_URL',
            'NIGHTWATCH_REQUEST_SAMPLE_RATE',
            'NIGHTWATCH_COMMAND_SAMPLE_RATE',
            'MAILGUN_WEBHOOK_SIGNING_KEY',
            'CHAT_GPT_API_KEY',
            'SLACK_ALERT_WEBHOOK',
            'PADDLE_CLIENT_SIDE_TOKEN',
            'PADDLE_API_KEY',
            'PADDLE_ENVIRONMENT',
            'PADDLE_PRODUCT_ID',
            'VITE_APP_NAME',
            'VITE_API_ENDPOINT',
            'VITE_BANNER_ASSETS_URL',
            'PADDLE_WEBHOOK_SECRET',
            'LAMBDA_WEBHOOKS_SECRET',
            'AWS_LAMBDA_COOKIE_SCANNER_URL',
            'AWS_LAMBDA_WEBSITE_SCRAPER_QUEUE',
            'SETTINGS_CACHE_ENABLED',
            'TURNSTILE_SITE_KEY',
            'TURNSTILE_SECRET_KEY',
            'REDIS_PASSWORD',
            'DB_DATABASE',
            'DB_CONNECTION',
            'QUEUE_CONNECTION'
        ];

        const out = {} as Record<string, string>;

        props.forEach((prop) => {
            out[prop] = StringParameter.fromStringParameterName(
                this,
                `${env}-${prop}`,
                `/cc/${env}/${prop}`,
            ).stringValue;
        });

        return out;
    }

    getApplicationLoadBalancer(){
        return this.applicationLoadBalancer;
    }
}
