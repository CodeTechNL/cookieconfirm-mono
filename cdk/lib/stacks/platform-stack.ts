import {DockerBuildSecret, Duration, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib/core';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal, User } from 'aws-cdk-lib/aws-iam';
import { AuthorizationToken } from 'aws-cdk-lib/aws-ecr';
import {DockerImageAsset, Platform} from 'aws-cdk-lib/aws-ecr-assets';
import {
    GatewayVpcEndpointAwsService, InstanceClass, InstanceSize,
    InstanceType,
    InterfaceVpcEndpointAwsService,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc
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
    OperatingSystemFamily, CpuArchitecture,
    Secret
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ApplicationProtocol, ApplicationTargetGroup, Protocol, TargetType } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Accelerator, HealthCheckProtocol } from 'aws-cdk-lib/aws-globalaccelerator';
import { ApplicationLoadBalancerEndpoint } from 'aws-cdk-lib/aws-globalaccelerator-endpoints';
import {Construct} from "constructs"
import {fromRoot} from "../helpers";
import { DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion } from "aws-cdk-lib/aws-rds";
import {CfnCacheCluster, CfnSubnetGroup} from "aws-cdk-lib/aws-elasticache";
import {PlatformDockerResource} from "../constructs/Platform/ECR/PlatformDockerResource";
import {ApplicationTargetGroupResource} from "../constructs/Platform/ApplicationTargetGroupResource";
import {TaskDefinitionResource} from "../constructs/Platform/TaskDefinitionResource";
import {ApplicationLoadBalancerResource} from "../constructs/Platform/ApplicationLoadBalancerResource";
import {VpcResource} from "../constructs/Platform/VpcResource";
import {FargateContainerResource} from "../constructs/Platform/FargateContainerResource";
import {QueueResource} from "../constructs/Platform/QueueResource";
import {QueueProcessingFargateService} from "aws-cdk-lib/aws-ecs-patterns";
import {Queue} from "aws-cdk-lib/aws-sqs";
import {RedisCacheClusterResource} from "../constructs/Platform/RedisCacheClusterResource";
import {PlatformDatabaseResource} from "../constructs/Platform/RDS/PlatformDatabaseResource";
import {SecurityGroupResource} from "../constructs/Platform/SecurityGroupResource";

