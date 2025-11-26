import { Stack, StackProps, Environment } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {GlobalAcceleratorTarget, LoadBalancerTarget} from "aws-cdk-lib/aws-route53-targets";
import {Accelerator} from "aws-cdk-lib/aws-globalaccelerator";
import {ApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";

interface DomainSetupProps extends StackProps {
    loadBalancer: ApplicationLoadBalancer
    domain: string
    subdomain: string,
    env: Environment
}

export class DomainSetupStack extends Stack {

    constructor(scope: Construct, id: string, props: DomainSetupProps) {
        super(scope, id, props);

        const {loadBalancer, domain, subdomain} = props;

        const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
            domainName: domain,
        });

        new ARecord(this, 'PlatformARecordViaLoadBalancer', {
            region: props.env.region,
            zone: hostedZone,
            recordName: subdomain, // app.example.com
            target: RecordTarget.fromAlias(
                new LoadBalancerTarget(loadBalancer)
            ),
        });

    }

}
