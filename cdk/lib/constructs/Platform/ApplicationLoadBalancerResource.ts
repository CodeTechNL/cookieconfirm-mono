import { Construct } from "constructs";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerAction } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { CfnOutput } from "aws-cdk-lib";
import { VpcResource } from "./VpcResource";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApplicationTargetGroupResource } from "./ApplicationTargetGroupResource";

type ApplicationLoadBalancerProps = {
  vpcResource: VpcResource;
  prefix: string;
  certificateArn: string;
};

export class ApplicationLoadBalancerResource extends Construct {
  private readonly loadBalancer: ApplicationLoadBalancer;

  private readonly loadBalancerSecurityGroup: SecurityGroup;

  private readonly targetGroup: ApplicationTargetGroupResource;

  constructor(scope: Construct, id: string, props: ApplicationLoadBalancerProps) {
    super(scope, id);

    const { vpcResource, prefix, certificateArn } = props;

    this.loadBalancer = new ApplicationLoadBalancer(scope, `id`, {
      http2Enabled: false,
      internetFacing: true,
      loadBalancerName: "application",
      vpc: vpcResource.getVpc(),
      vpcSubnets: {
        subnetGroupName: vpcResource.SUBNET_APPLICATION.name,
      },
    });

    this.loadBalancerSecurityGroup = new SecurityGroup(this, `${prefix}LoadBalancerSG`, {
      vpc: vpcResource.getVpc(),
      allowAllOutbound: true,
    });

    this.getLoadBalancer().addSecurityGroup(this.getLoadBalancerSecurityGroup());

    const certificate = Certificate.fromCertificateArn(this, `${prefix}AlbCertificate`, certificateArn);

    // HTTPS listener op 443 met certificaat
    const httpsListener = this.getLoadBalancer().addListener(`${prefix}AlbHttpsListener`, {
      open: true,
      port: 443,
      protocol: ApplicationProtocol.HTTPS,
      certificates: [certificate],
    });

    // Target group voor de app
    this.targetGroup = new ApplicationTargetGroupResource(this, `${prefix}AlbTargetGroup`, {
      vpc: vpcResource.getVpc(),
    });

    httpsListener.addTargetGroups(`${prefix}AlbListenerTargetGroup`, {
      targetGroups: [this.getHttpTargetGroup()],
    });

    this.getLoadBalancer().addListener(`${prefix}AlbTargetGroup`, {
      port: 80,
      open: true,
      protocol: ApplicationProtocol.HTTP,
      defaultAction: ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
        permanent: true, // 301
      }),
    });

    new CfnOutput(this, `${prefix}ApplicationLoadBalancerResource`, {
      value: this.getLoadBalancer().loadBalancerDnsName,
      description: "Application load balancer URL",
    });
  }

  getLoadBalancer() {
    return this.loadBalancer;
  }

  getLoadBalancerSecurityGroup(): SecurityGroup {
    return this.loadBalancerSecurityGroup;
  }

  getHttpTargetGroup() {
    return this.targetGroup;
  }
}
