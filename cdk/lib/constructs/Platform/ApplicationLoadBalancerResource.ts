import {Construct} from "constructs"
import {Vpc} from "aws-cdk-lib/aws-ec2";
import {ApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {CfnOutput} from "aws-cdk-lib";
import {VpcResource} from "./VpcResource";


type ApplicationLoadBalancerProps = {
    vpcResource: VpcResource
}

export class ApplicationLoadBalancerResource extends ApplicationLoadBalancer {
    constructor(scope: Construct, id: string, props: ApplicationLoadBalancerProps) {

        const {vpcResource} = props;
        
        const baseProps = {
            http2Enabled: false,
            internetFacing: true,
            loadBalancerName: 'application',
            vpc: vpcResource.getVpc(),
            vpcSubnets: {
                subnetGroupName: vpcResource.SUBNET_APPLICATION.name
            }
        };

        super(scope, id, baseProps);

        new CfnOutput(this, 'ApplicationLoadBalancerResource', {
            value: this.loadBalancerDnsName,
            description: "Application load balancer URL"
        })
    }
}
