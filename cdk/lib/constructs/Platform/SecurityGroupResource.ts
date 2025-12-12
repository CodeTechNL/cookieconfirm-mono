import { Construct } from "constructs";
import { IConnectable, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { VpcResource } from "./VpcResource";

type SecurityGroupProps = {
  vpcResource: VpcResource;
  loadBalancerSecurityGroup?: SecurityGroup;
  prefix: string;
};

export class SecurityGroupResource extends Construct {
  private readonly securityGroup: SecurityGroup;
  constructor(scope: Construct, id: string, props: SecurityGroupProps) {
    super(scope, id);

    const { vpcResource, loadBalancerSecurityGroup, prefix } = props;

    this.securityGroup = new SecurityGroup(this, `${prefix}ApplicationSG`, {
      vpc: vpcResource.getVpc(),
      description: "SecurityGroup into which application ECS tasks will be deployed",
      allowAllOutbound: true,
    });

    if (loadBalancerSecurityGroup) {
      this.getSecurityGroup().connections.allowFrom(loadBalancerSecurityGroup, Port.allTcp(), "Load Balancer ingress All TCP");
    }

    vpcResource.getApplicationVpcEndpoints().forEach((connection: IConnectable) => {
      connection.connections.allowFrom(this.getSecurityGroup(), Port.tcp(443));
    });
  }

  getSecurityGroup() {
    return this.securityGroup;
  }
}
