import {Construct} from "constructs"
import { Compatibility, CpuArchitecture, OperatingSystemFamily, TaskDefinition} from 'aws-cdk-lib/aws-ecs';
import {Role} from "aws-cdk-lib/aws-iam";
import {GatewayVpcEndpointAwsService, SubnetConfiguration, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";

type VpcProps = {
    subnetConfiguration: SubnetConfiguration[]
}

export class VpcResource extends Vpc {
    constructor(scope: Construct, id: string, props: VpcProps) {

        const {subnetConfiguration} = props;

        const baseProps = {
            natGateways: 0,
            subnetConfiguration: subnetConfiguration,
            gatewayEndpoints: {
                S3: {
                    service: GatewayVpcEndpointAwsService.S3,
                },
            },
        }

        super(scope, id, baseProps);
    }
}
