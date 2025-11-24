import {Construct} from "constructs"
import { Compatibility, CpuArchitecture, OperatingSystemFamily, TaskDefinition} from 'aws-cdk-lib/aws-ecs';
import {Role} from "aws-cdk-lib/aws-iam";
import {
    Connections,
    GatewayVpcEndpointAwsService, IConnectable,
    Port,
    SecurityGroup,
    SubnetConfiguration,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";
import {Connection} from "aws-cdk-lib/aws-events";

type SecurityGroupProps = {
    vpc: Vpc,
    connections: IConnectable[]
    description: string
    loadBalancerSecurityGroup?: SecurityGroup
}

export class SecurityGroupResource extends Construct {
    private readonly securityGroup: SecurityGroup;
    constructor(scope: Construct, id: string, props: SecurityGroupProps) {
        super(scope, id);

        const {vpc, connections, description, loadBalancerSecurityGroup} = props;

        this.securityGroup = new SecurityGroup(this, id, {
            vpc,
            description,
            allowAllOutbound: true
        });

        if(loadBalancerSecurityGroup){
            this.getSecurityGroup().connections.allowFrom(loadBalancerSecurityGroup, Port.allTcp(), 'Load Balancer ingress All TCP');
        }

        connections.forEach((connection: IConnectable) => {
            connection.connections.allowFrom(this.getSecurityGroup(), Port.tcp(443));
        })
    }

    getSecurityGroup(){
        return this.securityGroup;
    }
}
