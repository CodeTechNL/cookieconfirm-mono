import {Construct} from "constructs"
import { Compatibility, CpuArchitecture, OperatingSystemFamily, TaskDefinition} from 'aws-cdk-lib/aws-ecs';
import {Role} from "aws-cdk-lib/aws-iam";
import {GatewayVpcEndpointAwsService, SubnetConfiguration, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {Queue} from "aws-cdk-lib/aws-sqs";

type PermissionProps = {
    queue: Queue
}

export class PermissionResource extends Construct {
    constructor(scope: Construct, id: string, props: PermissionProps) {
        super(scope, id);

        const {queue} = props;

    }
}
