import { Construct } from "constructs";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { ApplicationProtocol, ApplicationTargetGroup, Protocol, TargetType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Duration } from "aws-cdk-lib/core";

type ApplicationTargetGroupProps = {
  vpc: Vpc;
};

export class ApplicationTargetGroupResource extends ApplicationTargetGroup {
  constructor(scope: Construct, id: string, props: ApplicationTargetGroupProps) {
    const { vpc } = props;

    const baseProps = {
      port: 80,
      protocol: ApplicationProtocol.HTTP,
      targetType: TargetType.IP,
      vpc,
    };

    super(scope, id, baseProps);

    // Health check for containers to check they were deployed correctly
    this.configureHealthCheck({
      path: "/up",
      protocol: Protocol.HTTP,
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 4,
      interval: Duration.seconds(15),
      timeout: Duration.seconds(5),
    });
  }
}
