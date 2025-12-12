import { Construct } from "constructs";
import { GatewayVpcEndpointAwsService, InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";

type VpcProps = {
  prefix: string;
};

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
    name: "Application",
    subnetType: SubnetType.PUBLIC,
  };

  public readonly SUBNET_ISOLATED = {
    name: "RDS-Redis",
    subnetType: SubnetType.PRIVATE_ISOLATED,
  };

  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id);

    const { prefix } = props;

    this.vpc = new Vpc(this, `${prefix}VpcResource`, {
      natGateways: 0,
      subnetConfiguration: [this.SUBNET_APPLICATION, this.SUBNET_ISOLATED],
      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
        },
      },
    });

    // VPC - Private Links
    this.ecr = this.getVpc().addInterfaceEndpoint("ecr-gateway", {
      service: InterfaceVpcEndpointAwsService.ECR,
    });

    this.ecs = this.getVpc().addInterfaceEndpoint("ecs-gateway", {
      service: InterfaceVpcEndpointAwsService.ECS,
    });

    this.ecsAgent = this.getVpc().addInterfaceEndpoint(`${prefix}EcsAgentGateway`, {
      service: InterfaceVpcEndpointAwsService.ECS_AGENT,
    });

    this.ecsTelemetry = this.getVpc().addInterfaceEndpoint(`${prefix}EcsTelemetryGateway`, {
      service: InterfaceVpcEndpointAwsService.ECS_TELEMETRY,
    });

    this.sqsEndpoint = this.getVpc().addInterfaceEndpoint(`${prefix}SqsGateway`, {
      service: InterfaceVpcEndpointAwsService.SQS,
    });

    this.secretsManager = this.getVpc().addInterfaceEndpoint(`${prefix}SecretsManager`, {
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    this.cloudWatch = this.getVpc().addInterfaceEndpoint(`${prefix}Cloudwatch`, {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });

    this.getVpc().addInterfaceEndpoint(`${prefix}EcrDockerGateway`, {
      service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });
  }

  getApplicationVpcEndpoints(): InterfaceVpcEndpoint[] {
    return [this.getEcr(), this.getEcs(), this.getEcsAgent(), this.getEcsTelemetry(), this.getCloudWatch(), this.getSecretsManager()];
  }

  getVpc() {
    return this.vpc;
  }

  getEcr() {
    return this.ecr;
  }

  getEcs() {
    return this.ecs;
  }

  getEcsAgent() {
    return this.ecsAgent;
  }

  getEcsTelemetry() {
    return this.ecsTelemetry;
  }

  getSqsEndpoint() {
    return this.sqsEndpoint;
  }

  getCloudWatch() {
    return this.cloudWatch;
  }

  getSecretsManager() {
    return this.secretsManager;
  }

  addHttpsConnection(...groups: SecurityGroup[]) {
    const endpoint = this.getSqsEndpoint();

    for (const group of groups) {
      endpoint.connections.allowFrom(group, Port.tcp(443));
    }
  }
}
