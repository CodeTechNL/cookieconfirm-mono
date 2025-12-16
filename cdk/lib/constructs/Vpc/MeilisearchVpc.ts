import {SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {Construct} from "constructs";

type MeilisearchVpcProps = {
    resourcePrefix: string;
}
export class MeilisearchVpc extends Vpc {
    constructor(scope: Construct, id: string, props: MeilisearchVpcProps) {
        const {resourcePrefix} = props;

        super(scope, id, {
            vpcName: `${resourcePrefix}-meilisearch-vpc`,
            natGateways: 0,
            subnetConfiguration: [
                {
                    name: `${resourcePrefix}-meilisearch-isolated`,
                    subnetType: SubnetType.PRIVATE_ISOLATED,
                    cidrMask: 24,
                },
            ],
        });
    }
}