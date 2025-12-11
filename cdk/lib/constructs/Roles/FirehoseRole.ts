import {Construct} from "constructs";
import {Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class FirehoseRole extends Role {
    constructor(scope: Construct, id: string) {
        super(scope, id, {
            assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
        });
    }
}
