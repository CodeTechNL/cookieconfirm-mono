import {Construct} from "constructs"
import {Vpc} from "aws-cdk-lib/aws-ec2";
import {ApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {CfnOutput} from "aws-cdk-lib";


type ApplicationLoadBalancerProps = {
    vpc: Vpc
    subnetName: string
}

export class ApplicationLoadBalancerResource extends ApplicationLoadBalancer {
    constructor(scope: Construct, id: string, props: ApplicationLoadBalancerProps) {

        const {subnetName, vpc} = props;
        
        const baseProps = {
            http2Enabled: false,
            internetFacing: true,
            loadBalancerName: 'application',
            vpc,
            vpcSubnets: {
                subnetGroupName: subnetName
            }
        };

        super(scope, id, baseProps);

        new CfnOutput(this, 'ApplicationLoadBalancerResource', {
            value: this.loadBalancerDnsName,
            description: "Application load balancer URL"
        })
    }
}