export class PlatformStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        const user = new User(this, 'deployment-user', {});
        AuthorizationToken.grantRead(user);

        const images = {
            application: new PlatformDockerResource(this, 'applicationImage', {
                buildArgs: this.getBuildArgs(true),
                taskType: 'application'
            }),
            // queue: new PlatformDockerResource(this, 'queueImage', {
            //     buildArgs: this.getBuildArgs(true),
            //     taskType: 'queue'
            // }),
            // scheduler: new PlatformDockerResource(this, 'schedulerImage', {
            //     buildArgs: this.getBuildArgs(true),
            //     taskType: 'scheduler'
            // })
        }


        // VPC
        const SUBNET_APPLICATION = {
            name: 'Application',
            subnetType: SubnetType.PUBLIC
        };

        const SUBNET_ISOLATED = {
            name: 'RDS-Redis',
            subnetType: SubnetType.PRIVATE_ISOLATED
        };

        const vpc = new VpcResource(this, 'my-vpc', {
            subnetConfiguration: [
                SUBNET_APPLICATION,
                // SUBNET_BACKGROUND_TASKS,
                SUBNET_ISOLATED,
            ],
        })

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

        // need to add private link for secrets manager
        const sm = vpc.addInterfaceEndpoint('secrets-manager', {
            service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER
        });

        // need to add private link for cloudwatch
        const cw = vpc.addInterfaceEndpoint('cloudwatch', {
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS
        });

        const alb =  new ApplicationLoadBalancerResource(this, 'application-ALB', {
            vpc,
            subnetName: SUBNET_APPLICATION.name
        })

        const loadBalancerSecurityGroup = new SecurityGroup(this, 'load-balancer-SG', {
            vpc,
            allowAllOutbound: true,
        });

        alb.addSecurityGroup(loadBalancerSecurityGroup);

        // For HTTPS you need to set up an ACM and reference it here
        const listener = alb.addListener('alb-target-group', {
            open: true,
            port: 80
        });


        const targetGroupHttp =  new ApplicationTargetGroupResource(this,'alb-target-group', {
            vpc: vpc
        })

        // Add target group to listener
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
            retention: 30
        });

        applicationLogGroup.grant(user, 'logs:CreateLogGroup');

        const taskRole = new Role(this, 'fargate-task-role', {
            assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
            roleName: 'application-fargate-task-role',
            description: 'Role that the api task definitions use to run the api code',
        });

        const applicationServiceDefinition = new TaskDefinitionResource(this, 'application-fargate-service-definition', {
            taskRole: taskRole
        })


        const applicationSecurityGroup = new SecurityGroupResource(this, 'application-SG', {
            vpc,
            description: 'SecurityGroup into which application ECS tasks will be deployed',
            connections: [ecr, ecs, ecsAgent, ecsTelemetry, sm, cw],
            loadBalancerSecurityGroup,
        })



        // Behouden


        const backgroundTasksSecurityGroup = new SecurityGroup(this, 'background-task-SG', {
            vpc,
            description: 'SecurityGroup into which scheduler ECS tasks will be deployed',
            allowAllOutbound: true
        });
        // ecr.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        // ecs.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        // ecsAgent.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        // ecsTelemetry.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        // sm.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        // cw.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));

        const db = new PlatformDatabaseResource(this, 'Platform-DatabaseResource', {
            allowGroups: [
                applicationSecurityGroup.getSecurityGroup(),
                backgroundTasksSecurityGroup
            ],
            databaseName: "cookie-confirm-sample",
            isolatedSubnetName: SUBNET_ISOLATED.name,
            vpc

        })

        const redisResource = new RedisCacheClusterResource(this, 'redis-cluster', {
            allowConnections: [
                applicationSecurityGroup.getSecurityGroup(),
                backgroundTasksSecurityGroup
            ],
            vpc
        });

        const redis = redisResource.getRedis();

        // This is specific for laravel application used in examples
        const environment = {
            APP_KEY: "base64:bSZmKaIk7Xg1vMvI3M6B5IMV9Wjp2W5SA52/Z39d7L8=",
            APP_ENV: "production",
            APP_URL: "http://example.com",
            LOG_CHANNEL: 'stack',
            LOG_LEVEL: 'debug',
            DB_CONNECTION: 'mysql',
            DB_HOST: db.getDatabase().dbInstanceEndpointAddress,
            DB_READ_HOST: db.getDatabase().dbInstanceEndpointAddress,
            DB_WRITE_HOST: db.getDatabase().dbInstanceEndpointAddress,
            DB_PORT: db.getDatabase().dbInstanceEndpointPort,
            CACHE_DRIVER: 'redis',
            REDIS_HOST: redis.attrRedisEndpointAddress,
            REDIS_PASSWORD: 'null',
            REDIS_PORT: '6379',
            // SOME: StringParameter.fromStringParameterName(
            //     this,
            //     'DbName',
            //     '/cc/local/DB_NAME'
            // ).stringValue;
        };

        const applicationContainer = applicationServiceDefinition.addContainer('app-container', {
            cpu: 256,
            environment,
            essential: true,
            image: ContainerImage.fromDockerImageAsset(images.application),
            logging: LogDriver.awsLogs({
                logGroup: applicationLogGroup,
                streamPrefix: new Date().toLocaleDateString('en-ZA')
            }),
            memoryLimitMiB: 512,
            secrets: {
                DB_DATABASE: Secret.fromSecretsManager(db.getDatabase().secret!, 'dbname'),
                DB_USERNAME: Secret.fromSecretsManager(db.getDatabase().secret!, 'username'),
                DB_PASSWORD: Secret.fromSecretsManager(db.getDatabase().secret!, 'password'),
            }
        });

        applicationContainer.addPortMappings({
            containerPort: 80,
            hostPort: 80,
            protocol: EcsProtocol.TCP
        });


        const applicationService = new FargateContainerResource(this, 'application-fargate-service', {
            applicationLogGroup: applicationLogGroup,
            httpTargetGroup: targetGroupHttp,
            image: images.application,
            cluster,
            securityGroup: applicationSecurityGroup.getSecurityGroup(),
            subnetApplicationName: SUBNET_APPLICATION.name,
            taskDefinition: applicationServiceDefinition
        })



        // Allow ECS to grab the images to spin up new containers

        // SQS Permissions
        sqsEndpoint.connections.allowFrom(backgroundTasksSecurityGroup, Port.tcp(443));
        sqsEndpoint.connections.allowFrom(applicationSecurityGroup.getSecurityGroup(), Port.tcp(443));


        // Log Permissions



        // Create an Accelerator
        const accelerator = new Accelerator(this, 'global-accelerator');

        // Create a Listener
        const acceleratorListener = accelerator.addListener('global-accelerator-listener', {
            portRanges: [
                { fromPort: 80 },
                { fromPort: 443 },
            ],
        });

        const endpointGroup = acceleratorListener.addEndpointGroup('global-accelerator-listener-alb-group', {
            endpoints: [
                new ApplicationLoadBalancerEndpoint(alb, {
                    preserveClientIp: true,
                })
            ],
            healthCheckInterval: Duration.seconds(30),
            healthCheckPath: '/up',
            healthCheckProtocol: HealthCheckProtocol.HTTP
        });

        // Remember that there is only one AGA security group per VPC.
        const acceleratorSecurityGroup = endpointGroup.connectionsPeer('GlobalAcceleratorSG', vpc);

        // Allow connections from the AGA to the ALB
        alb.connections.allowFrom(acceleratorSecurityGroup, Port.tcp(443));

        // const backgroundCluster = new Cluster(this, 'scheduler-cluster', {
        //     clusterName: 'background-tasks',
        //     vpc,
        // });
        //
        // const queueWorkerLogGroup = new LogGroup(this, 'queue-worker-log-group', {
        //     logGroupName: 'queue-worker',
        //     removalPolicy: RemovalPolicy.DESTROY,
        //     retention: 7
        // });

        // // SQS and QueueProcessingService
        // const schedulerJobQueue = new Queue(this, 'job-queue', {
        //     queueName: 'scheduler-job-queue'
        // });
        //
        // const sqsPolicy = new Policy(this, 'fargate-task-sqs-policy', {
        //     statements: [
        //         new PolicyStatement({
        //             effect: Effect.ALLOW,
        //             actions: ['sqs:*'],
        //             resources: [schedulerJobQueue.queueArn],
        //         }),
        //     ]
        // });

        // new QueueResource(this, 'queued-jobs', {
        //     backgroundCluster: backgroundCluster,
        //     deploymentController: DeploymentControllerType.ECS,
        //     environment,
        //     image: images.queue,
        //     queue: schedulerJobQueue,
        //     queueLogGroup: queueWorkerLogGroup,
        //     securityGroup: applicationSecurityGroup,
        //     subnetGroupName: SUBNET_APPLICATION.name,
        //     resources: {
        //         sqsPolicy,
        //         db
        //     }
        // })

    }

    getBuildArgs(withArgs: boolean = false): any{
        return !withArgs ? {} : {
            "AWS_ACCESS_KEY_ID": process.env.AWS_ACCESS_KEY_ID,
            "AWS_SECRET_ACCESS_KEY": process.env.AWS_SECRET_ACCESS_KEY,
            "AWS_REGION": process.env.AWS_REGION,
        }
    }
}