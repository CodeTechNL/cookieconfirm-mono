import {Construct} from "constructs"
import { Compatibility, CpuArchitecture, OperatingSystemFamily, TaskDefinition} from 'aws-cdk-lib/aws-ecs';
import {Role} from "aws-cdk-lib/aws-iam";
import {
    GatewayVpcEndpointAwsService, InterfaceVpcEndpoint,
    InterfaceVpcEndpointAwsService, Port, SecurityGroup,
    SubnetConfiguration,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";
import {ApplicationLoadBalancerResource} from "./ApplicationLoadBalancerResource";

type VpcProps = {

}

export class VpcResource extends Construct {
    private readonly vpc: Vpc;
    private readonly ecr: InterfaceVpcEndpoint;
    private readonly ecs: InterfaceVpcEndpoint;
    private readonly ecsAgent: InterfaceVpcEndpoint;
    private readonly ecsTelemetry: InterfaceVpcEndpoint;
    private readonly sqsEndpoint: InterfaceVpcEndpoint;
    private readonly cloudWatch: InterfaceVpcEndpoint;
    private readonly secretsManager: InterfaceVpcEndpoint;

    public readonly SUBNET_APPLICATION = {
        name: 'Application',
        subnetType: SubnetType.PUBLIC,
    };

    public readonly SUBNET_ISOLATED = {
        name: 'RDS-Redis',
        subnetType: SubnetType.PRIVATE_ISOLATED,
    };

    constructor(scope: Construct, id: string) {

        super(scope, id);

        this.vpc = new Vpc(this, 'VpcResource', {
            natGateways: 0,
            subnetConfiguration: [
                this.SUBNET_APPLICATION,
                this.SUBNET_ISOLATED
            ],
            gatewayEndpoints: {
                S3: {
                    service: GatewayVpcEndpointAwsService.S3,
                },
            },
        })

        // VPC - Private Links
        this.ecr = this.getVpc().addInterfaceEndpoint('ecr-gateway', {
            service: InterfaceVpcEndpointAwsService.ECR,
        });

        this.ecs = this.getVpc().addInterfaceEndpoint('ecs-gateway', {
            service: InterfaceVpcEndpointAwsService.ECS,
        });

        this.ecsAgent = this.getVpc().addInterfaceEndpoint('ecs-agent-gateway', {
            service: InterfaceVpcEndpointAwsService.ECS_AGENT,
        });

        this.ecsTelemetry = this.getVpc().addInterfaceEndpoint('ecs-telemetry-gateway', {
            service: InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
        });

        this.sqsEndpoint = this.getVpc().addInterfaceEndpoint('sqs-gateway', {
            service: InterfaceVpcEndpointAwsService.SQS,
        });

        this.secretsManager = this.getVpc().addInterfaceEndpoint('secrets-manager', {
            service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        });

        this.cloudWatch = this.getVpc().addInterfaceEndpoint('cloudwatch', {
            service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
        });

        this.getVpc().addInterfaceEndpoint('ecr-docker-gateway', {
            service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
        });
    }

    getApplicationVpcEndpoints():InterfaceVpcEndpoint[] {
        return [
            this.getEcr(),
            this.getEcs(),
            this.getEcsAgent(),
            this.getEcsTelemetry(),
            this.getCloudWatch(),
            this.getSecretsManager()
        ];
    }

    getVpc(){
        return this.vpc;
    }

    getEcr(){
        return this.ecr;
    }

    getEcs(){
        return this.ecs;
    }

    getEcsAgent(){
        return this.ecsAgent;
    }

    getEcsTelemetry(){
        return this.ecsTelemetry;
    }

    getSqsEndpoint(){
        return this.sqsEndpoint;
    }

    getCloudWatch(){
        return this.cloudWatch;
    }

    getSecretsManager(){
        return this.secretsManager;
    }

    addHttpsConnection(...groups: SecurityGroup[]) {
        const endpoint = this.getSqsEndpoint();

        for (const group of groups) {
            endpoint.connections.allowFrom(group, Port.tcp(443));
        }
    }
}
