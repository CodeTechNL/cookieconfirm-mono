import { Construct } from "constructs";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Cluster, DeploymentControllerType, FargatePlatformVersion, FargateService, TaskDefinition } from "aws-cdk-lib/aws-ecs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { DockerImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { ApplicationTargetGroup } from "aws-cdk-lib/aws-elasticloadbalancingv2";

type FargateContainerProps = {
  cluster: Cluster;
  subnetApplicationName: string;
  securityGroup: SecurityGroup;
  taskDefinition: TaskDefinition;
  image: DockerImageAsset;
  applicationLogGroup: LogGroup;
  httpTargetGroup: ApplicationTargetGroup;
};

export class FargateContainerResource extends Construct {
  private readonly fargate: FargateService;

  constructor(scope: Construct, id: string, props: FargateContainerProps) {
    super(scope, id);

    const { cluster, securityGroup, subnetApplicationName, taskDefinition, image, httpTargetGroup, applicationLogGroup } = props;

    this.fargate = new FargateService(this, id, {
      assignPublicIp: true,
      circuitBreaker: {
        rollback: true,
      },
      deploymentController: {
        type: DeploymentControllerType.ECS,
      },
      enableExecuteCommand: true,
      desiredCount: 1,
      cluster,
      platformVersion: FargatePlatformVersion.LATEST,
      securityGroups: [securityGroup],
      taskDefinition: taskDefinition,
      vpcSubnets: {
        subnetGroupName: subnetApplicationName,
      },
    });

    this.getFargate().attachToApplicationTargetGroup(httpTargetGroup);

    image.repository.grantPull(this.getFargate().taskDefinition.obtainExecutionRole());

    this.configAutoScaling();
    this.enableContainerExec();
    this.allowLogManagement(applicationLogGroup);
  }

  allowLogManagement(logGroup: LogGroup) {
    logGroup.grant(this.getFargate().taskDefinition.obtainExecutionRole(), "logs:CreateLogStream");
    logGroup.grant(this.getFargate().taskDefinition.obtainExecutionRole(), "logs:PutLogEvents");
  }

  configAutoScaling() {
    const scaleTarget = this.getFargate().autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    scaleTarget.scaleOnMemoryUtilization("scale-out-memory-threshold", {
      targetUtilizationPercent: 75,
    });

    scaleTarget.scaleOnCpuUtilization("scale-out-cpu-threshold", {
      targetUtilizationPercent: 75,
    });
  }

  enableContainerExec() {
    this.getFargate().taskDefinition.addToExecutionRolePolicy(
      new PolicyStatement({
        actions: ["ssmmessages:*", "ssm:UpdateInstanceInformation", "logs:*"],
        resources: ["*"],
      }),
    );

    this.getFargate().taskDefinition.addToTaskRolePolicy(
      new PolicyStatement({
        actions: ["ssmmessages:*", "ssm:UpdateInstanceInformation", "logs:*"],
        resources: ["*"],
      }),
    );
  }

  getFargate() {
    return this.fargate;
  }
}
