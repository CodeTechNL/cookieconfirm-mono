import {Construct} from "constructs"
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {LoadBalancerTarget} from "aws-cdk-lib/aws-route53-targets";
import {ApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {ApplicationType} from "../../types/ApplicationType";

type DomainProps = {
    loadBalancer: ApplicationLoadBalancer
    stage: ApplicationType
}

export class DomainResource extends Construct {
    constructor(scope: Construct, id: string, props: DomainProps) {
        super(scope, id);

        const {loadBalancer} = props;

        const appMainDomain = StringParameter.valueFromLookup(
            this,
            `/cc/${props.stage}/APP_MAIN_DOMAIN`,
        );

        const appSubDomain = StringParameter.valueFromLookup(
            this,
            `/cc/${props.stage}/APP_SUBDOMAIN`,
        );

        const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
            domainName: appMainDomain,
        });

        new ARecord(this, 'PlatformARecordViaLoadBalancer', {
            region: 'eu-west-3',
            zone: hostedZone,
            recordName: appSubDomain,
            target: RecordTarget.fromAlias(
                new LoadBalancerTarget(loadBalancer)
            ),
        });
    }
}
